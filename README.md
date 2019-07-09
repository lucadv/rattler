# Overview

Rattler is the next web scraper, designed to rattle around the web and extract the info that you need, quickly, efficiently and very politely. In other words, getting the stuff done!

You just have to tell the Rattler where is the stuff that you want and how to extract it. Rattler uses Cheerio to load the page and return the stuff that you want, so you can use css selectors (basically the path inside the DOM of the element) to define where in the page you want to extract the info.

You can extract from one page or multiple pages, depending on the configuration. See the usage section. 
## Usage

### constructor()

Attribute name | Type | Required | Info
---------|----------|---------|---------
config | object | `yes` | The config object containing information about what and where you want to extract.
config.baseURL | string | `yes` | The base url from which you want to load the page for all requests.
config.scrapeList | object[] | `yes` | The scrape list of stuff that you want to extract. Must have min one element inside.
config.scrapeList[n].label | string | `yes` | Each scrape request in the scrape list will produce a result in JSON format, this field represent the name of the key inside the result of this scrape request.
config.scrapeList[n].searchURL | string | no | The search url to be used to load the page. In absence of a baseURL this field will be required.
config.scrapeList[n].cssSelector | string | `yes` | The [css selector](https://www.w3schools.com/cssref/css_selectors.asp) of the element you want to extract for this particular element in the scrapeList.
config.scrapeList[n].followNext | object | no | An object containing rules to find the next link and follow it to apply the scrape definition
config.scrapeList[n].followNext.cssSelector | string | `yes` | The cssSelector of the next link
config.scrapeList[n].followNext.maxDepth | integer | `yes` | The maximun number of next links that will be followed if found. Min 1, max 20.


#### Config examples

Single request:

```javascript
{
  baseURL: 'https://www.google.co.uk', 
  scrapeList: [{
    label: 'resultStats',
    searchURL: '/search?q=let+me+google+that+for+you',
    cssSelector: '#main-content.section.div.ul.li.next.a'
  }]
}
```

Multiple element extracted from same page:


```javascript
{
  baseURL: 'https://www.google.co.uk', 
  scrapeList: [{
    label: 'resultStats',
    searchURL: '/search?q=let+me+google+that+for+you',
    cssSelector: 'div.resultStats'
  }, {
    label: 'languagesInfo',
    searchURL: '/search?q=let+me+google+that+for+you',
    cssSelector: '#SIvCob'
  }]
}
```

Multiple element extracted from different page in the same baseURL:


```javascript
{
  baseURL: 'https://www.google.co.uk', 
  scrapeList: [{
    label: 'resultStats',
    searchURL: '/search?q=let+me+google+that+for+you',
    cssSelector: 'div.resultStats'
  }, {
    label: 'languagesInfo',
    searchURL: '/search?q=hi+there',
    cssSelector: '#SIvCob'
  }]
}
```

Scrape then follow until you have next page or hit the maxDepth limit

```javascript
{
  baseURL: 'https://www.real-estate-agency.com',
  scrapeList: [{
    label: 'pricesForNewYork',
    searchURL: '/manhattan',
    cssSelector: 'span.item-price',
    followNext: {
      cssSelector: 'div.pagination.ul.li.next',
      maxDepth: 20
    }
  }] 
}
```

### async extract()

This method will extract the information that you have specified in the config from each of the scrapeList element and present the results in JSON format. For each scrapeList element an http request will be performed (or it will load the page from cache if the request has been already executed) and the combined text contentes of each element in the set of matched elemens, including descendands, will be returned. 


### Extract

```javascript
const Rattler = require('rattler');

const config = {
  baseURL: 'https://www.google.co.uk', 
  scrapeList: [{
    label: 'resultStats',
    searchURL: '/search?q=let+me+google+that+for+you',
    cssSelector: 'div.resultStats'
  }]
};
const rt = new Rattler(config);
rt.extract().then(res => console.log(res)).catch(err => console.log(err));
```
