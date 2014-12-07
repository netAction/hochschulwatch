var parser       = require('tsv').Parser;
var fs          = require('fs');
var jf          = require('jsonfile');
var util        = require('util');



// Das Ergebnis des Imports
var result = {};


function beautify(input) {
	if (typeof input == 'number') {
		input = input.toString();
	}

	switch (input) {
		case '-':
		case 'None':
		case 'none':
			return '';
	}

	input = input.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');

	return input;
}



// ### drittmittel.csv mit Liste der Hochschulen einlesen
var drittmittelDatei = fs.readFileSync('daten/drittmittel.csv', 'utf8');

csv = new parser(";", { header: true });
drittmittelDatei = csv.parse(drittmittelDatei);

result.hochschulen = [];

drittmittelDatei.forEach( function(hochschule) {
	if (!hochschule.Name) return;
	result.hochschulen.push({
		name: beautify(hochschule.Name),
		uid : beautify(hochschule.uID),
		adresse : beautify(hochschule.addi),
		art : beautify(hochschule['hs-art']),
		geokoordinaten : {lat: beautify(hochschule['gps-la']), lon: beautify(hochschule['gps-lo']) },
		bundesland : beautify(hochschule.bundesland),
		orientierung : beautify(hochschule.orientierung),
		drittmittel_absolut_2010 : hochschule['absolut-2010'],
		drittmittel_wirtschaft_2010 : hochschule['wirtschaft-2010'],
		drittmittel_absolut_2011 : hochschule['absolut-2011'],
		drittmittel_wirtschaft_2011 : hochschule['wirtschaft-2011'],
		drittmittel_absolut_2012 : hochschule['absolut-2012'],
		drittmittel_wirtschaft_2012 : hochschule['wirtschaft-2012'],
	});
});



// ### hochschulräte.csv einlesen
var hochschulraete = fs.readFileSync('daten/hochschulräte-utf8.csv', 'utf-8');

csv = new parser(";", { header: true });
hochschulraete = csv.parse(hochschulraete);

result.hochschulraete = [];
var alte_uni = '';

hochschulraete.forEach( function(hochschulrat) {
	if (!hochschulrat.Unternehmen) return;

	if (hochschulrat.Uni == '') {
		hochschulrat.Uni = alte_uni;
	} else {
		alte_uni = hochschulrat.Uni;
	}

	if (!result.hochschulen[hochschulrat.Uni]) {
//		console.log('Hochschule nicht bekannt: ' + hochschulrat.Uni);
	}

	result.hochschulraete.push({
		hochschule : beautify(hochschulrat.Uni),
		name : beautify(hochschulrat.Name),
		funktion : beautify(hochschulrat.Funktion),
		unternehmen : beautify(hochschulrat.Unternehmen),
	});
});




// ### sponsoring.csv einlesen

// iconv -f ISO-8859-1 -t UTF-8 daten/sponsoring.csv > daten/sponsoring-utf8.csv
// Mehrzeilige Strings korrigiert
var sponsoring = fs.readFileSync('daten/sponsoring-utf8.csv', 'utf-8');

sponsoring = sponsoring.replace(/("[^"\r\n]*")/gm,'');

csv = new parser(";", { header: true });
sponsoring = csv.parse(sponsoring);

result.zuwendungen = [];
var alte_uni = '';

sponsoring.forEach( function(zuwendung) {
	if (!zuwendung['Name des Gebers']) return;

	if (zuwendung.Universität == '') {
		zuwendung.Universität = alte_uni;
	} else {
		alte_uni = zuwendung.Universität;
	}

	if (!result.hochschulen[zuwendung.Universität]) {
	//	console.log('Hochschule in sponsoring.csv nicht bekannt: ' + zuwendung.Universität);
	}

	result.zuwendungen.push({
		hochschule : beautify(zuwendung.Universität),
		jahr : beautify(zuwendung.Jahr),
		geber_name : beautify(zuwendung['Name des Gebers']),
		geld_sachspende : beautify(zuwendung['Geld-/Sachspende']),
		art : beautify(zuwendung['Art der Leistung']),
		wert : (zuwendung.Wert*1>1) ? zuwendung.Wert*1 : 0,
		hinweis : zuwendung.Hinweis ? beautify(zuwendung.Hinweis): '',
	});
});


jf.writeFileSync('../data.json', result);

