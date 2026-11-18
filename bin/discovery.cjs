#!/usr/bin/env node
// Describe files by their names. Discovery never evaluates project manifests.
const {readFileSync} = require('node:fs');
const files = ["Gemfile"];
const protocol = 'lekalo/runtime/v1';
const id = 'lekalo-ruby';

function inspect(input) {
  if (input.schema !== 'lekalo/discovery/v1' || !Array.isArray(input.files) || input.files.length > 10000) throw Error('discovery input');
  const result = {schema:'lekalo/discovery/v1', manifests:[], managers:[], hints:[], workspaces:[], tools:[], gates:[], modules:[], names:[], refused:[]};
  for (const {path} of input.files) {
    const name = path.split('/').pop();
    if (!files.includes(name)) continue;
    result.manifests.push({path, detail:'ruby'});
    result.hints.push({path,label:'ruby',kind:'language',field:null,confidence:'medium'});
  }
  return result;
}

const req = JSON.parse(readFileSync(0,'utf8'));
if (req.protocol !== protocol || !/^sha256:[a-f0-9]{64}$/.test(req.request_id)) throw Error('protocol');
let result;
switch (req.operation) {
  case 'describe':
    result = {id, version:'0.1.0', operations:['discovery.describe','discovery.inspect'], capabilities:['discovery/v1'], rules_api:[]};
    break;
  case 'discovery.describe':
    result = {schema:'lekalo/discovery/v1', files, reads:[]};
    break;
  case 'discovery.inspect':
    result = inspect(req.input);
    break;
  default:
    throw Error('unsupported operation');
}
process.stdout.write(JSON.stringify({protocol,request_id:req.request_id,result}));
