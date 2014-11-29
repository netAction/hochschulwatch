var parse       = require('csv-parse');
var fs          = require('fs');
var async       = require("async");
var importTools = require('./global.js');

var connection = importTools.init();


function zuwendung_eintragen(daten, callback) {
	var query = connection.query('INSERT IGNORE INTO zuwendungen SET ?;', daten, function(err, result) {
		if (err) throw err;
		callback(null);
	});
}



connection.query('TRUNCATE TABLE `zuwendungen`;', function() {
	fs.readFile('sponsoring.csv', 'utf8', function (err, file) {

		var alter_hochschulname;
		parse(
			file,
			{comment: '#', delimiter: ';'},
			function(err, json) {
				async.eachSeries(json,function (rohzeile,callback) {
					if (rohzeile.length < 8) { callback(); return; }
					if (importTools.beautify(rohzeile[3]).toLowerCase() == 'universität') { callback(); return; }
					if (importTools.beautify(rohzeile[3]) == '') { callback(); return; }
					if (importTools.beautify(rohzeile[7]).toLowerCase() == 'hinweis') { callback(); return; }
					if (importTools.beautify(rohzeile[7]) == '') { callback(); return; }


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
							importTools.unternehmen_in_unternehmensnamen_eintragen(rohzeile[3], connection, callback);
						},
						function(callback) {
							importTools.hochschulschluessel_suchen(rohzeile[1], {}, connection, callback);
						},
						function(ergebnis, callback) {
							ergebnis.unternehmensid = importTools.unternehmensschluessel_suchen(rohzeile[3], ergebnis, connection, callback);
						},
						function(ergebnis, callback) {
							zuwendung_eintragen({
								hochschulschluessel: ergebnis.hochschulschluessel,
								unternehmensid:      ergebnis.unternehmensid,
								jahr:                importTools.beautify(rohzeile[2]),
								art:                 importTools.beautify(rohzeile[5]),
								leistung:            importTools.beautify(rohzeile[4]),
								betrag:              importTools.beautify(rohzeile[6]),
								zweck:               importTools.beautify(rohzeile[7]),
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
