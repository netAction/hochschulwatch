var parse       = require('csv-parse');
var fs          = require('fs');
var async       = require("async");
var importTools = require('./global.js');

var connection = importTools.init();


function zuwendung_eintragen(daten, callback) {
	var query = connection.query('INSERT IGNORE INTO stiftungsprofessuren SET ?;', daten, function(err, result) {
		if (err) throw err;
		callback(null);
	});
}



connection.query('TRUNCATE TABLE `stiftungsprofessuren`;', function() {
	fs.readFile('stiftungsprofessuren.csv', 'utf8', function (err, file) {

		var alter_hochschulname;
		parse(
			file,
			{comment: '#', delimiter: ';'},
			function(err, json) {
				async.eachSeries(json,function (rohzeile,callback) {
					if (rohzeile.length < 5) { callback(); return; }
					if (importTools.beautify(rohzeile[2]).toLowerCase() == 'hochschule') { callback(); return; }
					if (importTools.beautify(rohzeile[3]) == '') { callback(); return; }
					if (importTools.beautify(rohzeile[4]).toLowerCase() == 'stifter') { callback(); return; }
					if (importTools.beautify(rohzeile[4]) == '') { callback(); return; }


					// Hochschulname bei Bedarf von letzten Einträgen übernehmen
					if (rohzeile[2]  !== '') {
						alter_hochschulname = rohzeile[2];
					} else {
						rohzeile[2] = alter_hochschulname;
					}


					async.waterfall([
						function(callback) {
							importTools.hochschule_in_hochschulnamen_eintragen(rohzeile[2], connection, callback);
						},
						function(callback) {
							importTools.unternehmen_in_unternehmensnamen_eintragen(rohzeile[4], connection, callback);
						},
						function(callback) {
							importTools.hochschulschluessel_suchen(rohzeile[2], {}, connection, callback);
						},
						function(ergebnis, callback) {
							importTools.unternehmensschluessel_suchen(rohzeile[4], ergebnis, connection, callback);
						},
						function(ergebnis, callback) {
							zuwendung_eintragen({
								hochschulschluessel: ergebnis.hochschulschluessel,
								unternehmensid:      ergebnis.unternehmensid,
								name:                importTools.beautify(rohzeile[3]),
								laufzeit:            importTools.beautify(rohzeile[7]),
							}, callback);
						},
					], function(err) {
						callback();
					});

				}, function() {
					// eachSeries is over
					connection.end();
				});
			}
		);

	});
});
