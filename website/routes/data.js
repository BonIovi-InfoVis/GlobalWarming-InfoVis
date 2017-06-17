var express = require('express');
var router = express.Router();

const fs = require('fs');
const NetCDFReader = require('netcdfjs');
var async = require('async');

var wc = require('which-country');


var daysFrom1800ToYear = function (days) {
	function leapYearsBetween(start, end) {
		return leapYearsBefore(end) - leapYearsBefore(start + 1);
	}

	function leapYearsBefore(year){
		year--;
		return Math.floor((year / 4)) - Math.floor((year / 100)) + Math.floor((year / 400));
	}

	var ly = leapYearsBetween(1800, 1800 + Math.floor(days / 365)); // it's ok since even in 200 years it's just 0.5 more, that will be corrected on the next line
	days = days - ly;

	return 1800 + Math.floor(days / 365);
}


/* GET home page. */
router.get('/temperatureByCoordinates', function (req, res, next) {

	const data = fs.readFileSync('./data/gistemp1200_ERSSTv4.nc');
	// reads the data from the file 
	var reader = new NetCDFReader(data); // read the header
	var lon = reader.getDataVariable('lon');
	var lat = reader.getDataVariable('lat');
	var tm = reader.getDataVariable('time');
	var tempanomaly = reader.getDataVariable('tempanomaly')

	var aggregate = {};

	var min = null;

	async.eachOf(lon, function (lonCoord, lonKey, callback) {
		console.log((lonKey / 179) * 100 + "%");
		async.eachOf(lat, function (latCoord, latKey, callback) {
			async.eachOf(tm, function (timeValue, timeKey, callback) {
				var year = daysFrom1800ToYear(timeValue)
				var dataIndex = 1 + lonKey + 180 * (latKey + 90 * timeKey); // lon + lon.dim * (lat + lat.dim * time)
				
				index = year + ";" + lonCoord + ";" + latCoord;
				if (typeof aggregate[index] == 'undefined') {
					aggregate[index] = { "sum": 0, "count": 0 };
				}
				if (tempanomaly[dataIndex] != 32767) {
					aggregate[index].sum += parseInt(tempanomaly[dataIndex]/100);
					aggregate[index].count++;
				}

				callback(null);
			}, function (err) {
				if (err) {
					console.log('Error in tm loop');
					console.log(err);
				}
			});
			callback(null);
		}, function (err) {
			if (err) {
				console.log('Error in lat loop');
				console.log(err);
			}
		});
		callback(null);
	}, function (err) {
		if (err) {
			console.log('Error in lon loop');
			console.log(err);
		} else {
			//console.log('All files have been processed successfully');

			dataByYear = {};
			var even = 0;
			for (var attributename in aggregate) {
				var keyData = attributename.split(";");
				if(even == 0) {
					if(keyData[0] == 1880 || keyData[0] == 2016) {
						if(typeof dataByYear[keyData[0].toString()] == 'undefined') {
							dataByYear[keyData[0].toString()] = [];
						}
						var valueToAdd = 0.1 * aggregate[attributename].sum / aggregate[attributename].count;
						if(valueToAdd == null)
							valueToAdd = -0.67;
						dataByYear[keyData[0].toString()].push(parseInt(keyData[2]), parseInt(keyData[1]), valueToAdd);
					}
					//even = 1;
				}
				else even = 0;
				//aggregate[attributename] = (aggregate[attributename].sum / aggregate[attributename].count);
			}

			//console.log(aggregate);
			res.json(dataByYear);

		}

	});

}).get('/emissionsByCoordinates', function (req, res, next) {

	const data = fs.readFileSync('./data/odiac2016_1x1d_2015.nc');
	// reads the data from the file 
	var reader = new NetCDFReader(data); // read the header
	var lon = reader.getDataVariable('lon');
	var lat = reader.getDataVariable('lat');
	var tm = reader.getDataVariable('month');
	var emissions = reader.getDataVariable('land')
	var emissions2 = reader.getDataVariable('intl_bunker')

	var aggregate = {};

	var min = null;

	async.eachOf(lon, function (lonCoord, lonKey, callback) {
		console.log((lonKey / 179) * 50 + "%");
		async.eachOf(lat, function (latCoord, latKey, callback) {
			async.eachOf(tm, function (timeValue, timeKey, callback) {
				var year = "2015"
				var dataIndex = 1 + lonKey + 360 * (latKey + 180 * timeKey); // lon + lon.dim * (lat + lat.dim * time)
				
				index = year + ";" + lonCoord + ";" + latCoord;
				if (typeof aggregate[index] == 'undefined') {
					aggregate[index] = 0;
				}
				
				aggregate[index] += parseInt(emissions[dataIndex] + emissions2[dataIndex]/2000);
			

				callback(null);
			}, function (err) {
				if (err) {
					console.log('Error in tm loop');
					console.log(err);
				}
			});
			callback(null);
		}, function (err) {
			if (err) {
				console.log('Error in lat loop');
				console.log(err);
			}
		});
		callback(null);
	}, function (err) {
		if (err) {
			console.log('Error in lon loop');
			console.log(err);
		} else {
			//console.log('All files have been processed successfully');

			dataByYear = {};
			countries = {};
			offset = 0;

			for (var attributename in aggregate) {
				var keyData = attributename.split(";");

				if(keyData[0] == 2015) {
					if(typeof dataByYear[keyData[0].toString()] == 'undefined') {
						dataByYear[keyData[0].toString()] = [];
					}
					keyData[1]++;
					keyData[2]++;
					country = wc([keyData[1], keyData[2]]);
					if(typeof countries[country] == 'undefined') {
						countries[country] = offset;
						offset++;
					}
					var valueToAdd = 0.003 * aggregate[attributename];
					if(valueToAdd == null)
						valueToAdd = 0;
					
					dataByYear[keyData[0].toString()].push(parseInt(keyData[2]), parseInt(keyData[1]), valueToAdd, countries[country]);
				}

			}

			console.log(countries);
			res.json(dataByYear);

		}

	});

});

module.exports = router;
