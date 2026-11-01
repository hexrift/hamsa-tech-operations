import {mkdirSync,cpSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join,resolve} from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist = join(root,'dist');
mkdirSync(join(dist,'assets'),{recursive:true});
for (const file of ['index.html','operations.html','styles.css','app.js','operations.js']) cpSync(join(root,file),join(dist,file));
cpSync(join(root,'lib'),join(dist,'lib'),{recursive:true});
cpSync(join(root,'data'),join(dist,'data'),{recursive:true});
for (const file of ['serif.woff2','serif-italic.woff2','sans.woff2','inter-LICENSE.txt','instrument-serif-LICENSE.txt']) cpSync(join(root,'assets',file),join(dist,'assets',file));
let commit = process.env.GITHUB_SHA;
if (!commit) { try { commit = execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(); } catch { commit = 'unavailable'; } }
const build = {commit, builtAt:new Date().toISOString(), environment:'controlled staging'};
writeFileSync(join(dist,'build.json'),JSON.stringify(build,null,2)+'\n');
console.log(`Built staging portal at ${dist} from ${commit.slice(0,7)}`);
