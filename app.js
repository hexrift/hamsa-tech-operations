import {findShipment} from './lib/tracking.mjs';

const form=document.querySelector('[data-tracking-form]');
const input=document.querySelector('#shipment-reference');
const result=document.querySelector('[data-tracking-result]');
const message=document.querySelector('[data-tracking-message]');
const revision=document.querySelector('[data-revision]');

function element(tag,className,content){const node=document.createElement(tag);if(className)node.className=className;if(content!==undefined)node.textContent=content;return node;}

async function loadRevision(){try{const response=await fetch('./build.json',{cache:'no-store'});const build=await response.json();revision.textContent=typeof build.commit==='string'?build.commit.slice(0,7):'unavailable';}catch{revision.textContent='unavailable';}}

async function search(reference){
  result.dataset.trackingState='loading';
  message.textContent='Retrieving shipment…';
  let shipments;
  try { const response=await fetch('./data/shipments.json',{cache:'no-store'});if(!response.ok)throw new Error('source unavailable');shipments=await response.json(); }
  catch { result.replaceChildren();result.dataset.trackingState='unavailable';message.textContent='Tracking is temporarily unavailable. Please try again.';return; }
  const shipment=findShipment(shipments,reference);
  if(!shipment){result.replaceChildren();result.dataset.trackingState='not-found';message.textContent='We could not find that reference. Check the number and try again.';return;}
  message.textContent='';
  const header=element('div','result-top');
  header.append(element('span','result-reference',shipment.reference),element('span','result-status',shipment.status));
  const route=element('div','result-route');
  route.append(element('strong','',shipment.origin),element('span','','→'),element('strong','',shipment.destination));
  const meta=element('div','result-meta');
  meta.append(element('span','',`SERVICE  ${shipment.service}`),element('span','',`EXPECTED  ${shipment.expected}`));
  const milestones=element('ol','milestone-list');
  for(const step of shipment.milestones){const item=element('li',step.complete?'complete':'upcoming');item.append(element('span','milestone-dot'),element('span','',step.label));milestones.append(item);}
  result.replaceChildren(header,route,meta,milestones);
  result.dataset.trackingState='ready';
  result.dataset.shipmentReference=shipment.reference;
}

form.addEventListener('submit',event=>{event.preventDefault();const reference=input.value.trim();if(!reference)return;history.replaceState(null,'',`?ref=${encodeURIComponent(reference)}#track`);search(reference);});
const initial=new URLSearchParams(location.search).get('ref');if(initial){input.value=initial;search(initial);}loadRevision();
