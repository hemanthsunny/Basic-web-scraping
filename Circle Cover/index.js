var webdriver = require("selenium-webdriver"), By = webdriver.By;

var tripTypes = {
	singletrip: 2,
	annualtrip: 3,
	cruisetrip: 4
}

var destinations = {
	singletrip: {
		europe: 2,
		australia: 3,
		worldwideInclude: 4,
		worldwideExclude: 5,
		uk: 6
	},
	annualtrip: {
		europe: 2,
		worldwideInclude: 3		
	},
	cruisetrip: {
		europe: 2,
		australia: 3,
		worldwideInclude: 4,
		worldwideExclude: 5,
		uk: 6
	}
}

exports.Run = (tripType, location, groupType, tripDays, ages, delayFactor, driver, resultCallBack) => {
	driver.get("https://www.circlecover.com/");

	function pause(time, funcName) {
		setTimeout(funcName, time * 1000)
	}

	function convertDate(inputFormat) {
		var d = new Date(inputFormat);
		function padding(S) {
			return (S<10) ? '0'+S : S;
		}
		return [padding(d.getDate()), padding(d.getMonth() + 1), d.getFullYear()].join("/");
	}

	pause(10, setCover);

	function setCover() {
		var id = tripTypes[tripType];
		driver.findElement(By.xpath('//select[@id="ddPolicyType"]/option['+ id +']')).click();
		pause(5, setDestination);
	}

	function setDestination() {
		var id = destinations[tripType][location];
		driver.findElement(By.xpath('//select[@id="ddDestination"]/option['+ id +']')).click();
		pause(5, setTripDuration);
	}

	function setTripDuration() {
		console.log("Running trip duration function...");
		var tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setMonth(tomorrow.getMonth() + 1);
		// For old website
		var dateStr = convertDate(tomorrow);
		console.log("dateStr", dateStr)
	  driver.findElement(By.css('#txtCoverStartDate')).sendKeys(dateStr);
	  // For new website
	  /*
		var startDate = tomorrow.getDate();
		var startMonth = tomorrow.toLocaleString('en-us', {month: 'long'}).substr(0, 2);
		var startYear = tomorrow.getFullYear();
		driver.findElement(By.xpath('//select[@id="startdd"]/option['+ startDate +']'));
		driver.findElement(By.xpath('//select[@id="startmm"]/option['+ startMonth +']'));
		driver.findElement(By.xpath('//select[@id="startyy"]/option['+ startYear +']'));
		*/
		pause(5, function(){
			if(tripType !== "annualtrip") {
				// End date
				var endDates = new Date(tomorrow);
				endDates.setDate(endDates.getDate() + tripDays);
				dateStr = convertDate(endDates);
				console.log("dateStr", dateStr)
				driver.findElement(By.css('#txtCoverEndDate')).click();
				driver.findElement(By.css('#txtCoverEndDate')).clear();
				pause(2, function() {
					driver.findElement(By.css('#txtCoverEndDate')).sendKeys(dateStr);
				})
			  // For new website
			  /*
				var endDate = endDates.getDate();
				var endMonth = endDates.toLocaleString('en-us', {month: 'long'}).substr(0, 2);
				var endYear = endDates.getFullYear();
				pause(2, function() {
					driver.findElement(By.xpath('//select[@id="enddd"]/option['+ endDate +']'));
					driver.findElement(By.xpath('//select[@id="endmm"]/option['+ endMonth +']'));
					driver.findElement(By.xpath('//select[@id="endyy"]/option['+ endYear +']'));
				})
				*/
			}
			pause(4, setAges);
		})
	}

	function setAges() {
		driver.findElement(By.css('#ddlNoOfTravellers option:nth-child('+ ages.length +')')).click();
		pause(3, function() {
			for(var i=0; i< ages.length; i++) {
				driver.findElement(By.id('tb_travellerAge_' + (i+1))).sendKeys(ages[i].toString());
			}
			pause(5, moveToNextPage);
		})
	}

	function moveToNextPage() {
		driver.executeScript('document.getElementById("btnNext").click()');
		// driver.quit();
		pause(10, getPackageName)
	}

	var FinalResults = {
		PackageNames: [],
		PackagePrices: []
	}

	function getPackageName() {
		driver.findElements(By.className("productheadings")).then(function(head) {
			for(var i=0; i < head.length; i++) {
				head[i].getText().then(function(headText) {
					FinalResults.PackageNames.push(headText);
				})
			}
		})
		pause(3, getPackagePrice);
	}

	function getPackagePrice() {
		driver.findElements(By.xpath('//span[@class="comparePriceJustPrice"] /span')).then(function(price) {
			for(var i=0; i < price.length; i++) {
				price[i].getText().then(function(priceText) {
					FinalResults.PackagePrices.push(priceText);
				})
			}
		})
		pause(3, compileResults);
	}

	function compileResults() {
		var toReturn = [];
		for(var i=0; i < FinalResults.PackagePrices.length; i++) {
			toReturn.push({
				tripType: tripType,
				location: location,
				groupType: groupType,
				tripDays: tripDays,
				ages: ages,
				name: FinalResults.PackageNames[i],
				price: FinalResults.PackagePrices[i]
			})
		}
		resultCallBack(toReturn);
	}
}
