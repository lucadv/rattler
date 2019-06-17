const assert = require("chai").assert;
const scrapper = require("../index.js");

describe("Simple-web-scrapper tests using ASSERT interface from CHAI module: ", function() {
	describe("Check getRealEstatesPrices Function: ", function() {
		it("Check the result (only first line): ", function() {
            const baseURL = 'https://www.idealista.com';
            const searchURL = '/venta-viviendas/malaga/centro/la-victoria-conde-de-urena-gibralfaro/';
            const cssSelector = 'span.item-price';
            const result = getRealEstatesPrices(baseURL, searchURL, cssSelector);
            const firstLine = result.split('\n')[0];
			assert.equal(firstline, "prices for /venta-viviendas/malaga/centro/la-victoria-conde-de-urena-gibralfaro/ [ '237.000',");
		});		
	});		
});
