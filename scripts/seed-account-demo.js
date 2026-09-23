import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createStore } from '../server/store.js';
import { newTask, updateFields, rating } from '../server/domain.js';

const names=['title','context','users','data','expectedResult','successCriteria','constraints','contact'];
// Fictional situations, contacts and team decisions for a local demonstration.
const scenarios=[
  ['Қойма есебін автоматтандыру','Дүкен тауар қалдығын дәптерде жүргізеді. Қате есеп пен қайталанатын жұмысты азайту керек.','Қоймашы, дүкен әкімшісі','Жасанды CSV: 100 тауар, кіріс пен шығыс','Қалдықты есептейтін және CSV қабылдайтын веб-кесте','100 тауарды қатесіз импорттау; кіріс пен шығыстан кейін қалдық жаңарады','14 күн; компьютерде жұмыс істеуі керек','warehouse@example.test; апталық демо'],
  ['Кафедегі тапсырыстар кезегі','Даяшы тапсырысты қағазға жазады, асүйге жеткізгенде кейбір позиция жоғалады.','Даяшылар және асүй қызметкерлері','Ойдан жасалған 20 тағамдық мәзір','Тапсырыс енгізу және дайындық мәртебесін көру экраны','10 тест тапсырыс асүй экранына толық жетеді','21 күн; телефонға ыңғайлы интерфейс','cafe@example.test; әр жұма кездесу'],
  ['Көкшетау туристік бағыттары','Қонақтарға бірнеше орыннан тұратын серуен бағытын табу қиын.','Қала қонақтары','Ойдан жасалған 8 орынның сипаттамасы','Бағыттар каталогы және ұзақтығы бойынша сүзгі','Кемінде 5 бағыт ашылады; әр бағытта орындар тізімі бар','','travel@example.test; жазбаша кері байланыс'],
  ['Оқу орталығының сабақ кестесі','Топтар мен мұғалімдер бір кабинетке қатар жазылып қалады.','Әкімші, мұғалімдер','Жасанды кесте: 6 топ және 3 кабинет','Апталық кесте және қабаттасу туралы ескерту','','10 күн; браузерде жұмыс істейді','classes@example.test; аптасына екі рет тексеру'],
  ['Шеберханаға онлайн жазылу','Клиенттер бос уақытты телефонмен сұрайды, әкімші қолмен тіркейді.','Әкімші және клиенттер','Жасанды қызметтер мен бос уақыттар тізімі','Қызмет пен уақыт таңдау прототипі','Бір уақытқа екі тест жазылым қабылданбайды','',''],
  ['Клиент пікірлерін жинау','Сауалнама жауаптары әр чатта қалып, ортақ есеп жасалмайды.','','Жеке дерексіз жасанды 30 пікір','Пікір енгізу формасы және қарапайым есеп','','',''],
  ['Қабылдау кезегінің таблосы','Келуші кезегі қашан жететінін білмейді.','Қабылдау қызметкері және келушілер','','Ағымдағы нөмірді көрсететін экран','','',''],
  ['Жоба: еріктілерді іс-шараға бөлу','Ұйымдастырушы еріктілердің бос уақытын жинап, міндеттерге бөлгісі келеді.','Еріктілер және үйлестіруші','','Қатысушыларды ауысымдарға бөлу кестесі','','Іс-шара күні әлі келісілмеген','volunteers@example.test; жоба талқылауы'],
  ['Жоба: кітапханадағы кітап іздеу','Оқырман кітаптың қай сөреде тұрғанын тез тапқысы келеді.','','Жасанды 50 кітап атауы','Кітап іздеу беті','','',''],
  ['Жоба: шағын ферма шығындары','Шаруашылық шығындарды бір жерге жазып, айлық қорытынды көргісі келеді.','','','','','','']
];
const offers=[
  [0,'Steppe Code','pending','CSV импортын және қалдық есебін 2 аптада жасаймыз. Алдымен файл бағандарын келісуді ұсынамыз.',''],
  [0,'Data Qadam','accepted','Алдымен 100 жасанды тауармен прототип, содан кейін кіріс пен шығыс журналын көрсетеміз.','Демо шешім: тәсіл сәйкес келеді. Алғашқы кезеңде CSV үлгісін келісеміз.'],
  [1,'Cafe Digital','accepted','Телефоннан тапсырыс енгізу және асүй экранын 3 аптада дайындаймыз.','Демо шешім: ұсыныс қабылданды. Мәзір прототипін бірінші аптада көрсетіңіз.'],
  [1,'Quick Menu','rejected','Тек үстелдік компьютерге арналған нұсқаны 6 аптада жасай аламыз.','Демо шешім: мерзім мен телефонда жұмыс істеу талабы сәйкес келмейді.'],
  [2,'Kokshe Routes','pending','5 маршрут пен ұзақтық сүзгісін жасаймыз. Орын сипаттамаларын нақтылау керек.',''],
  [2,'Travel Vision','rejected','Толық туристік маркетплейс пен қонақүй брондау жүйесін жасауды ұсынамыз.','Демо шешім: ұсыныс ағымдағы шағын маршруттар каталогының ауқымынан үлкен.'],
  [3,'Schedule Lab','accepted','Кабинеттердің қабаттасуын анықтайтын апталық кестені 10 күнде дайындаймыз.','Демо шешім: қабылданды. Сынақ кестесіндегі қақтығыстарды бірге тексереміз.'],
  [4,'Booking Team','pending','Қызмет пен уақыт таңдау формасын жасаймыз. Бос уақытты кім жаңартатынын нақтылайық.',''],
  [5,'Feedback AI','rejected','Пікір талдау үшін барлық нақты клиенттің аты мен телефоны бар базаны сұраймыз.','Демо шешім: прототипке жеке деректер қажет емес. Жасанды пікірлермен жұмыс істейтін тәсіл керек.'],
  [6,'Queue Makers','pending','Бір экрандық кезек таблосын жасаймыз. Алдымен нөмірді ауыстыру тәртібін келісу қажет.','']
];

