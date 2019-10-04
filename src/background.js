chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request === 'forceLogout') {
    chrome.cookies.remove({
      url: 'https://api-auth.soundcloud.com/connect/',
      name: '_session_auth_key',
    }, () => sendResponse(true));
  }

  return false;
});
