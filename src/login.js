const sel = (selector) => document.querySelector(selector);
const getSession = (username) => JSON.parse(localStorage.getItem('sc-accounts'))[username];

const switchSession = (user) => {
  chrome.runtime.sendMessage({ method: 'setCookie', data: { name: 'oauth_token', value: getSession(user) } }, () => {
    return parent.postMessage('_scam_reload', '*')
  });
};

const injectLoggedOutSwitcher = () => {
  if (localStorage.hasOwnProperty('sc-accounts')) {
    const publicSignIn = sel('.provider-buttons');
    const accounts = JSON.parse(localStorage.getItem('sc-accounts'));
    const scamDiv = document.createElement('div');
    const scamBtn = document.createElement('button');
    const accountSelector = document.createElement('select');
    scamDiv.setAttribute('class', 'form-row')
    scamBtn.setAttribute('class', 'provider-button sc-button sc-button-large');
    accountSelector.setAttribute('class', 'provider-button sc-button sc-button-large');
    scamBtn.innerText = 'Saved accounts';
    scamDiv.appendChild(scamBtn);
    publicSignIn.appendChild(scamDiv);
    const firstOption = document.createElement('option');
    firstOption.innerText = 'Accounts';
    firstOption.disabled = true;
    firstOption.selected = true;
    accountSelector.appendChild(firstOption);
    Object.keys(accounts).forEach((accountName) => {
      const accountEl = document.createElement('option');
      accountEl.value = accountName;
      accountEl.innerText = accountName;
      accountSelector.appendChild(accountEl);
    });

    scamBtn.onclick = () => {
      scamBtn.parentNode.replaceChild(accountSelector, scamBtn);
    };

    accountSelector.onchange = () => {
      switchSession(accountSelector.value);
    };
  }
};

let isInjected = false;
const menuObserver = new MutationObserver(() => {
  if (sel('.provider-buttons') && !isInjected) {
    isInjected = true;
    injectLoggedOutSwitcher();
  }
});

const init = () => {
  const observerOptions = { childList: true, subtree: true };
  menuObserver.observe(document.body, observerOptions);
};

init();
