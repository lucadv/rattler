## TODOS

  * rename config.extract to config.scrapeList
  * rename `from` inside scrapeList to searchURL
    * reason: make more sense to me
  * relax the cssSelector validation, just a string and required()
    * reason: too hard to support every possible combination in a regex
  * implement an http request per each scrapeList element
  * cache every request, do not repeate the request if it's already been done