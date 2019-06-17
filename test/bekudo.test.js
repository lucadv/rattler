const assert    = require("chai").assert;
const simpleWebScrapper = require("../index");

describe("Simple-web-scrapper tests using ASSERT interface from CHAI module: ", function() {
	describe("Check addTested Function: ", function() {
		it("Check the returned value using: assert.equal(value,'value'): ", function() {
			result   = simpleWebScrapper.addTested("text");
			assert.equal(result, "text tested");
		});		
	});		
});
