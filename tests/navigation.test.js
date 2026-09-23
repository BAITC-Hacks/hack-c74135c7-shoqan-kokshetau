import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source=(await readFile(new URL('../public/app.js',import.meta.url),'utf8'))
  .replace(/^import .*?;\r?\n/gm,'')
  .replace(/void route\(\);\s*$/,'');

// Run the actual frontend handlers with a minimal DOM and isolated HTTP responses.
function frontend() {
  const listeners={};
  const app={addEventListener:(name,handler)=>{listeners[name]=handler;}};
  const context=vm.createContext({
    accountMessages:{kk:{},ru:{}},localStorage:{getItem:()=>null,setItem(){}},
    document:{querySelector:selector=>selector==='#app'?app:selector==='.skip'?{addEventListener(){}}:null},
    window:{addEventListener(){},scrollTo(){}},location:{hash:'#catalog'},
    confirm:()=>{throw new Error('Unexpected confirmation');},
    setTimeout,clearTimeout,URL,
  });
  vm.runInContext(source,context);
  vm.runInContext('shell=content=>{globalThis.rendered=content;};',context);
  return {context,listeners,run:code=>vm.runInContext(code,context)};
}

test('failed routes stay on the translated error page instead of showing stale task data',async()=>{
  for(const path of ['edit/missing','task/missing','proposals/missing','catalog','mine','outbox']){
    const {context,run}=frontend();
    context.location.hash=`#${path}`;
    context.fetch=async url=>({ok:url==='/api/auth/me',status:404,json:async()=>url==='/api/auth/me'?{user:{name:'User'}}:{}});
    run("current={id:'previous-private-task'};tasks=[current];proposals=[{id:'previous-proposal'}];");
    await run('route()');
    assert.equal(run('current'),null);
    assert.equal(run('tasks.length + proposals.length'),0);
    await run("switchLanguage('ru')");
    assert.match(context.rendered,/Задача не найдена/);
    assert.doesNotMatch(context.rendered,/previous-private-task/);
    await run("switchLanguage('kk')");
    assert.match(context.rendered,/Тапсырма табылмады/);
  }
});

test('clicking the current navigation link preserves unsaved-change protection',()=>{
  const {run,listeners}=frontend();
  run("page='new';dirty=true;");
  let prevented=false;
  const link={getAttribute:()=> '#new'};
  listeners.click({target:{closest:()=>link},preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  assert.equal(run('dirty'),true);
});

test('a late session response cannot overwrite the session on a newer page',async()=>{
  const {context,run}=frontend();
  let finishFirst;
  let calls=0;
  context.fetch=()=>++calls===1?new Promise(resolve=>{finishFirst=resolve;}):Promise.resolve({ok:true,json:async()=>({user:{name:'Latest'}})});
  context.location.hash='#new';
  run('newPage=()=>{};');
  const first=run('route()');
  context.location.hash='#register';
  run('authPage=()=>{};');
  await run('route()');
  finishFirst({ok:true,json:async()=>({user:{name:'Stale'}})});
  await first;
  assert.equal(run('user.name'),'Latest');
  assert.equal(run('page'),'register');
});

test('publication guidance requires a title and confirmation only for nonempty fields',()=>{
  const {run}=frontend();
  run("globalThis.values=Object.fromEntries(fields.map(name=>[name,{value:'',confirmed:false}]));");
  assert.equal(run('publicationIssues(values).missingTitle'),true);
  run("values.title={value:'Local project',confirmed:true};values.context={value:'   ',confirmed:false};");
  assert.equal(run('publicationIssues(values).missingTitle'),false);
  assert.equal(run('publicationIssues(values).unconfirmed.length'),0);
  run("values.context.value='Help our shop';values.contact.value='team@example.test';");
  assert.equal(run("publicationIssues(values).unconfirmed.join(',')"),'context,contact');
});

test('editor guidance updates after typing, confirming and clearing a field',()=>{
  const {context,run,listeners}=frontend();
  const names=['title','context','users','data','expectedResult','successCriteria','constraints','contact'];
  const nodes={'#publish-readiness':{innerHTML:'',insertAdjacentHTML(_position,html){this.innerHTML+=html;}},'#reviewed':{checked:true}};
  run("current={rating:{breakdown:fields.filter(name=>name!=='title').map(field=>({field,max:10}))}};");
  for(const name of names){
    nodes[`#field-${name}`]={value:name==='title'?'Project':''};
    nodes[`[data-confirm="${name}"]`]={checked:name==='title'};
  }
  context.document.querySelector=selector=>nodes[selector]||null;
  run('updatePublicationReadiness()');
  assert.equal(nodes['[data-confirm="context"]'].disabled,true);
  const contextField=nodes['#field-context'];
  Object.assign(contextField,{name:'context',dataset:{},closest:selector=>selector==='#edit-form'?{}:null});
  contextField.value='Shop workflow';
  listeners.input({target:contextField});
  assert.equal(nodes['[data-confirm="context"]'].disabled,false);
  assert.match(nodes['#publish-readiness'].innerHTML,/data-focus-field="context"/);
  assert.equal(nodes['#reviewed'].checked,false);
  nodes['[data-confirm="context"]'].checked=true;
  run('updatePublicationReadiness()');
  assert.doesNotMatch(nodes['#publish-readiness'].innerHTML,/data-focus-field="context"/);
  contextField.value='   ';
  listeners.input({target:contextField});
  assert.equal(nodes['[data-confirm="context"]'].checked,false);
  assert.equal(nodes['[data-confirm="context"]'].disabled,true);
  assert.equal(run('dirty'),true);
});

test('login and registration retain the originating task or workspace',async()=>{
  for(const origin of ['task/demo-one','outbox','new','edit/owned-task','mine']){
    const {context,run}=frontend();
    context.fetch=async()=>({ok:true,json:async()=>({user:null})});
    run(`page=${JSON.stringify(origin)};authPage=()=>{};`);
    context.location.hash='#login';
    await run('route()');
    assert.equal(run('authReturn'),origin);
    context.location.hash='#register';
    await run('route()');
    await run("switchLanguage('ru')");
    assert.equal(run('authReturn'),origin);
    context.location.hash='#login';
    await run('route()');
    assert.equal(run('authReturn'),origin);
  }
});

test('direct login defaults to own projects and a later login uses the new origin',async()=>{
  const {context,run}=frontend();
  context.fetch=async()=>({ok:true,json:async()=>({user:null})});
  run('authPage=()=>{};newPage=()=>{};');
  context.location.hash='#login';
  await run('route()');
  assert.equal(run('authReturn'),'mine');
  context.location.hash='#new';
  await run('route()');
  context.location.hash='#register';
  await run('route()');
  assert.equal(run('authReturn'),'new');
  for(const invalid of ['https://example.test','//example.test','login','register','task/x?next=other']){
    assert.equal(run(`authDestination(${JSON.stringify(invalid)})`),'mine');
  }
});
