const copy={
  kk:{title:'AI тәлімгер',subtitle:'Ойыңызды талқылаңыз. Түсінбеген жеріңізді сұраңыз. Келесі қадамды бірге анықтайық.',you:'Сіз',ask:'Сұрағыңыз',send:'Жіберу',waiting:'Тәлімгер жауап дайындап жатыр…',fresh:'Жаңа әңгіме',confirm:'Осы қойындыдағы әңгімені өшіріп, жаңасын бастау керек пе?',hello:'Сәлем! Қазір қандай жоба немесе тақырып бойынша көмек керек?',notice:'Хабарламаларыңыз жауап алу үшін OpenAI-ға жіберіледі. Соңғы 40 хабарлама осы браузер қойындысында сақталады; модельге соңғы әңгіменің бір бөлігі беріледі. Құпиясөз бен API кілтін жазбаңыз.',suggestions:['Жобамды неден бастаймын?','Тапсырманың рейтингін қалай көтеремін?','Ұсыныс жоспарын құруға көмектес'],offline:'AI тәлімгер қазір жауап бере алмады. Мәтініңіз сақталды, қайта жіберіп көріңіз.',missing:'AI кілті серверде қосылмаған. .env.local баптауын тексеріңіз.',limit:'AI сұрау лимитіне жетті. Кейінірек қайта көріңіз.',storage:'Браузер тарихты сақтауға рұқсат бермеді. Әңгіме бет жабылғанша ғана сақталады.'},
  ru:{title:'AI наставник',subtitle:'Обсудите идею, задайте вопрос и разберитесь со следующим шагом.',you:'Вы',ask:'Ваш вопрос',send:'Отправить',waiting:'Наставник готовит ответ…',fresh:'Новый разговор',confirm:'Очистить разговор в этой вкладке и начать новый?',hello:'Здравствуйте! С каким проектом или вопросом вам нужна помощь?',notice:'Сообщения отправляются в OpenAI для ответа. Последние 40 сообщений сохраняются в этой вкладке; модели передаётся часть недавней переписки. Не вводите пароли и API-ключи.',suggestions:['С чего начать мой проект?','Как повысить рейтинг задачи?','Помоги составить план предложения'],offline:'Наставник сейчас не смог ответить. Текст сохранён, попробуйте отправить снова.',missing:'Ключ AI не настроен на сервере. Проверьте .env.local.',limit:'Достигнут лимит AI-запросов. Попробуйте позже.',storage:'Браузер не разрешил сохранить историю. Разговор сохранится только до закрытия страницы.'}
};
const conversations=new Map();
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function conversation(key){
  if(!conversations.has(key)){
    let saved;
    try{saved=JSON.parse(sessionStorage.getItem(key));}catch{}
    const messages=Array.isArray(saved?.messages)?saved.messages:[];
    const valid=messages.length<=40 && messages.length%2===0 && messages.every((m,i)=>m?.role===(i%2?'assistant':'user')&&typeof m.content==='string'&&m.content.length<=(i%2?8000:4000));
    conversations.set(key,{messages:valid?messages:[],draft:typeof saved?.draft==='string'?saved.draft.slice(0,4000):'',error:'',storageError:false});
  }
  return conversations.get(key);
}
function save(key,state){try{sessionStorage.setItem(key,JSON.stringify({messages:state.messages,draft:state.draft}));}catch{state.storageError=true;}}
export function mentorContext(messages,draft){
  let recent=messages.slice(-20);
  while(recent.reduce((n,m)=>n+m.content.length,0)+draft.length>30000)recent=recent.slice(2);
  return [...recent,{role:'user',content:draft}];
}
export function showMentor({shell,user,lang,act}){
  const c=copy[lang],key=`shoqan-mentor:${user?.id||'guest'}`,state=conversation(key);
  function render(){
    shell(`<section class="mentor-page"><div class="page-heading"><div><h1>${c.title}</h1><p class="subtitle">${c.subtitle}</p></div><button class="btn small" id="mentor-new">${c.fresh}</button></div><p class="notice">${c.notice}</p><div class="mentor-log" role="log" aria-label="${c.title}">${state.messages.length?state.messages.map(m=>`<article class="mentor-message ${m.role}"><strong>${m.role==='user'?c.you:c.title}</strong><div>${escape(m.content)}</div></article>`).join(''):`<article class="mentor-message assistant">${c.hello}</article>`}</div>${!state.messages.length?`<div class="actions mentor-suggestions">${c.suggestions.map((text,i)=>`<button type="button" class="btn small" data-suggestion="${i}">${text}</button>`).join('')}</div>`:''}<p class="notice error" role="alert" ${state.error?'':'hidden'}>${escape(state.error)}</p>${state.storageError?`<p class="notice">${c.storage}</p>`:''}<form id="mentor-form" class="panel"><label class="form-label" for="mentor-question">${c.ask}</label><textarea id="mentor-question" maxlength="4000" required rows="3">${escape(state.draft)}</textarea><div class="actions"><button class="btn primary" type="submit">${c.send}</button><span id="mentor-status" role="status"></span></div></form></section>`);
    document.title=`Shoqan — ${c.title}`;
    document.querySelector('.breadcrumb strong').textContent=c.title;
    const input=document.querySelector('#mentor-question');
    input.addEventListener('input',()=>{state.draft=input.value;save(key,state);});
    document.querySelectorAll('[data-suggestion]').forEach(button=>button.addEventListener('click',()=>{state.draft=c.suggestions[Number(button.dataset.suggestion)];input.value=state.draft;save(key,state);input.focus();}));
    document.querySelector('#mentor-new').addEventListener('click',()=>{
      const clear=()=>{state.messages=[];state.draft='';state.error='';save(key,state);render();};
      if(!state.messages.length&&!state.draft){clear();return;}
      if(document.querySelector('#mentor-confirmation'))return;
      document.querySelector('#mentor-new').insertAdjacentHTML('afterend',`<div id="mentor-confirmation" class="notice"><p>${c.confirm}</p><div class="actions"><button type="button" class="btn" id="mentor-clear">${c.fresh}</button><button type="button" class="btn" id="mentor-cancel">${lang==='kk'?'Бас тарту':'Отмена'}</button></div></div>`);
      document.querySelector('#mentor-clear').addEventListener('click',clear);
      document.querySelector('#mentor-cancel').addEventListener('click',()=>document.querySelector('#mentor-confirmation').remove());
    });
    document.querySelector('#mentor-form').addEventListener('submit',event=>{
      event.preventDefault();event.stopPropagation();
      const draft=input.value.trim();if(!draft)return;
      state.draft=draft;save(key,state);
      void act(event.submitter,async()=>{
        document.querySelector('#mentor-status').textContent=c.waiting;
        try{
          const response=await fetch('/api/mentor',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:lang,messages:mentorContext(state.messages,draft)})});
          if(!response.ok)throw Object.assign(new Error(),{status:response.status});
          const result=await response.json();
          if(typeof result.reply!=='string'||!result.reply.trim()||result.reply.length>8000)throw new Error();
          state.messages=[...state.messages,{role:'user',content:draft},{role:'assistant',content:result.reply}].slice(-40);
          state.draft='';state.error='';
        }catch(error){state.error=error.status===503?c.missing:error.status===429?c.limit:c.offline;}
        save(key,state);render();
        const log=document.querySelector('.mentor-log');log.scrollTop=log.scrollHeight;
      });
    });
  }
  render();
}
