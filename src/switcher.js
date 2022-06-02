const SECURE_ORIGIN = 'https://secure.soundcloud.com';
let previousUser;

const sel = (selector) => document.querySelector(selector);
const getSession = (username) => JSON.parse(localStorage.getItem('sc-accounts'))[username];
const getCurrentUser = () => {
  if (sel('.header__userNavUsernameButton') !== null) {
    return new URL(sel('.header__userNavUsernameButton').href).pathname.substr(1);
  }

  return false;
};

const saveSession = (username, sessionData) => {
  const obj = localStorage.hasOwnProperty('sc-accounts') ? JSON.parse(localStorage.getItem('sc-accounts')) : {};
  const storedCookie = Object.keys(obj).find((user) => obj[user].cookie === sessionData.cookie);
  if (storedCookie && username !== storedCookie) delete obj[storedCookie];
  obj[username] = sessionData;
  localStorage.setItem('sc-accounts', JSON.stringify(obj));
};

const deleteSession = (username) => {
  if (localStorage.hasOwnProperty('sc-accounts')) {
    const obj = JSON.parse(localStorage.getItem('sc-accounts'));
    delete obj[username];
    localStorage.setItem('sc-accounts', JSON.stringify(obj));
  }
};

const saveCurrentSession = () => {
  const username = getCurrentUser();

  const sessionData = getSession(username) || {};
  sessionData.notifyState = localStorage.getItem('V2::local::notify');
  saveSession(username, sessionData);

  if (previousUser === username || !username) return;
  previousUser = username;
  chrome.runtime.sendMessage({ method: 'getCookie', data: { name: 'oauth_token' } }, (data) => {
    const cookie = data ? data.value : null;
    if (!cookie) return;

    sessionData.cookie = cookie;
    saveSession(username, sessionData);
  });
};

const switchSession = (user) => {
  saveCurrentSession();

  const sessionData = getSession(user);
  if (sessionData.notifyState != null) localStorage.setItem('V2::local::notify', sessionData.notifyState);

  chrome.runtime.sendMessage({ method: 'setCookie', data: { name: 'oauth_token', value: sessionData.cookie } }, () => {
    location.reload();
  });
};

const forceLogout = () => {
  saveCurrentSession();
  chrome.runtime.sendMessage({ method: 'removeCookie', data: { name: 'oauth_token' } }, () => {
    chrome.runtime.sendMessage({ method: 'forceLogout' }, () => {
      window.location = 'https://soundcloud.com/signin';
    });
  });
};

const injectSwitcher = () => {
  if (localStorage.hasOwnProperty('sc-accounts')) {
    const accounts = JSON.parse(localStorage.getItem('sc-accounts'));
    const list = document.createElement('ul');
    list.setAttribute('class', 'profileMenu__list sc-list-nostyle');

    const addBtn = document.createElement('li');
    addBtn.setAttribute('class', 'headerMenu__list');
    const addLink = document.createElement('a');
    addLink.setAttribute('class', 'headerMenu__link profileMenu__profile');
    addLink.innerText = 'Add Account';
    addLink.id = 'add-account';
    addLink.href = '#';


    addBtn.onclick = () => {
      forceLogout();
    };

    addBtn.appendChild(addLink);
    list.appendChild(addBtn);

    Object.keys(accounts).forEach((account) => {
      if (account === getCurrentUser()) return;

      const wrapper = document.createElement('div');
      const li = document.createElement('li');
      const link = document.createElement('a');

      li.setAttribute('class', 'headerMenu__item');
      link.setAttribute('class', 'headerMenu__link profileMenu__profile');
      link.innerText = account;
      link.id = 'switch-account';
      link.dataset.user = account;
      link.href = '#';
      link.title = account;
      link.style.display = 'inline-block';
      link.style.width = '50%';
      link.style.textOverflow = 'ellipsis';
      link.style.overflow = 'hidden';
      link.style.verticalAlign = 'middle';


      const delBtn = document.createElement('a');

      delBtn.setAttribute('class', 'headerMenu__profile');
      delBtn.innerHTML = '&times;';
      delBtn.id = 'delete-account';
      delBtn.dataset.user = account;
      delBtn.href = '#';
      delBtn.style.padding = '5px';
      delBtn.style.display = 'inline-block';
      delBtn.style.verticalAlign = 'middle';

      delBtn.onclick = (event) => {
        if (confirm(`Are you sure you want to remove the '${event.target.dataset.user}' account?`)) { // eslint-disable-line
          deleteSession(event.target.dataset.user);
          event.target.parentNode.parentNode.removeChild(event.target.parentNode);
        }
      };

      link.onclick = (event) => {
        switchSession(event.target.dataset.user);
      };

      wrapper.appendChild(link);
      wrapper.appendChild(delBtn);
      li.appendChild(wrapper);
      list.appendChild(li);
    });
    if (sel('.profileMenu')) sel('.profileMenu').appendChild(list);
  }
};

const passSessions = (element) => {
  const obj = localStorage.hasOwnProperty('sc-accounts') ? JSON.parse(localStorage.getItem('sc-accounts')) : {};
  element.contentWindow.postMessage(['_scam_sessions', obj], SECURE_ORIGIN);
};

const menuObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    if (addedNodes.includes(sel('.dropdownMenu')) || addedNodes.includes(sel('.headerMenu__list'))) {
      injectSwitcher();
    }
    if (mutation.target.classList && [...mutation.target.classList].includes('header__userNavUsernameButton')) {
      saveCurrentSession();
    }

    addedNodes.forEach((node) => {
      if (node.querySelector && node.querySelector('.webAuthContainer iframe')) {
        const iframe = node.querySelector('.webAuthContainer iframe');
        iframe.onload = () => {
          passSessions(iframe);
        };
      }
    });
  }
});

window.addEventListener('message', (message) => {
  const { origin, data } = message;
  if (origin !== SECURE_ORIGIN) return;

  if (data === '_scam_reload') {
    window.location.reload(true);
  }
}, false);

const init = () => {
  // Migrate from old user sessions format
  const sessions = localStorage.hasOwnProperty('sc-accounts') ? JSON.parse(localStorage.getItem('sc-accounts')) : {};
  Object.keys(sessions).forEach(username => {
    if (typeof sessions[username] === 'string') sessions[username] = { cookie: sessions[username] }
  })
  localStorage.setItem('sc-accounts', JSON.stringify(sessions))

  const observerOptions = { childList: true, subtree: true };
  menuObserver.observe(document.body, observerOptions);
  saveCurrentSession();
};

init();
