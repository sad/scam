const emitter = chrome.extension.onMessage ? chrome.extension.onMessage : browser.runtime.onMessage;

emitter.addListener((request, sender, sendResponse) => {
  if (request.method === 'forceLogout') {
    chrome.cookies.remove({
      url: 'https://api-auth.soundcloud.com/connect/',
      name: '_soundcloud_session',
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
      expirationDate: Math.floor(+new Date(+new Date() + 31536e6) / 1000), // expiry 1 year from now
    }, (cookie) => sendResponse(cookie));
  } else if (request.method === 'removeCookie') {
    chrome.cookies.remove({
      url: 'https://soundcloud.com/',
      name: request.data.name,
    }, (details) => sendResponse(details));
  } else if (request.method === 'validateCookie') {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) sendResponse(xhr.status === 200);
    };
    xhr.open('POST', 'https://api-auth.soundcloud.com/connect/session');
    xhr.send(JSON.stringify({ session: { access_token: request.data.cookie } }));
  } else if (request.method === 'refreshCookie') {
    const fetchNewCookie = () => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          sendResponse(JSON.parse(xhr.responseText).session.access_token);
        }
      };
      xhr.open('POST', 'https://api-auth.soundcloud.com/connect/session/token');
      xhr.send('null');
    };
    if (request.data && request.data.cookie) {
      chrome.cookies.set({
        url: 'https://api-auth.soundcloud.com/connect/',
        name: '_soundcloud_session',
        value: request.data.cookie,
        secure: true,
        SameSiteStatus: 'no_restriction',
      }, () => fetchNewCookie());
    } else fetchNewCookie();
  }

  return true;
});
