var parse       = require('csv-parse');
var fs          = require('fs');
var async       = require("async");
var importTools = require('./global.js');

var connection = importTools.init();


connection.query('TRUNCATE TABLE  `unternehmen`;', function() {
Unternehmensnamen alle auf Null
	fs.readFile('drittmittel.csv', 'utf8', function (err, file) {
		parse(
			file,
			{comment: '#', delimiter: ';'},
			function(err, json) {
				async.eachSeries(json,function (hochschule,callback) {
					var post  = {
						hochschulschluessel: beautify(hochschule[0]),
						name:                beautify(hochschule[1]),
						bundesland:          beautify(hochschule[7]),
						traegerschaft:       beautify(hochschule[8]),
						adresse:             beautify(hochschule[2]),
						geolat:              beautify(hochschule[6]),
						geolon:              beautify(hochschule[5]),
						art:                 beautify(hochschule[3]),
					};
					connection.query('INSERT INTO hochschulen SET ?;', post, function(err, result) {
						if (err) throw err;

						var post = {
							hochschulschluessel: beautify(hochschule[0]),
							name:                beautify(hochschule[1]),
						}
						connection.query(
							'INSERT INTO hochschulnamen SET ? ON DUPLICATE KEY UPDATE hochschulschluessel = ?;',
							[post,beautify(hochschule[0])],
							function(err, result) {
								if (err) throw err;
								callback();
							}
						);
					});
				}, function() {
					// forEach is over
					connection.end();
				});
			}
		);

	});
});

