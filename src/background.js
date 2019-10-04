chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request.name === 'forceLogout') {
    chrome.cookies.remove({
      url: 'https://api-auth.soundcloud.com/connect/',
      name: '_session_auth_key',
    }, () => sendResponse(true));
  }

  if (request.name === 'getCookie') {
    chrome.cookies.get({
      url: 'https://soundcloud.com/',
      name: request.data.name,
    }, (cookie) => sendResponse(cookie));
  }

  if (request.name === 'setCookie') {
    chrome.cookies.set({
      url: 'https://soundcloud.com/',
      name: request.data.name,
      value: request.data.value,
      secure: true,
    }, (cookie) => sendResponse(cookie));
  }

  if (request.name === 'removeCookie') {
    chrome.cookies.remove({
      url: 'https://soundcloud.com/',
      name: request.data.name,
    }, (details) => sendResponse(details));
  }

  return true;
});
