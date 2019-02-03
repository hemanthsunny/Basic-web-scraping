var webdriver = require("selenium-webdriver");
var fs = require("fs");
var chrome = require("chromedriver");

var driver = null;
const delayFactor = 1;

const travelInsurance = "Circle Cover";
var site = require("./" + travelInsurance);
var params = require("./" + travelInsurance + "/data.js").data;
var currentParams = undefined;

const filePath = travelInsurance + ".csv";
console.log("runing travel insurance website: " + travelInsurance);

function LoopParams() {
	console.log('Looping params');
	if(params.length < 1) {
		console.log("There is no test case in data file | All Params Have Been  Passed");
		return;
	}
	currentParams = params.shift();
	ExecuteLoopParams(currentParams);
}

function ExecuteLoopParams(currentParams) {
	driver = new webdriver.Builder().forBrowser("chrome").build();
	console.log("currentParams", JSON.stringify(currentParams))
	var _groupType = currentParams.ages.length == 1 ? 'single' : currentParams.ages.length == 2 ? 'couple' : 'family';
	site.Run(
		currentParams.tripType, 
		currentParams.location, 
		_groupType, 
		currentParams.tripDays, 
		currentParams.ages, 
		delayFactor, 
		driver, 
		function(results) {
			for(var i=0; i < results.length; i++) {
				AppendResultsToCSV(results[i]);
			}
			driver.quit();
		}
	);
}

function AppendResultsToCSV(result) {
	fs.appendFileSync(filePath, ''
		+ result.tripType + ','
		+ result.location + ','
		+ result.groupType + ','
		+ result.tripDays + ','
		+ result.ages.join("&") + ','
		+ result.name + ','
		+ result.price + '\n'
  )
}

LoopParams();