export function seedAccountDemo(store,email) {
  const user=store.userByEmail(String(email||'').trim().toLowerCase());
  if(!user)throw new Error('Account not found; no demo records were added.');
  const prefix=`demo-account-${createHash('sha256').update(user.id).digest('hex').slice(0,16)}`;
  let tasksAdded=0,proposalsAdded=0;
  const taskIds=scenarios.map((_,i)=>`${prefix}-task-${i+1}`);
  store.transaction(()=>{
    scenarios.forEach((row,index)=>{
      const id=taskIds[index],existing=store.task(id);
      if(existing){
        if(existing.ownerId!==user.id)throw new Error('Demo task ownership mismatch');
        return;
      }
      const values=[...row];
      values[0]=`Демо · ${values[0]}`;
      values[1]=`Ойдан жасалған демонстрациялық жағдай. ${values[1]}`;
      const draft=index>=7;
      const fields=Object.fromEntries(names.map((name,i)=>[name,{
        value:values[i],
        confirmed:Boolean(values[i]) && (!draft || (index===7 && ['title','context','users'].includes(name)) || (index===8 && name==='data'))
      }]));
      const task=updateFields(newTask(values[1]).task,fields);
      task.topic=['Сауда','Тамақтану','Туризм','Білім','Қызмет көрсету','Маркетинг','Қалалық қызмет','Еріктілік','Білім','Ауыл шаруашылығы'][index];
      task.id=id;task.ownerId=user.id;
      if(!draft){task.status='published';task.reviewedAt=task.updatedAt;}
      store.saveTask(task);tasksAdded++;
    });
    offers.forEach(([taskIndex,team,status,message,decisionNote],index)=>{
      const id=`${prefix}-proposal-${index+1}`;
      const details={plan:'Талаптарды нақтылау → прототип → жасанды деректермен тексеру → нәтижені көрсету',deadline:taskIndex===1?'3 апта':'2 апта',prototypeLink:`https://example.test/prototypes/account-team-${index+1}`,skills:'Веб әзірлеу, тестілеу',interests:scenarios[taskIndex][0],technologies:'JavaScript, SQLite',progress:0,progressPoints:0};
      const existing=store.proposal(id);
      if(existing){
        const missing=Object.fromEntries(Object.entries(details).filter(([key])=>existing[key]===undefined));
        if(Object.keys(missing).length)store.saveProposal({...existing,...missing,version:existing.version+1});
        return;
      }
      const now=new Date().toISOString();
      store.saveProposal({id,taskId:taskIds[taskIndex],teamName:`Демо · ${team}`,
        contact:`team${index+1}@example.test`,message:`Демонстрациялық ұсыныс. ${message}`,
        ...details,status,decisionNote,createdAt:now,decidedAt:status==='pending'?null:now,version:status==='pending'?1:2});
      proposalsAdded++;
    });
  });
  return {tasksAdded,proposalsAdded,tasks:taskIds.map(id=>{
    const task=store.task(id);
    return {id,title:task.fields.title.value,status:task.status,score:rating(task.fields).score,
      proposals:store.proposals(id).map(p=>({status:p.status,team:p.teamName}))};
  })};
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const store=createStore(process.env.DATABASE_PATH);
  try { console.log(JSON.stringify(seedAccountDemo(store,process.argv[2]),null,2)); }
  catch(error){console.error(error.message);process.exitCode=1;}
  finally {store.close();}
}
