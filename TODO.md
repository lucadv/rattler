## TODOS

- [x] BEQUI-1 rename config.extract to config.scrapeList
- [x] BEQUI-2 rename `from` inside scrapeList to searchURL
 * reason: make more sense to me 
- [x] BEQUI-3 relax the cssSelector validation, just a string and required()
    * reason: too hard to support every possible combination in a regex 
- [x] BEQUI-4 implement an http request per each scrapeList element
- [ ] BEQUI-5 cache every request, do not repeate the request if it's already been done (not for now)
- [x] BEQUI-6 what does Axios do when the request returns a status code other than 200? does it reject? does it resolve with an object? In case it resolves, we should implement a failing strategy: when the status code is other than 200, we should build a fail object. Suggestion: scrapeSingle function, check the status code, if not 2xx build and return a failing object. 
- [ ] BEQUI-7 config.scrapeList[n].searchURL, it should be optional and we should just be able to use baseURL if searchURL is not provided
- [ ] BEQUI-8 implement followNext untill you have a link
- [ ] BEQUI-9 A scrape factory is create so that a new scraper is returned for each scrape definition in the scrapeList. We need now to implement the FollowNext scraper
- [ ] BEQUI-10 Add missing test coverage

## Next items:
Please pick the one on top of next and work on a branch

- [ ] BEQUI-7
- [ ] BEQUI-6 (luca: I've implemented error handling in lib/loader, javi: see if you can implement tests for the coverage)
- [ ] BEQUI-8 (picked by luca)
