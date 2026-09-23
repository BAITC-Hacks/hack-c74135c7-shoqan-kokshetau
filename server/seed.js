import { pathToFileURL } from 'node:url';
import { createStore } from './store.js';
import { newTask, fieldNames } from './domain.js';

// Intentionally fictional data. This public token is for local demo tasks only.
export const demoToken = 'local-demo-owner';
export function seed(store) {
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
    if (store.task(id)) return;
    const { task } = newTask(row[1], demoToken);
    task.id = id;
    for (const name of fieldNames) { const value = row[ordered.indexOf(name)]; task.fields[name] = { value, confirmed: Boolean(value) }; }
    task.status = 'published'; task.reviewedAt = task.createdAt;
    store.saveTask(task);
    if (index < 3) store.saveProposal({ id: `demo-proposal-${index + 1}`, taskId: id, teamName: `Demo Team ${index + 1}`, contact: `team${index + 1}@example.test`, message: 'Демо: прототип жасауға дайынбыз.', status: 'pending', createdAt: task.createdAt, decidedAt: null, version: 1 });
  }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const store = createStore(process.env.DATABASE_PATH);
  try { seed(store); console.log('Demo data ready: 5 tasks, 3 proposals. Owner token: local-demo-owner'); }
  finally { store.close(); }
}
