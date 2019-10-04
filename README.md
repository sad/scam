# scam
![airbnb eslint style](https://camo.githubusercontent.com/1c5c800fbdabc79cfaca8c90dd47022a5b5c7486/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f636f64652532307374796c652d616972626e622d627269676874677265656e2e7376673f7374796c653d666c61742d737175617265)

**scam** (the **soundcloud account manager**) is a simple account switching extension for [SoundCloud](https://soundcloud.com). it's currently in development – pull requests welcome. new accounts are automatically added every time you log in. you can find them under the username dropdown.

a .crx file will be provided in the releases section, and the extension will be uploaded to the chrome webstore shortly.

### contributing
please use `yarn` or your favourite package manager to install the airbnb eslint base after cloning the repo.
### todo
- code cleanup (remove cookies.js dependency)
- proper extension icons
- check for when user changes username(?)
- fix username overflowing in switcher (text-overflow: ellipsis)
- fix switcher not rendering on first login