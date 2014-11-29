var parse       = require('csv-parse');
var fs          = require('fs');
var async       = require("async");
var importTools = require('./global.js');

var connection = importTools.init();


function hochschulrat_eintragen(daten, callback) {
	var query = connection.query('INSERT IGNORE INTO hochschulraete SET ?;', daten, function(err, result) {
		if (err) throw err;
		callback(null);
	});
}



connection.query('TRUNCATE TABLE `hochschulraete`;', function() {
	fs.readFile('hochschulraete.csv', 'utf8', function (err, file) {

		var alter_hochschulname;
		parse(
			file,
			{comment: '#', delimiter: ';'},
			function(err, json) {
				async.eachSeries(json,function (rohzeile,callback) {
					if (rohzeile.length < 5) { callback(); return; }
					if (importTools.beautify(rohzeile[1]).toLowerCase() == 'uni') { callback(); return; }
					if (importTools.beautify(rohzeile[1]) == '') { callback(); return; }
					if (importTools.beautify(rohzeile[4]).toLowerCase() == 'unternehmen') { callback(); return; }
					if (importTools.beautify(rohzeile[4]) == '') { callback(); return; }


					// Hochschulname bei Bedarf von letzten Einträgen übernehmen
					if (rohzeile[1]  !== '') {
						alter_hochschulname = rohzeile[1];
					} else {
						rohzeile[1] = alter_hochschulname;
					}


					async.waterfall([
						function(callback) {
							importTools.hochschule_in_hochschulnamen_eintragen(rohzeile[1], connection, callback);
						},
						function(callback) {
							importTools.unternehmen_in_unternehmensnamen_eintragen(rohzeile[4], connection, callback);
						},
						function(callback) {
							importTools.hochschulschluessel_suchen(rohzeile[1], {}, connection, callback);
						},
						function(ergebnis, callback) {
							importTools.unternehmensschluessel_suchen(rohzeile[4], ergebnis, connection, callback);
						},
						function(ergebnis, callback) {
							hochschulrat_eintragen({
								name:                importTools.beautify(rohzeile[2]),
								funktion:            importTools.beautify(rohzeile[3]),
								unternehmensid:      ergebnis.unternehmensid,
								hochschulschluessel: ergebnis.hochschulschluessel,
							}, callback);
						},
					], function(err) {
						callback();
					});

				}, function() {
					// forEach is over
					connection.end();
				});
			}
		);

	});
});
