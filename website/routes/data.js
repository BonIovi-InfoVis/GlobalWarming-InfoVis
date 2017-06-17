var express = require('express');
var router = express.Router();

const fs = require('fs');
const NetCDFReader = require('netcdfjs');
var async = require('async');


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

	async.eachOf(lon, function (lonCoord, lonKey, callback) {
		console.log((lonKey / 179) * 100 + "%");
		async.eachOf(lat, function (latCoord, latKey, callback) {
			async.eachOf(tm, function (timeValue, timeKey, callback) {
				var year = daysFrom1800ToYear(timeValue)
				var dataIndex = 1 + lonKey + 180 * (latKey + 90 * timeKey); // lon + lon.dim * (lat + lat.dim * time)
				if (tempanomaly[dataIndex] != 32767) {
					index = year + ";" + lonCoord + ";" + latCoord;
					if (typeof aggregate[index] == 'undefined') {
						aggregate[index] = { "sum": 0, "count": 0 };
					}
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
					if(keyData[0] == 1880 || keyData[0] == 1920 || keyData[0] == 1960 || keyData[0] == 2000 || keyData[0] == 2016) {
						if(typeof dataByYear["y" + keyData[0]] == 'undefined') {
							dataByYear["y" + keyData[0]] = [];
						}
						dataByYear["y" + keyData[0]].push(parseInt(keyData[2]), parseInt(keyData[1]), aggregate[attributename].sum / aggregate[attributename].count);
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

});

module.exports = router;
