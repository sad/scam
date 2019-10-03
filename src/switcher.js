/* global Cookies */
const sel = (selector) => document.querySelector(selector);

const saveSession = (username, cookie) => {
  let obj = {};
  if (localStorage.hasOwnProperty('sc-accounts')) {
    obj = JSON.parse(localStorage.getItem('sc-accounts'));
    obj[username] = cookie;
    localStorage.setItem('sc-accounts', JSON.stringify(obj));
  } else {
    obj[username] = cookie;
    localStorage.setItem('sc-accounts', JSON.stringify(obj));
  }
};

const deleteSession = (username) => {
  if (localStorage.hasOwnProperty('sc-accounts')) {
    const obj = JSON.parse(localStorage.getItem('sc-accounts'));
    delete obj[username];
    localStorage.setItem('sc-accounts', JSON.stringify(obj));
  }
};

const getSession = (username) => JSON.parse(localStorage.getItem('sc-accounts'))[username];
const getCurrentUser = () => sel('.header__userNavUsernameButton').href.replace('https://soundcloud.com/', '');

const saveCurrentSession = () => {
  const username = getCurrentUser();
  const cookie = Cookies.get('oauth_token');
  saveSession(username, cookie);
};

const switchSession = (user) => {
  Cookies.set('oauth_token', getSession(user));
  location.reload();
};

const injectSwitcher = () => {
  if (localStorage.hasOwnProperty('sc-accounts')) {
    const accounts = JSON.parse(localStorage.getItem('sc-accounts'));
    const list = document.createElement('ul');
    list.setAttribute('class', 'profileMenu__list sc-list-nostyle');
    Object.keys(accounts).forEach((account, index) => {
      if (account === getCurrentUser()) return;
      const wrapper = document.createElement('div');
      const li = document.createElement('li');
      const link = document.createElement('a');

      li.setAttribute('class', 'profileMenu__item');
      link.setAttribute('class', 'profileMenu__link profileMenu__profile');
      link.innerText = account;
      link.id = 'switch-account';
      link.dataset.user = account;
      link.href = '#';
      link.style.display = 'inline-block';
      link.style.width = '50%';

      const delBtn = document.createElement('a');

      delBtn.setAttribute('class', 'profileMenu__profile');
      delBtn.innerHTML = '&times;';
      delBtn.id = 'delete-account';
      delBtn.dataset.user = account;
      delBtn.href = '#';
      delBtn.style.padding = '5px';
      delBtn.style.display = 'inline-block';

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

      if (index >= Object.keys(accounts).length - 1) {
        sel('.profileMenu').appendChild(list);
      }
    });
  }
};

const menuObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    if (addedNodes.includes(sel('.dropdownMenu')) || addedNodes.includes(sel('.profileMenu__list'))) {
      injectSwitcher();
    }
  }
});

const init = () => {
  saveCurrentSession();
  menuObserver.observe(document.body, {
    childList: true, subtree: true,
  });
};

init();
