var mysql = require('mysql');

function beautify(input) {
	switch (input) {
		case '-':
		case 'None':
		case 'none':
			return '';
	}

	input = input.fulltrim();

	return input;
}


module.exports = {

	init: function() {
		String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');};


		var connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'hochschulwatch',
			password : 'mbaY6QYY6xZxZDCE',
			database : 'hochschulwatch',
		});

		connection.connect();

		return connection;
	},

	beautify: beautify,

	hochschule_in_hochschulnamen_eintragen: function(hochschulname, connection, callback) {
		// Hochschule in Liste der Namen eintragen
		var post  = {
			name:                beautify(hochschulname),
		};

		var query = connection.query('INSERT IGNORE INTO hochschulnamen SET ?;', post, function(err, result) {
			if (err) throw err;
			callback(null);
		});
	},


	unternehmen_in_unternehmensnamen_eintragen: function(unternehmensname, connection, callback) {
		// Unternehmen in Liste der Namen eintragen
		var post  = {
			name:                beautify(unternehmensname),
		};

		if (post.name.length > 200) {
			console.log('Unternehmensname zu lang: ',post.name);
			callback(null);
		} else {
			var query = connection.query('INSERT IGNORE INTO unternehmensnamen SET ?;', post, function(err, result) {
				if (err) throw err;
				callback(null);
			});
		}
	},


	hochschulschluessel_suchen: function(hochschule, ergebnis, connection, callback) {
		// ergebnis wird durchgereicht und ergänzt
		var hochschulname = beautify(hochschule);

		var ersetzungen = [
			['Technische Universität', 'TU'],
			['Fachhochschule', 'FH'],
			['Pädagogische Hochschule', 'PH'],
			['Hochschule', 'FH'],
			['Staatliche', 'Staatl.'],
			['ohne Klinikum', ''],
		];

		var alternative = hochschulname;
		ersetzungen.forEach(function( ersetzung ) {
			alternative = alternative.replace( new RegExp( ersetzung[0] ), ersetzung[1] );
		});
		alternative = alternative.replace(/\(|\)/g,"");
		alternative = beautify(alternative);

		connection.query(
			'SELECT hochschulschluessel FROM hochschulnamen WHERE (name LIKE ? OR name LIKE ?) AND hochschulschluessel>\'\'',
			[hochschulname+'%', alternative+'%'],
			function(err, rows) {
				if (err) throw err;
				if (rows.length<1) {
					console.log('Schlüssel zu Hochschule fehlt: "'+hochschulname+'"');
					// console.log(hochschulname);
					ergebnis.hochschulschluessel = '';
				} else {
					ergebnis.hochschulschluessel = rows[0]['hochschulschluessel'];
				}
				callback(null, ergebnis);
			}
		);
	},



	unternehmensschluessel_suchen: function(unternehmen, ergebnis, connection, callback) {
		// ergebnis wird durchgereicht und ergänzt

		if (unternehmen.length > 200) {
			console.log('Unternehmensname zu lang: ',unternehmen);
			ergebnis.unternehmensid = 0;
			callback(null, ergebnis);
		} else {
			ergebnis.unternehmensid = 0;
			connection.query(
				'SELECT * from unternehmensnamen WHERE name= ?',
				beautify(unternehmen),
				function(err, rows) {
					if (err) throw err;
					ergebnis.unternehmensid = rows[0]['id'];
					// if (fertigezeile.unternehmensid == 0) console.log('ID zu Unternehmen fehlt: '+rohzeile[4]);
					callback(null, ergebnis);
				}
			);
		}
	}

};

