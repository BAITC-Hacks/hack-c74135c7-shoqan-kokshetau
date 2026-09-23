export const accountMessages = {
  kk: {
    login: 'Кіру', register: 'Тіркелу', logout: 'Шығу', account: 'Аккаунт', name: 'Атыңыз', email: 'Email', password: 'Құпиясөз',
    loginTitle: 'Жобаларыңызға қайта оралыңыз', registerTitle: 'Өз аккаунтыңызды жасаңыз',
    authHelp: 'Бір аккаунтпен осы сайтқа басқа браузерден кіріп, тапсырмаларыңызды басқара аласыз.',
    passwordHelp: '12–128 таңба. Басқа сайтта қолданбайтын құпиясөз таңдаңыз.',
    noAccount: 'Әлі аккаунтыңыз жоқ па?', haveAccount: 'Аккаунтыңыз бар ма?',
    authSuccess: 'Аккаунтқа кірдіңіз', loggedOut: 'Аккаунттан шықтыңыз',
    authRequired: 'Аккаунтқа кіріңіз немесе қайта кіріп көріңіз.', authInvalid: 'Email немесе құпиясөз дұрыс емес.',
    authConflict: 'Бұл email арқылы тіркелу мүмкін емес. Кіруді қолданып көріңіз.', authValidation: 'Атыңызды, email мен құпиясөзді тексеріңіз. Құпиясөз кемінде 12 таңба болуы керек.',
    tooMany: 'Сұрау лимитіне жеттіңіз. Біраз уақыттан кейін қайталап көріңіз.',
    accountSaved: 'Аккаунтта сақталған', accountProject: 'Бұл жоба аккаунтыңызға қосылған. Басқа браузерден сол email мен құпиясөз арқылы ашылады.',
    guestNotice: 'Қазір қонақ ретінде жұмыс істеп отырсыз. Жаңа жобаларды аккаунтта сақтау үшін кіріңіз.',
    guestContinue: 'Қонақ ретінде жалғастыру', claim: 'Осы аккаунтқа қосу',
    claimHelp: 'Бұл жоба тек осы браузер кілтімен ашылады. Аккаунтқа қосқаннан кейін бұрынғы кілт жұмысын тоқтатады.',
    claimed: 'Жоба аккаунтқа қосылды', accountName: 'Аккаунт иесі',
    localProjects: 'Осы браузердегі бұрынғы жобалар', localOnly: 'Осы браузерде', recoveryNote: 'Email растау мен ұмытылған құпиясөзді қалпына келтіру әзірге қосылмаған.',
    accountPrivacy: 'Жоба аккаунтыңызға сақталады. Қолданғаннан кейін ортақ компьютерден шығып кетіңіз.'
  },
  ru: {
    login: 'Войти', register: 'Регистрация', logout: 'Выйти', account: 'Аккаунт', name: 'Ваше имя', email: 'Email', password: 'Пароль',
    loginTitle: 'Вернитесь к своим проектам', registerTitle: 'Создайте свой аккаунт',
    authHelp: 'Войдите в этот сайт с тем же аккаунтом в другом браузере, чтобы управлять своими задачами.',
    passwordHelp: 'От 12 до 128 символов. Используйте пароль, который не применяете на других сайтах.',
    noAccount: 'Ещё нет аккаунта?', haveAccount: 'Уже зарегистрированы?',
    authSuccess: 'Вы вошли в аккаунт', loggedOut: 'Вы вышли из аккаунта',
    authRequired: 'Войдите в аккаунт или выполните вход повторно.', authInvalid: 'Неверный email или пароль.',
    authConflict: 'Не удалось зарегистрироваться с этим email. Попробуйте войти.', authValidation: 'Проверьте имя, email и пароль. Пароль должен содержать минимум 12 символов.',
    tooMany: 'Достигнут лимит запросов. Попробуйте немного позже.',
    accountSaved: 'Сохранено в аккаунте', accountProject: 'Этот проект привязан к аккаунту. В другом браузере войдите с тем же email и паролем.',
    guestNotice: 'Сейчас вы работаете как гость. Войдите, чтобы сохранять новые проекты в аккаунте.',
    guestContinue: 'Продолжить как гость', claim: 'Привязать к этому аккаунту',
    claimHelp: 'Этот проект доступен по ключу браузера. После привязки к аккаунту прежний ключ перестанет работать.',
    claimed: 'Проект привязан к аккаунту', accountName: 'Владелец аккаунта',
    localProjects: 'Прежние проекты в этом браузере', localOnly: 'В этом браузере', recoveryNote: 'Подтверждение email и восстановление забытого пароля пока не подключены.',
    accountPrivacy: 'Проект сохранится в вашем аккаунте. На общем компьютере выходите после работы.'
  }
};

export function authMarkup(t, esc, registration, snapshot = {}) {
  return `<div class="narrow auth-page"><a class="back" href="#catalog">← ${t('back')}</a>
    <div class="panel"><div class="auth-emblem">s</div><h1>${t(registration ? 'registerTitle' : 'loginTitle')}</h1><p>${t('authHelp')}</p>
    <form id="auth-form" data-mode="${registration ? 'register' : 'login'}">
      ${registration ? `<div class="form-group"><label class="form-label" for="auth-name">${t('name')}</label><input id="auth-name" name="name" required maxlength="100" autocomplete="name" value="${esc(snapshot.name || '')}"></div>` : ''}
      <div class="form-group"><label class="form-label" for="auth-email">${t('email')}</label><input id="auth-email" name="email" type="email" required maxlength="254" autocomplete="email" value="${esc(snapshot.email || '')}"></div>
      <div class="form-group"><label class="form-label" for="auth-password">${t('password')}</label><input id="auth-password" name="password" type="password" required minlength="12" maxlength="128" autocomplete="${registration ? 'new-password' : 'current-password'}"><small>${t('passwordHelp')}</small></div>
      <div id="auth-error" class="notice error" role="alert" hidden></div>
      <button class="btn primary auth-submit" type="submit">${t(registration ? 'register' : 'login')} →</button>
    </form><p class="auth-switch">${t(registration ? 'haveAccount' : 'noAccount')} <a href="#${registration ? 'login' : 'register'}">${t(registration ? 'login' : 'register')}</a></p>
    <p class="footnote">${t('recoveryNote')}</p></div></div>`;
}
