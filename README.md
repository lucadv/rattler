# Overview

TODO

## Usage

TODO

```javascript
const Rattler = require('rattler');

const config = {
  baseURL: 'https://www.google.co.uk', 
  extract: [{
    label: 'resultStats',
    from: '/search?q=let+me+google+that+for+you&oq=let+me+google+this+for+you',
    path: 'div.resultStats'
  }]
}
const rt = new Rattler(config);
rt.extract().then(res => console.log(res)).catch(err => console.log(err));
```