import { accountMessages, authMarkup } from './account.js';

const dictionary = {
  kk: {
    catalog:'Тапсырмалар', mine:'Менің жобаларым', create:'Тапсырма қосу', workspace:'Жұмыс кеңістігі', platform:'БИЗНЕС × СТУДЕНТТЕР', nav:'ЖҰМЫС АЛАҢЫ', sorting:'Сұрыптау', unavailableProjects:'Кейбір жобалар ашылмады. Серверді немесе сақталған кілттерді тексеріңіз.',
    helpTitle:'Бір идеядан — нақты нәтижеге', help:'Мәселеңізді сипаттаңыз. Сұрақтарға жауап беріп, командамен жұмысты бастаңыз.', profile:'Жеке жұмыс кеңістігі', profileSub:'Осы браузерде сақталады', connected:'Жергілікті нұсқа',
    catalogTitle:'Мүмкіндіктер алаңы', catalogSub:'Бизнеске шешім. Командаға тәжірибе.', newTask:'Жаңа тапсырма', heroLabel:'БІРГЕ ЖАСАЙМЫЗ', heroTitle:'Нақты міндеттер.<br>Жаңа мүмкіндіктер.', heroText:'Бизнес тапсырмасын таңдаңыз, өз шешіміңізді ұсыныңыз және тәжірибеңізді нақты жобада қолданыңыз.',
    total:'Жарияланған тапсырма', ready:'Жұмысқа дайын', open:'Ұсыныс қабылдайды', allTasks:'Ашық тапсырмалар', search:'Тапсырма іздеу…', allLevels:'Сұрыптау', highFirst:'Толықтығы жоғары', newFirst:'Жаңалары алдымен', completeness:'Карточка толықтығы', points:'ұпай', details:'Толығырақ', demo:'Демо жоба', task:'Тапсырма',
    level0:'Жоба', level1:'Дайындалуда', level2:'Дайын', level3:'Басым', ratingNote:'Толықтық ұпайы тапсырма туралы ақпаратты бағалайды. Бұл компанияның бедел рейтингі емес.', footer:'Shoqan · Идеядан іске', footerRight:'Бизнес пен студенттердің ортақ алаңы',
    noResults:'Тапсырма табылмады', noResultsText:'Іздеу сөзін немесе сүзгіні өзгертіп көріңіз.', emptyMine:'Алғашқы жобаңызды бастаңыз', emptyMineText:'Өзіңіз жасаған тапсырмалар мен келген ұсыныстар осында болады.', mineSub:'Тапсырмаларыңыз, жарияланымдар және команда ұсыныстары.', published:'Жарияланған', draft:'Жоба', edit:'Өңдеу', back:'Каталогқа оралу',
    createTitle:'Идеяңызды тапсырмаға айналдырыңыз', createSub:'Алдымен мәселені өз сөзіңізбен жазыңыз. Қалғанын қадаммен толықтырамыз.', step1:'Сипаттау', step2:'Нақтылау', step3:'Жариялау', description:'Қандай мәселені шешкіңіз келеді?', descriptionPlaceholder:'Мысалы: дүкендегі тауар қалдығын қолмен есептейміз. Осы жұмысты жеңілдететін қарапайым шешім керек.', descriptionHelp:'Не қиындық туғызады және не өзгергенін қалайсыз? Әзірге толық техникалық тапсырма қажет емес.', start:'Жоба жасау', privateNotice:'Алдымен жеке жоба жасалады. Сіз тексеріп, жарияламайынша каталогта көрінбейді.',
    title:'Тапсырма атауы', context:'Мәселе және бизнес қажеттілігі', users:'Кімдер пайдаланады?', data:'Деректер мен материалдар', expectedResult:'Күтілетін нәтиже', successCriteria:'Жетістік критерийлері', constraints:'Мерзім және шектеулер', contact:'Байланыс және кері байланыс',
    editorTitle:'Тапсырманы нақтылау', editorSub:'Білетін деректеріңізді жазыңыз. Белгісіз өрістерді бос қалдыруға болады.', confirmed:'Осы ақпаратты тексердім және растаймын', save:'Өзгерістерді сақтау', saved:'Өзгерістер сақталды', questions:'Нақтылаушы сұрақтар', getQuestions:'Сұрақтар алу', fallbackQuestions:'ИИ қазір қолжетімсіз. Жергілікті көмекші сұрақтарды қолданамыз.', aiQuestions:'Сұрақтарды ИИ дайындады. Жауаптарыңыз карточкаға өз сөзіңізбен сақталады.', questionsLoading:'Сұрақтар дайындалуда…', originalEdit:'Бұл жерде түпнұсқа мәтін өңделеді. Аударма бастапқы деректерді алмастырмайды.',
    publishTitle:'Жариялауға дайынсыз ба?', publishHelp:'Алдымен өзгерістерді сақтаңыз. Атау мен барлық толтырылған өрістер расталуы керек. Бос өрістер жариялауға кедергі емес.', reviewed:'Карточканың толық мәтінін қарап шықтым, жариялауды растаймын', publish:'Каталогта жариялау', publishedToast:'Тапсырма жарияланды', unsaved:'Сақталмаған өзгерістер бар. Шығуды қалайсыз ба?', saveFirst:'Алдымен өзгерістерді сақтаңыз', reviewFirst:'Жариялау алдында карточканы қарап, растау белгісін қойыңыз',
    translating:'ИИ мәтінді аударып жатыр…', translated:'ИИ аудармасы · мағынасын түпнұсқамен салыстырыңыз', original:'Түпнұсқа', translatedView:'Аударма', translationUnavailable:'ИИ аудармасы қолжетімсіз. Түпнұсқа мәтін көрсетілді.', keyMissing:'ИИ аудармасы қосылмаған. Түпнұсқа мәтін көрсетілді.', retry:'Қайталау', noValue:'Әзірге көрсетілмеген',
    propose:'Команда атынан ұсыныс беру', proposalHelp:'Тәсіліңізді қысқаша сипаттаңыз. Шешімді тапсырма иесі қабылдайды.', teamName:'Команда атауы', teamContact:'Байланыс: email немесе телефон', message:'Ұсынысыңыз', send:'Ұсыныс жіберу', proposalSent:'Ұсыныс жіберілді. Тапсырма иесі сіз көрсеткен байланыс арқылы хабарласа алады.', proposals:'Команда ұсыныстары', noProposals:'Әзірге ұсыныс жоқ', noProposalsText:'Жарияланған карточкаға командалар ұсыныс бере алады.', pending:'Қаралуда', accepted:'Қабылданды', rejected:'Қабылданбады', accept:'Қабылдау', reject:'Қабылдамау', decisionSaved:'Шешім сақталды', manage:'Ұсыныстарды басқару',
    access:'Жобаға қайта кіру', accessHelp:'Бұрын сақтаған тапсырма ID-і мен иесінің кілтін енгізіңіз.', taskId:'Тапсырма ID-і', ownerToken:'Иесінің кілті', restore:'Жобаны қосу', accessSaved:'Жоба осы браузерге қосылды', tokenHelp:'Браузер деректерін тазаласаңыз, қолжетімділік жоғалады. Осы ID мен кілтті жеке жерде сақтаңыз. Кілтті өзгеге бермеңіз.', showAccess:'Қолжетімділікті сақтау', storageError:'Браузерде сақтау мүмкін емес. Жоба құрмас бұрын браузерде жергілікті сақтауға рұқсат беріңіз.',
    loading:'Жүктелуде…', error:'Әрекет орындалмады. Қайта көріңіз.', networkError:'Серверге қосылу мүмкін болмады. Сервер іске қосулы екенін тексеріңіз.', forbidden:'Бұл жобаға қолжетімділік жоқ. Иесінің кілтін тексеріңіз.', conflict:'Деректер өзгерді. Бетті қайта жүктеп, соңғы нұсқамен салыстырыңыз.', invalid:'Мәндерді тексеріңіз. Атау және толтырылған өрістер расталуы керек.', notFound:'Тапсырма табылмады', reload:'Қайта жүктеу', restored:'Қосылды', privacy:'Жеке кілт осы браузерде сақталады. Ортақ компьютерде қолданбаңыз.', demoManage:'Демо басқаруды көру', demoNotice:'Бұл — ойдан жасалған демо тапсырма. Өз жобаңызды «Жаңа тапсырма» арқылы жасаңыз.'
  },
  ru: {
    catalog:'Задачи', mine:'Мои проекты', create:'Создать задачу', workspace:'Рабочее пространство', platform:'БИЗНЕС × СТУДЕНТЫ', nav:'РАБОЧАЯ ОБЛАСТЬ', sorting:'Сортировка', unavailableProjects:'Не все проекты удалось открыть. Проверьте сервер или сохранённые ключи.',
    helpTitle:'От идеи к результату', help:'Опишите проблему. Ответьте на вопросы и начните работу с командой.', profile:'Личное пространство', profileSub:'Сохраняется в этом браузере', connected:'Локальная версия',
    catalogTitle:'Пространство возможностей', catalogSub:'Бизнесу — решение. Команде — опыт.', newTask:'Новая задача', heroLabel:'СОЗДАЁМ ВМЕСТЕ', heroTitle:'Реальные задачи.<br>Новые возможности.', heroText:'Найдите задачу бизнеса, предложите своё решение и примените знания в настоящем проекте.',
    total:'Опубликованных задач', ready:'Готовы к работе', open:'Принимают предложения', allTasks:'Открытые задачи', search:'Найти задачу…', allLevels:'Сортировка', highFirst:'Сначала полные', newFirst:'Сначала новые', completeness:'Полнота карточки', points:'баллов', details:'Подробнее', demo:'Демо-проект', task:'Задача',
    level0:'Черновик', level1:'Подготовка', level2:'Готова', level3:'Приоритет', ratingNote:'Оценка полноты отражает количество подтверждённой информации о задаче. Это не рейтинг репутации компании.', footer:'Shoqan · От идеи к делу', footerRight:'Общее пространство бизнеса и студентов',
    noResults:'Задачи не найдены', noResultsText:'Попробуйте изменить запрос или фильтр.', emptyMine:'Начните свой первый проект', emptyMineText:'Здесь появятся ваши задачи и предложения команд.', mineSub:'Ваши задачи, публикации и предложения команд.', published:'Опубликовано', draft:'Черновик', edit:'Редактировать', back:'Вернуться к задачам',
    createTitle:'Превратите идею в задачу', createSub:'Начните с описания проблемы своими словами. Остальное уточним по шагам.', step1:'Описание', step2:'Уточнение', step3:'Публикация', description:'Какую проблему вы хотите решить?', descriptionPlaceholder:'Например: мы вручную считаем остатки товаров в магазине. Нужен простой способ облегчить эту работу.', descriptionHelp:'Что вызывает трудности и что вы хотите изменить? Полное техническое задание пока не нужно.', start:'Создать черновик', privateNotice:'Сначала создаётся личный черновик. Он появится в каталоге только после вашей проверки и публикации.',
    title:'Название задачи', context:'Проблема и потребность бизнеса', users:'Кто будет пользоваться?', data:'Данные и материалы', expectedResult:'Ожидаемый результат', successCriteria:'Критерии успеха', constraints:'Сроки и ограничения', contact:'Контакт и обратная связь',
    editorTitle:'Уточните задачу', editorSub:'Заполните известную информацию. Неизвестные поля можно оставить пустыми.', confirmed:'Я проверил(а) и подтверждаю эту информацию', save:'Сохранить изменения', saved:'Изменения сохранены', questions:'Уточняющие вопросы', getQuestions:'Получить вопросы', fallbackQuestions:'ИИ сейчас недоступен. Используем подготовленные вопросы.', aiQuestions:'Вопросы подготовлены ИИ. Ваши ответы сохраняются в карточке вашими словами.', questionsLoading:'Готовим вопросы…', originalEdit:'Здесь редактируется исходный текст. Перевод не заменяет оригинал.',
    publishTitle:'Готовы опубликовать?', publishHelp:'Сначала сохраните изменения. Подтвердите название и все заполненные поля. Пустые поля не мешают публикации.', reviewed:'Я проверил(а) всю карточку и подтверждаю публикацию', publish:'Опубликовать в каталоге', publishedToast:'Задача опубликована', unsaved:'Есть несохранённые изменения. Выйти без сохранения?', saveFirst:'Сначала сохраните изменения', reviewFirst:'Перед публикацией проверьте карточку и поставьте отметку подтверждения',
    translating:'ИИ переводит текст…', translated:'Перевод ИИ · сверяйте смысл с оригиналом', original:'Оригинал', translatedView:'Перевод', translationUnavailable:'Перевод ИИ недоступен. Показан исходный текст.', keyMissing:'Перевод ИИ не подключён. Показан исходный текст.', retry:'Повторить', noValue:'Пока не указано',
    propose:'Предложение от команды', proposalHelp:'Кратко опишите свой подход. Решение принимает владелец задачи.', teamName:'Название команды', teamContact:'Контакт: email или телефон', message:'Ваше предложение', send:'Отправить предложение', proposalSent:'Предложение отправлено. Владелец задачи сможет связаться с вами по указанному контакту.', proposals:'Предложения команд', noProposals:'Предложений пока нет', noProposalsText:'Команды могут откликаться на опубликованную карточку.', pending:'На рассмотрении', accepted:'Принято', rejected:'Отклонено', accept:'Принять', reject:'Отклонить', decisionSaved:'Решение сохранено', manage:'Управлять предложениями',
    access:'Восстановить доступ к проекту', accessHelp:'Введите ранее сохранённые ID задачи и ключ владельца.', taskId:'ID задачи', ownerToken:'Ключ владельца', restore:'Добавить проект', accessSaved:'Проект добавлен в этот браузер', tokenHelp:'Очистка данных браузера удалит доступ. Сохраните ID и ключ в личном месте. Никому не передавайте ключ.', showAccess:'Сохранить доступ', storageError:'Хранилище браузера недоступно. Разрешите локальное хранение перед созданием проекта.',
    loading:'Загрузка…', error:'Не удалось выполнить действие. Попробуйте ещё раз.', networkError:'Не удалось подключиться к серверу. Проверьте, что он запущен.', forbidden:'Нет доступа к этому проекту. Проверьте ключ владельца.', conflict:'Данные изменились. Перезагрузите страницу и сравните с последней версией.', invalid:'Проверьте значения. Название и все заполненные поля должны быть подтверждены.', notFound:'Задача не найдена', reload:'Перезагрузить', restored:'Добавлено', privacy:'Личный ключ хранится в этом браузере. Не используйте общий компьютер.', demoManage:'Посмотреть демо управления', demoNotice:'Это вымышленная демо-задача. Создайте свой проект через «Новая задача».'
  }
};
for (const language of ['kk', 'ru']) Object.assign(dictionary[language], accountMessages[language]);
const fields = ['title','context','users','data','expectedResult','successCriteria','constraints','contact'];
const icons = { grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z', folder:'M3 7V5h6l2 2h10v13H3z', plus:'M12 5v14 M5 12h14', arrow:'M5 12h14 M14 7l5 5-5 5', search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6', brief:'M8 7V4h8v3 M3 7h18v13H3z M3 12h18 M10 12v3h4v-3', check:'M5 12l4 4L19 6', spark:'M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3z', chat:'M3 4h18v13H8l-5 4z', back:'M19 12H5 M10 7l-5 5 5 5' };
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.brief}"/></svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function stored(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
let lang = stored('shoqan-language', 'kk');
if (!['kk','ru'].includes(lang)) lang = 'kk';
let owners = stored('shoqan-owners', {});
if (!owners || typeof owners !== 'object' || Array.isArray(owners)) owners = {};
let tasks = [], current = null, proposals = [], questions = null, translations = new Map(), translation = null, user = null;
let page = '', seq = 0, dirty = false, showOriginal = false, busy = false, loading = false, query = '', sort = 'new', toastTimer;
const t = key => dictionary[lang][key] || key;
const app = document.querySelector('#app');
const level = score => t('level' + (score < 40 ? 0 : score < 70 ? 1 : score < 90 ? 2 : 3));
const tone = score => score >= 90 ? 'good' : score >= 70 ? 'blue' : score >= 40 ? 'warm' : '';
const token = id => owners[id];
const canManage = task => task.canManage || (task.ownership !== 'account' && Boolean(token(task.id)));
function forgetOwner(id) {
  delete owners[id];
  try { localStorage.setItem('shoqan-owners', JSON.stringify(owners)); } catch { /* Account ownership is already saved on the server. */ }
}
function storeOwner(id, value) {
  const next = { ...owners, [id]:value };
  try { localStorage.setItem('shoqan-owners', JSON.stringify(next)); owners = next; }
  catch { throw new Error(t('storageError')); }
}
function ensureStorage() { try { localStorage.setItem('shoqan-check','1'); localStorage.removeItem('shoqan-check'); } catch { throw new Error(t('storageError')); } }
function toast(message, error = false) {
  const node = document.querySelector('#toast'); clearTimeout(toastTimer);
  node.textContent = message; node.className = error ? 'error' : ''; node.hidden = false;
  toastTimer = setTimeout(() => node.hidden = true, error ? 8000 : 4500);
}
async function api(path, method = 'GET', body, owner) {
  let response;
  try { response = await fetch('/api' + path, { method, credentials:'same-origin', headers:{ 'Content-Type':'application/json', ...(owner ? {Authorization:`Bearer ${owner}`} : {}) }, ...(body === undefined ? {} : {body:JSON.stringify(body)}) }); }
  catch { throw new Error(t('networkError')); }
  const result = await response.json();
  if (!response.ok) {
    const authRequest=path.startsWith('/auth/');
    const errorKey=response.status===429 ? 'tooMany' : authRequest ? ({400:'authValidation',401:'authInvalid',409:'authConflict'})[response.status] : ({400:'invalid',401:'authRequired',403:'forbidden',404:'notFound',409:'conflict'})[response.status];
    throw Object.assign(new Error(t(errorKey || 'error')), {status:response.status});
  }
  return result;
}
function shell(content) {
  const active = page === 'mine' || page.startsWith('edit/') || page.startsWith('proposals/') ? 'mine' : page === 'new' ? 'new' : 'catalog';
  document.documentElement.lang = lang; document.title = `Shoqan — ${t(active === 'new' ? 'create' : active)}`;
  app.innerHTML = `<aside class="sidebar"><a class="brand" href="#catalog"><span class="brand-mark">s</span>shoqan<span class="brand-dot">.</span></a><div class="brand-caption">${t('platform')}</div><div class="nav-label">${t('nav')}</div><nav aria-label="${t('workspace')}">${[['catalog','grid','catalog'],['mine','folder','mine'],['new','plus','create']].map(([route,ico,key])=>`<a class="nav-link ${active === route ? 'active':''}" ${active === route ? 'aria-current="page"':''} href="#${route}">${icon(ico)}${t(key)}</a>`).join('')}</nav><div class="sidebar-bottom"><div class="small-help">${icon('spark')}<strong>${t('helpTitle')}</strong>${t('help')}</div><div class="user"><div class="avatar">S</div><div>${t('profile')}<small>${t('profileSub')}</small></div></div></div></aside><div class="workspace"><header class="topbar"><div class="breadcrumb">Shoqan <span> / </span><strong>${t(active === 'new' ? 'create' : active)}</strong></div><div class="top-actions"><span class="online">${t('connected')}</span><div class="language" aria-label="Тіл / Язык"><button data-lang="kk" class="${lang === 'kk'?'active':''}" aria-pressed="${lang === 'kk'}">ҚАЗ</button><button data-lang="ru" class="${lang === 'ru'?'active':''}" aria-pressed="${lang === 'ru'}">РУС</button></div></div></header><main id="main" tabindex="-1">${content}<footer class="footer"><span>${t('footer')}</span><span>${t('footerRight')}</span></footer></main></div>`;
  accountChrome();
}
function accountChrome() {
  const top=document.querySelector('.top-actions');
  top.insertAdjacentHTML('beforeend',user ? `<button class="btn small" data-action="logout">${t('logout')}</button>` : `<a class="btn small" href="#login">${t('login')}</a>`);
  const profile=document.querySelector('.user');
  profile.innerHTML=user ? `<div class="avatar">${esc(user.name.slice(0,1).toUpperCase())}</div><div class="user-info">${esc(user.name)}<small>${esc(user.email)}</small></div>` : `<div class="avatar">S</div><div>${t('profile')}<small>${t('profileSub')}</small></div>`;
  if(page==='login' || page==='register'){
    document.querySelector('.breadcrumb strong').textContent=t(page);
    document.querySelectorAll('.nav-link.active').forEach(link=>{link.classList.remove('active');link.removeAttribute('aria-current');});
  }
}
function authPage(registration, snapshot) { shell(authMarkup(t,esc,registration,snapshot)); document.title=`Shoqan — ${t(registration?'register':'login')}`; }
function guestNotice() { return `<div class="notice">${t('guestNotice')} <a class="text-link" href="#login">${t('login')} →</a></div>`; }
function progress(score) { return `<div class="progress" aria-hidden="true">${Array.from({length:20}, (_,i)=>`<i class="${i*5 < score ? '':'empty'}"></i>`).join('')}</div>`; }
function empty(title, text, action = '') { return `<div class="empty">${icon('folder')}<h3>${t(title)}</h3><p>${t(text)}</p>${action}</div>`; }
function taskCard(task, mine = false) {
  const translated = translations.get(`${task.id}:${task.version}:${lang}`);
  const values = translated?.fields || Object.fromEntries(fields.map(name => [name, task.fields[name].value]));
  const score = task.rating.score;
  return `<article class="task-card"><div class="card-top"><div class="category-icon">${icon('brief')}</div><span class="badge ${tone(score)}">${mine ? t(task.status === 'draft' ? 'draft':'published') : level(score)}</span></div><h3><a href="#${mine ? 'edit':'task'}/${esc(task.id)}">${esc(values.title || task.description.slice(0,70))}</a></h3><p class="card-description">${esc(values.context)}</p><div class="card-bottom"><div class="score-row"><span>${t('completeness')}</span><strong>${score} / 100</strong></div>${progress(score)}<div class="card-footer"><span>${task.id.startsWith('demo-') ? t('demo'):t('task')}</span><a href="#${mine ? 'edit':'task'}/${esc(task.id)}">${t(mine ? 'edit':'details')} →</a></div></div></article>`;
}
function renderCards(mine = false) {
  const list = tasks.filter(task => {
    const tr = translations.get(`${task.id}:${task.version}:${lang}`)?.fields;
    return `${task.fields.title.value} ${task.fields.context.value} ${tr?.title || ''} ${tr?.context || ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
  }).sort((a,b)=>sort === 'score' ? b.rating.score-a.rating.score : b.createdAt.localeCompare(a.createdAt));
  const grid = document.querySelector('#task-grid');
  if (grid) grid.innerHTML = list.length ? list.map(task=>taskCard(task,mine)).join('') : empty(mine && !tasks.length ? 'emptyMine':'noResults', mine && !tasks.length ? 'emptyMineText':'noResultsText', mine ? `<a class="btn primary" href="#new">${t('newTask')}</a>`:'');
  if(mine && grid)grid.querySelectorAll('.task-card').forEach((card,index)=>{card.querySelector('.card-footer span').textContent=t(list[index].ownership==='account'?'accountSaved':'localOnly');});
}
function catalog(mine = false) {
  shell(`<div class="page-heading"><div><h1>${t(mine ? 'mine':'catalogTitle')}</h1><p class="subtitle">${t(mine ? 'mineSub':'catalogSub')}</p></div><a class="btn primary" href="#new">${icon('plus')}${t('newTask')}</a></div>${mine ? '' : `<section class="hero"><div class="hero-text"><div class="eyebrow">${t('heroLabel')}</div><h2>${t('heroTitle')}</h2><p>${t('heroText')}</p></div><div class="hero-art" aria-hidden="true"><div class="art-card back"></div><div class="art-card"><div class="square">${icon('brief')}</div><div class="art-line"></div><div class="art-line short"></div></div><div class="art-check">✓</div></div></section><div class="stats">${[['brief',tasks.length,'total'],['check',tasks.filter(task=>task.rating.score>=70).length,'ready'],['chat',tasks.length,'open']].map(([ico,n,label])=>`<div class="stat"><div class="stat-icon">${icon(ico)}</div><div><strong>${n.toString().padStart(2,'0')}</strong><small>${t(label)}</small></div></div>`).join('')}</div>`}<div class="section-title"><h2>${t(mine ? 'mine':'allTasks')}</h2><span class="count">${tasks.length}</span></div><div class="toolbar"><div class="search-wrap">${icon('search')}<input id="search" type="search" aria-label="${t('search')}" placeholder="${t('search')}" value="${esc(query)}"></div><select id="sort" aria-label="${t('allLevels')}"><option value="new" ${sort==='new'?'selected':''}>${t('newFirst')}</option><option value="score" ${sort==='score'?'selected':''}>${t('highFirst')}</option></select></div><div id="catalog-translation" class="translation-status" role="status"></div><div id="task-grid" class="grid"></div><p class="footnote">${t('ratingNote')}</p>${mine ? `<details class="panel"><summary>${t('access')}</summary><p>${t('accessHelp')}</p><form id="restore-form" class="restore-form"><label for="restore-id">${t('taskId')}</label><input id="restore-id" name="id" required maxlength="100" autocomplete="off"><label for="restore-token">${t('ownerToken')}</label><input id="restore-token" name="token" type="password" required maxlength="200" autocomplete="off"><button class="btn" type="submit">${t('restore')}</button></form></details>`:''}`);
  renderCards(mine);
  if(mine && !user)document.querySelector('.page-heading').insertAdjacentHTML('afterend',guestNotice());
}
function newPage(description = '') {
  shell(`<div class="narrow"><a class="back" href="#catalog">${icon('back')}${t('back')}</a><h1>${t('createTitle')}</h1><p class="subtitle">${t('createSub')}</p><div class="steps"><span><b>1</b>${t('step1')}</span><span><b>2</b>${t('step2')}</span><span><b>3</b>${t('step3')}</span></div><form id="new-form" class="panel"><label class="form-label" for="description">${t('description')}</label><textarea id="description" name="description" rows="7" maxlength="10000" required placeholder="${t('descriptionPlaceholder')}">${esc(description)}</textarea><p>${t('descriptionHelp')}</p><div class="notice">${t('privateNotice')}</div><button class="btn primary" type="submit">${t('start')}${icon('arrow')}</button><p class="footnote">${t('privacy')}</p></form></div>`);
  if(!user)document.querySelector('.steps').insertAdjacentHTML('afterend',guestNotice());
  else document.querySelector('#new-form .footnote').textContent=t('accountPrivacy');
}
function editor(snapshot) {
  const values = snapshot || current.fields;
  shell(`<a class="back" href="#mine">${icon('back')}${t('mine')}</a><div class="page-heading"><div><h1>${t('editorTitle')}</h1><p class="subtitle">${t('editorSub')}</p></div><span class="badge ${current.status === 'published' ? 'good':''}">${t(current.status === 'published' ? 'published':'draft')}</span></div><div class="detail-layout"><section class="panel"><div class="notice">${t('originalEdit')}</div><div class="actions"><button class="btn soft" data-action="questions">${icon('spark')}${t('getQuestions')}</button><a class="btn" href="#proposals/${esc(current.id)}">${t('manage')}</a></div><div id="questions-status" class="translation-status">${questions ? t(questions.source==='openai'?'aiQuestions':'fallbackQuestions'):''}</div><form id="edit-form">${fields.map(name=>`<div class="edit-field"><label class="form-label" for="field-${name}">${t(name)}</label><p class="question" data-question="${name}">${esc(questions?.questions.find(q=>q.field===name)?.question || '')}</p>${name === 'title' ? `<input id="field-${name}" name="${name}" maxlength="200" value="${esc(values[name].value)}">` : `<textarea id="field-${name}" name="${name}" maxlength="10000">${esc(values[name].value)}</textarea>`}<label class="check"><input type="checkbox" data-confirm="${name}" ${values[name].confirmed?'checked':''}>${t('confirmed')}</label></div>`).join('')}<button class="btn primary" type="submit">${icon('check')}${t('save')}</button></form><section class="publish-box"><h3>${t('publishTitle')}</h3><p>${t('publishHelp')}</p><label class="check"><input type="checkbox" id="reviewed">${t('reviewed')}</label><div class="actions"><button class="btn primary" data-action="publish">${t('publish')}${icon('arrow')}</button></div></section></section><aside>${ratingPanel()}<div class="panel"><details><summary>${t('showAccess')}</summary><p>${t('tokenHelp')}</p><label class="form-label" for="saved-id">${t('taskId')}</label><input id="saved-id" readonly value="${esc(current.id)}"><label class="form-label" for="saved-token">${t('ownerToken')}</label><input id="saved-token" readonly value="${esc(token(current.id))}" type="password"><button class="btn small" data-action="show-token">${t('showAccess')}</button></details></div></aside></div>`);
  const accessPanel=document.querySelector('#saved-id').closest('.panel');
  if(current.ownership==='account')accessPanel.innerHTML=`<h3>${t('accountSaved')}</h3><p>${t('accountProject')}</p>`;
  else if(user && !current.id.startsWith('demo-'))accessPanel.insertAdjacentHTML('afterbegin',`<p>${t('claimHelp')}</p><button class="btn soft" data-action="claim">${t('claim')}</button>`);
}
function ratingPanel() { return `<div class="panel"><div class="eyebrow">${t('completeness')}</div><div class="rating-large">${current.rating.score}<small> / 100</small></div><span class="badge ${tone(current.rating.score)}">${level(current.rating.score)}</span><div class="breakdown">${current.rating.breakdown.map(item=>`<div><span>${t(item.field)}</span><strong>${item.points} / ${item.max}</strong></div>`).join('')}</div><p class="footnote">${t('ratingNote')}</p></div>`; }
function translationStatus() {
  if (!translation) return t('translating');
  if (translation.source === 'openai') return `${t('translated')} <button data-action="toggle-original">${t(showOriginal ? 'translatedView':'original')}</button>`;
  return `${t(translation.reason === 'not_configured' ? 'keyMissing':'translationUnavailable')} <button data-action="translate">${t('retry')}</button>`;
}
function detail() {
  const values = !showOriginal && translation?.source === 'openai' ? translation.fields : Object.fromEntries(fields.map(name => [name,current.fields[name].value]));
  shell(`<a class="back" href="#catalog">${icon('back')}${t('back')}</a><div class="detail-layout"><div><section class="panel"><div class="detail-head"><h1 id="detail-title">${esc(values.title || current.description.slice(0,70))}</h1><span class="badge ${tone(current.rating.score)}">${level(current.rating.score)}</span></div><div id="translation-status" class="translation-status" role="status">${translationStatus()}</div>${current.id.startsWith('demo-') ? `<div class="notice">${t('demoNotice')}</div>`:''}<dl>${fields.filter(name=>name!=='title').map(name=>`<div class="detail-field"><dt>${t(name)}</dt><dd data-detail="${name}">${esc(values[name] || t('noValue'))}</dd></div>`).join('')}</dl>${canManage(current) ? `<a class="btn" href="#edit/${esc(current.id)}">${t('edit')}</a>`: current.id.startsWith('demo-') ? `<button class="btn" data-action="demo-owner">${t('demoManage')}</button>`:''}</section>${current.status==='published' ? `<section class="panel"><h2>${t('propose')}</h2><p>${t('proposalHelp')}</p><form id="proposal-form">${[['teamName',200],['contact',1000]].map(([name,max])=>`<div class="form-group"><label class="form-label" for="proposal-${name}">${t(name==='contact'?'teamContact':name)}</label><input id="proposal-${name}" name="${name}" maxlength="${max}" required></div>`).join('')}<div class="form-group"><label class="form-label" for="proposal-message">${t('message')}</label><textarea id="proposal-message" name="message" required maxlength="10000"></textarea></div><button type="submit" class="btn primary">${t('send')}${icon('arrow')}</button></form></section>`:''}</div><aside>${ratingPanel()}</aside></div>`);
}
function refreshDetailTranslation() {
  const values = !showOriginal && translation?.source==='openai' ? translation.fields : Object.fromEntries(fields.map(name=>[name,current.fields[name].value]));
  document.querySelector('#detail-title').textContent = values.title || current.description.slice(0,70);
  document.querySelectorAll('[data-detail]').forEach(el=>el.textContent=values[el.dataset.detail] || t('noValue'));
  document.querySelector('#translation-status').innerHTML = translationStatus();
}
function proposalPage() {
  shell(`<a class="back" href="#edit/${esc(current.id)}">${icon('back')}${t('edit')}</a><div class="page-heading"><div><h1>${t('proposals')}</h1><p class="subtitle">${esc(current.fields.title.value || current.description)}</p></div><span class="count">${proposals.length}</span></div><section class="panel">${proposals.length ? proposals.map(p=>`<article class="proposal"><div class="proposal-head"><h3>${esc(p.teamName)}</h3><span class="badge ${p.status==='accepted'?'good':p.status==='pending'?'warm':''}">${t(p.status)}</span></div><p>${esc(p.message)}</p><p><strong>${t('teamContact')}:</strong> ${esc(p.contact)}</p><div class="actions"><button class="btn soft" data-decision="accepted" data-id="${esc(p.id)}" ${p.status==='accepted'?'disabled':''}>${icon('check')}${t('accept')}</button><button class="btn danger" data-decision="rejected" data-id="${esc(p.id)}" ${p.status==='rejected'?'disabled':''}>${t('reject')}</button></div></article>`).join(''):empty('noProposals','noProposalsText')}</section>`);
}
async function loadCatalogTranslations(mine, generation) {
  const status = document.querySelector('#catalog-translation');
  if (!tasks.length) return;
  status.textContent=t('translating');
  // Bound concurrency and stop issuing requests when the user leaves this view.
  let cursor = 0, unavailable = false, reason;
  const snapshot = tasks.slice(), language = lang;
  async function worker() {
    while (cursor < snapshot.length && seq === generation) {
      const task = snapshot[cursor++], key = `${task.id}:${task.version}:${language}`;
      try {
        const result = translations.get(key) || await api(`/tasks/${encodeURIComponent(task.id)}/translate`, 'POST', {language}, token(task.id));
        if (seq !== generation) return;
        if (result.source === 'openai') translations.set(key,result);
        else { unavailable=true; reason=result.reason; }
      } catch { unavailable=true; }
    }
  }
  await Promise.all([worker(),worker()]);
  if (seq !== generation) return;
  renderCards(mine); status.textContent=t(unavailable ? reason==='not_configured'?'keyMissing':'translationUnavailable':'translated');
}
async function loadTranslation(generation) {
  const task = current, language = lang;
  try {
    const result = await api(`/tasks/${encodeURIComponent(task.id)}/translate`,'POST',{language},token(task.id));
    if (seq !== generation) return;
    translation=result; refreshDetailTranslation();
  } catch { if (seq === generation) { translation={source:'original',reason:'api_unavailable'}; refreshDetailTranslation(); } }
}
async function route() {
  const generation = ++seq;
  loading=true;
  page = location.hash.slice(1) || 'catalog'; dirty=false; questions=null; translation=null; showOriginal=false;
  shell(`<div class="loading" role="status">${t('loading')}</div>`);
  window.scrollTo(0,0);
  try {
    user=(await api('/auth/me')).user;
    if(seq!==generation)return;
    if(page==='login' || page==='register'){authPage(page==='register');return;}
    if (page==='new') { newPage(); return; }
    if (page==='catalog' || page==='mine') {
      const mine=page==='mine';
      let results, failed=false;
      if(mine){
        const accountTasks=user ? (await api('/tasks/mine')).tasks : [];
        const settled=await Promise.allSettled(Object.keys(owners).map(id=>api(`/tasks/${encodeURIComponent(id)}`,'GET',undefined,token(id)).then(r=>r.task)));
        const localTasks=settled.filter(item=>item.status==='fulfilled').map(item=>item.value).filter(task=>canManage(task));
        results=[...new Map([...accountTasks,...localTasks].map(task=>[task.id,task])).values()];
        failed=settled.some(item=>item.status==='rejected');
      }else results=(await api('/tasks')).tasks;
      if (seq!==generation) return;
      tasks=results; catalog(mine); if(failed)toast(t('unavailableProjects'),true); void loadCatalogTranslations(mine,generation); return;
    }
    const match=page.match(/^(task|edit|proposals)\/([^/]+)$/);
    if (!match) { location.hash='catalog'; return; }
    const [,view,id]=match;
    const result=await api(`/tasks/${encodeURIComponent(id)}`,'GET',undefined,token(id));
    if(seq!==generation)return;
    current=result.task;
    if(view!=='task' && !canManage(current)) throw new Error(t('forbidden'));
    if(view==='edit') { editor(); return; }
    if(view==='proposals') { const result=await api(`/tasks/${encodeURIComponent(id)}/proposals`,'GET',undefined,token(id)); if(seq!==generation)return; proposals=result.proposals; proposalPage(); return; }
    detail(); void loadTranslation(generation);
  } catch(error) { if(seq===generation)shell(`<div class="panel"><h2>${t('error')}</h2><p>${esc(error.message)}</p><button class="btn" data-action="reload">${t('reload')}</button> <a class="btn" href="#catalog">${t('back')}</a></div>`); }
  finally {if(seq===generation)loading=false;}
}
function formValues() { return Object.fromEntries(fields.map(name=>[name,{value:document.querySelector(`#field-${name}`).value,confirmed:document.querySelector(`[data-confirm="${name}"]`).checked}])); }
async function act(button, action) {
  if(busy)return; busy=true;
  // inert blocks edits during a request without excluding fields from FormData.
  const wasDisabled=button?.disabled;
  app.inert=true;
  app.setAttribute('aria-busy','true');
  if(button)button.disabled=true;
  try { await action(); } catch(error) { toast(error.message,true); }
  finally { busy=false; app.inert=false; app.removeAttribute('aria-busy'); if(button?.isConnected)button.disabled=wasDisabled; }
}
async function switchLanguage(language) {
  if(language===lang || busy || loading)return;
  const snapshot=page.startsWith('edit/') ? formValues():null;
  const description=document.querySelector('#description')?.value;
  const proposalForm=document.querySelector('#proposal-form');
  const proposalValues=proposalForm ? Object.fromEntries(new FormData(proposalForm)):null;
  const authForm=document.querySelector('#auth-form');
  const authValues=authForm ? Object.fromEntries(new FormData(authForm)):null;
  const wasDirty=dirty;
  lang=language; try{localStorage.setItem('shoqan-language',JSON.stringify(lang));}catch{}
  ++seq;
  if(page==='login' || page==='register'){
    authPage(page==='register',authValues);
    if(authValues)document.querySelector('#auth-password').value=authValues.password;
  }
  else if(page==='new')newPage(description);
  else if(page.startsWith('edit/') && current){questions=null;editor(snapshot);}
  else if(page.startsWith('task/') && current){translation=null;detail();if(proposalValues)for(const [name,value]of Object.entries(proposalValues))document.querySelector(`#proposal-${name}`).value=value;void loadTranslation(seq);}
  else if(page.startsWith('proposals/') && current)proposalPage();
  else {catalog(page==='mine');void loadCatalogTranslations(page==='mine',seq);}
  dirty=wasDirty;
}
app.addEventListener('input',event=>{
  if(event.target.id==='search'){query=event.target.value;renderCards(page==='mine');return;}
  if(event.target.closest('#edit-form')){
    dirty=true; const reviewed=document.querySelector('#reviewed');if(reviewed)reviewed.checked=false;
    if(event.target.name && fields.includes(event.target.name))document.querySelector(`[data-confirm="${event.target.name}"]`).checked=false;
  }
  if(event.target.closest('#new-form') || event.target.closest('#proposal-form'))dirty=true;
});
app.addEventListener('change',event=>{if(event.target.id==='sort'){sort=event.target.value;renderCards(page==='mine');}});
app.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');
  if(link){
    if(link.getAttribute('href')==='#main'){event.preventDefault();document.querySelector('#main')?.focus();return;}
    if(busy || (dirty && !confirm(t('unsaved')))){event.preventDefault();return;}
    dirty=false;
  }
  const language=event.target.closest('[data-lang]');if(language){void switchLanguage(language.dataset.lang);return;}
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.decision)void act(button,async()=>{
    const proposal=proposals.find(p=>p.id===button.dataset.id);
    const result=await api(`/proposals/${encodeURIComponent(proposal.id)}`,'PATCH',{version:proposal.version,status:button.dataset.decision},token(current.id));
    proposals=proposals.map(p=>p.id===proposal.id?result.proposal:p);proposalPage();toast(t('decisionSaved'));
  });
  const action=button.dataset.action;
  if(action==='logout'){
    if(dirty && !confirm(t('unsaved')))return;
    void act(button,async()=>{
      await api('/auth/logout','POST',{});user=null;dirty=false;current=null;proposals=[];translations.clear();
      toast(t('loggedOut'));if(location.hash==='#catalog')await route();else location.hash='catalog';
    });
  }
  if(action==='claim')void act(button,async()=>{
    if(dirty)throw new Error(t('saveFirst'));
    const result=await api(`/tasks/${encodeURIComponent(current.id)}/claim`,'POST',{},token(current.id));
    forgetOwner(current.id);current=result.task;editor();toast(t('claimed'));
  });
  if(action==='reload'){if(!dirty || confirm(t('unsaved')))void route();}
  if(action==='toggle-original'){showOriginal=!showOriginal;refreshDetailTranslation();}
  if(action==='show-token'){const input=document.querySelector('#saved-token');input.type=input.type==='password'?'text':'password';}
  if(action==='translate')void act(button,()=>loadTranslation(seq));
  if(action==='demo-owner')void act(button,async()=>{storeOwner(current.id,'local-demo-owner');location.hash=`edit/${current.id}`;});
  if(action==='questions')void act(button,async()=>{
    if(dirty)throw new Error(t('saveFirst'));
    const generation=seq; document.querySelector('#questions-status').textContent=t('questionsLoading');
    try {
      const result=await api(`/tasks/${encodeURIComponent(current.id)}/clarify`,'POST',{language:lang},token(current.id));
      if(generation!==seq)return;
      questions=result;
      document.querySelector('#questions-status').textContent=t(result.source==='openai'?'aiQuestions':'fallbackQuestions');
      document.querySelectorAll('[data-question]').forEach(el=>el.textContent=result.questions.find(q=>q.field===el.dataset.question)?.question || '');
    } catch(error){document.querySelector('#questions-status').textContent=t('error');throw error;}
  });
  if(action==='publish')void act(button,async()=>{
    if(dirty)throw new Error(t('saveFirst'));
    if(!document.querySelector('#reviewed').checked)throw new Error(t('reviewFirst'));
    const result=await api(`/tasks/${encodeURIComponent(current.id)}/publish`,'POST',{version:current.version,reviewed:true},token(current.id));
    current=result.task;toast(t('publishedToast'));location.hash=`task/${current.id}`;
  });
});
app.addEventListener('submit',event=>{
  event.preventDefault();const form=event.target,button=event.submitter;
  void act(button,async()=>{
    if(form.id==='auth-form'){
      try{
        const result=await api(`/auth/${form.dataset.mode}`,'POST',Object.fromEntries(new FormData(form)));
        form.reset();user=result.user;dirty=false;translations.clear();toast(t('authSuccess'));location.hash='mine';
      }catch(error){
        const notice=document.querySelector('#auth-error');notice.textContent=error.message;notice.hidden=false;
        document.querySelector('#auth-password').value='';throw error;
      }
    }
    if(form.id==='new-form'){
      if(!user)ensureStorage();const description=new FormData(form).get('description').trim();if(!description)throw new Error(t('invalid'));
      const result=await api('/tasks/draft','POST',{description});if(result.ownerToken)storeOwner(result.task.id,result.ownerToken);dirty=false;location.hash=`edit/${result.task.id}`;
    }
    if(form.id==='edit-form'){
      const result=await api(`/tasks/${encodeURIComponent(current.id)}`,'PATCH',{version:current.version,fields:formValues()},token(current.id));
      current=result.task;dirty=false;editor();toast(t('saved'));
    }
    if(form.id==='proposal-form'){
      const values=Object.fromEntries(new FormData(form));if(Object.values(values).some(value=>!value.trim()))throw new Error(t('invalid'));
      await api(`/tasks/${encodeURIComponent(current.id)}/proposals`,'POST',values);form.reset();dirty=false;toast(t('proposalSent'));
    }
    if(form.id==='restore-form'){
      const values=Object.fromEntries(new FormData(form)),id=values.id.trim(),owner=values.token.trim();
      // Proposal list requires owner authorization even when a task is public.
      await api(`/tasks/${encodeURIComponent(id)}/proposals`,'GET',undefined,owner);storeOwner(id,owner);toast(t('accessSaved'));await route();
    }
  });
});
window.addEventListener('beforeunload',event=>{if(dirty || busy){event.preventDefault();event.returnValue='';}});
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();document.querySelector('#main')?.focus();});
window.addEventListener('hashchange',()=>{
  if(busy || (dirty && !confirm(t('unsaved')))){history.replaceState(null,'',`#${page}`);return;}
  void route();
});
void route();
