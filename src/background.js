const emitter = chrome.extension.onMessage ? chrome.extension.onMessage : browser.runtime.onMessage;

emitter.addListener((request, sender, sendResponse) => {
  if (request.method === 'forceLogout') {
    chrome.cookies.remove({
      url: 'https://api-auth.soundcloud.com/connect/',
      name: '_session_auth_key',
    }, () => sendResponse(true));
  } else if (request.method === 'getCookie') {
    chrome.cookies.get({
      url: 'https://soundcloud.com/',
      name: request.data.name,
    }, (cookie) => sendResponse(cookie));
  } else if (request.method === 'setCookie') {
    chrome.cookies.set({
      url: 'https://soundcloud.com/',
      name: request.data.name,
      value: request.data.value,
      secure: true,
    }, (cookie) => sendResponse(cookie));
  } else if (request.method === 'removeCookie') {
    chrome.cookies.remove({
      url: 'https://soundcloud.com/',
      name: request.data.name,
    }, (details) => sendResponse(details));
  }

  return true;
});
