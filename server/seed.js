import { pathToFileURL } from 'node:url';
import { createStore } from './store.js';
import { newTask, fieldNames } from './domain.js';

// Intentionally fictional data. This public token is for local demo tasks only.
export const demoToken = 'local-demo-owner';
export function seed(store) {
  const topics = ['Операции', 'Сервис', 'Туризм', 'Маркетинг', 'Городские сервисы'];
  const teams = [
    ['Demo Team 1', 'team1@example.test', 'CSV қойма есебін автоматтандыратын прототип жасаймыз.', 'Деректерді тексеру → интерфейс → демо', '2 апта', 'https://github.com/demo-team-1', 'Python, анализ данных', 'Операции', 'Python, Streamlit'],
    ['Demo Team 2', 'team2@example.test', 'Кафе тапсырыстарын бір панельге жинаймыз.', 'Деректер үлгісі → панель → пайдаланушы сынағы', '3 апта', 'https://github.com/demo-team-2', 'Web, UX', 'Сервис', 'JavaScript, Node.js'],
    ['Demo Team 3', 'team3@example.test', 'Туристік маршруттарды іздеу каталогын құрамыз.', 'Категориялар → іздеу → маршрут картасы', '3 апта', 'https://github.com/demo-team-3', 'Frontend, карталар', 'Туризм', 'JavaScript, HTML, CSS'],
    ['Demo Team 4', 'team4@example.test', 'Пікірлерді жинауға арналған қарапайым форманы жасаймыз.', 'Форма → сақтау → есеп', '2 апта', 'https://github.com/demo-team-4', 'Forms, analytics', 'Маркетинг', 'Python, SQLite'],
    ['Demo Team 5', 'team5@example.test', 'Кезек уақытын көрсететін экран прототипін ұсынамыз.', 'Сценарий → прототип → тексеру', '1 апта', 'https://github.com/demo-team-5', 'UI, прототиптеу', 'Қалалық сервистер', 'Figma, JavaScript']
  ];
  const rows = [
    ['Қойма есебін автоматтандыру', 'Тауар қалдығын қолмен есептеу уақыт алады.', 'Қойма қызметкерлері', 'Жасанды CSV: 100 тауар', 'Қалдықтар кестесі', '100 жолды қатесіз импорттау', 'Екі апта; веб қолданба', 'demo1@example.test; апталық кездесу'],
    ['Кафе тапсырыстары', 'Тапсырыстарды бір тізімге жинау керек.', 'Кафе қызметкерлері', 'Жасанды мәзір', 'Тапсырыс прототипі', 'Он демо тапсырыс өңделеді', 'Үш апта', 'demo2@example.test; чат'],
    ['Туристік маршруттар', 'Қала бағыттарын табуды жеңілдету керек.', 'Қала қонақтары', 'Ойдан жасалған орындар тізімі', 'Маршруттар каталогы', 'Бес маршрут көрсетіледі', '', 'demo3@example.test; хат'],
    ['Кері байланыс жинау', 'Клиент пікірлерін бір жерде сақтау қажет.', 'Қолдау тобы', '', 'Пікірлер формасы', '', '', ''],
    ['Кезек туралы хабарлау', 'Кезек уақытын түсінікті көрсету керек.', '', '', '', '', '', '']
  ];
  const ordered = ['title', 'context', 'users', 'data', 'expectedResult', 'successCriteria', 'constraints', 'contact'];
  store.transaction(() => rows.forEach((row, index) => {
    const id = `demo-task-${index + 1}`;
    let task = store.task(id);
    if (!task) {
      task = newTask(row[1], demoToken).task;
      task.id = id;
      for (const name of fieldNames) { const value = row[ordered.indexOf(name)]; task.fields[name] = { value, confirmed: Boolean(value) }; }
      task.status = 'published'; task.reviewedAt = task.createdAt;
    }
    if (!task.topic || task.version===1) task.topic = topics[index];
    store.saveTask(task);
    const [teamName, contact, message, plan, deadline, prototypeLink, skills, interests, technologies] = teams[index];
    const proposalId=`demo-proposal-${index+1}`;
    const existing=store.proposal(proposalId);
    const details={plan,deadline,prototypeLink:`https://example.test/prototypes/team-${index+1}`,skills,interests,technologies,progress:0,progressPoints:0};
    if(!existing)store.saveProposal({ id:proposalId, taskId:id, teamName, contact, message, ...details, status:'pending', createdAt:task.createdAt, decidedAt:null, version:1 });
    else {
      const missing=Object.fromEntries(Object.entries(details).filter(([key])=>existing[key]===undefined));
      if(Object.keys(missing).length)store.saveProposal({...existing,...missing,version:existing.version+1});
    }
    const draftId=`demo-draft-${index+1}`;
    if(!store.task(draftId)){
      const draft=newTask(`Демо жоба: ${row[1]}`,demoToken).task;
      draft.id=draftId;draft.topic=topics[index];
      draft.fields.title={value:`Демо жоба: ${row[0]}`,confirmed:false};
      if(index>0)draft.fields.users={value:row[2],confirmed:true};
      if(index>1)draft.fields.data={value:row[3],confirmed:Boolean(row[3])};
      store.saveTask(draft);
    }
  }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const store = createStore(process.env.DATABASE_PATH);
  try { seed(store); console.log('Demo data ready: 5 published tasks, 5 drafts, 5 team profiles in proposals. Owner token: local-demo-owner'); }
  finally { store.close(); }
}
