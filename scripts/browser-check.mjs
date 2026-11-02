import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {activeShipments} from '../lib/tracking.mjs';

const shipments=JSON.parse(readFileSync(new URL('../data/shipments.json',import.meta.url)));
const active=activeShipments(shipments);
const requested=process.env.CHECK_REFERENCE;
if (requested!==undefined && !active.some(item=>item.reference===requested)) throw new Error('Unsupported shipment reference');
const targets=requested===undefined?active:active.filter(item=>item.reference===requested);
if (targets.length===0) throw new Error('No active shipment references to verify');
const chrome=process.env.CHROME_BIN ?? 'google-chrome';
const evidence=resolve('browser-check');
mkdirSync(evidence,{recursive:true});

const receipts=targets.map(shipment=>{
  const reference=shipment.reference;
  const url=process.env.SITE_URL ?? `http://127.0.0.1:4173/?ref=${reference}`;
  const result=spawnSync(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--virtual-time-budget=18000','--dump-dom',url],{encoding:'utf8',timeout:35000,maxBuffer:5*1024*1024});
  const rendered=result.stdout ?? '';
  writeFileSync(resolve(evidence,`rendered-${reference}.html`),rendered);
  writeFileSync(resolve(evidence,`chrome-stderr-${reference}.txt`),result.stderr ?? '');
  const complete=/data-tracking-state="ready"/.test(rendered);
  const hasReference=rendered.includes(`data-shipment-reference="${reference}"`);
  const hasDestination=rendered.includes(shipment.destination);
  const passed=result.status===0 && complete && hasReference && hasDestination;
  return {reference,url,checkedAt:new Date().toISOString(),passed,rendered:complete,shipmentReference:hasReference?reference:null,destinationVisible:hasDestination,chromeExit:result.status,error:result.error?.message ?? null};
});
const passed=receipts.every(receipt=>receipt.passed);
const summary={checkedAt:new Date().toISOString(),passed,activeReferences:active.map(item=>item.reference),checked:receipts};
writeFileSync(resolve(evidence,'receipt.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));
if (!passed) process.exitCode=1;
