var jf = require('jsonfile');
var fs = require('fs');
var ms = require('mustache');



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

	// trim
	input = input.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');

	return input;
}



function slugify(name) {
	name = name
		.toLowerCase()
		.replace(/ä/g,'ae') // Umlaute
		.replace(/ö/g,'oe')
		.replace(/ü/g,'ue')
		.replace(/ß/g,'ss')
		.replace(/[^\w -]+/g,'')
		.replace(/ +/g,'-') // Leerzeichen
		.replace(/[-]+/g, '-'); // Mehrfahre Striche

	return(name);
}



// #################### jSon-Daten in Variable hochschulenTable und foerdererTable einlesen

function hochschulenLookup() {
	var hochschulen = jf.readFileSync('daten/drittmittel.json');
	var hochschulenLookup = {};
	for (var i = 0, len = hochschulen.length; i < len; i++) {
		hochschulenLookup[hochschulen[i].Name] = hochschulen[i];
	}
	return hochschulenLookup;
}
var hochschulenTable = hochschulenLookup();


function foerdererLookup() {
	var foerderer = jf.readFileSync('daten/foerderer.json');
	var foerdererLookup = {};
	for (var i = 0, len = foerderer.length; i < len; i++) {
		foerderer[i].Firma = beautify( foerderer[i].Firma );
		foerdererLookup[foerderer[i].Firma] = foerderer[i];
	}
	return foerdererLookup;
}
var foerdererTable = foerdererLookup();



function importFoerderer(filename, hochschulBezeichner, foerdererBezeichner) {
	var foedererDatei = jf.readFileSync('daten/'+filename+'.json');
	foedererDatei.forEach( function( foerderung ) {
		if (!foerderung[foerdererBezeichner]) return;
		foerderung[foerdererBezeichner] = beautify(foerderung[foerdererBezeichner]);
		foerderung[hochschulBezeichner] = beautify(foerderung[hochschulBezeichner]);


		if(!hochschulenTable[foerderung[hochschulBezeichner]]) {
			console.log('Hochschule in '+filename+'.json unbekannt: '+foerderung[hochschulBezeichner]);
			return;
		}
		if(!foerdererTable[foerderung[foerdererBezeichner]]) {
			console.log('Förderer in '+filename+'.json unbekannt: '+foerderung[foerdererBezeichner]);
			return;
		}

		var hochschule = hochschulenTable[foerderung[hochschulBezeichner]];
		hochschule[filename] = hochschule[filename] || [];
		hochschule[filename].push( foerderung );

		var foerderer = foerdererTable[foerderung[foerdererBezeichner]];
		foerderer[filename] = foerderer[filename] || [];
		foerderer[filename].push( foerderung );
	});
}

importFoerderer('deutschlandstipendien', 'Name', 'Firma');
importFoerderer('hochschulraete', 'Uni', 'Unternehmen');
importFoerderer('kooperation', 'Name', 'Förderer');
importFoerderer('sponsoring', 'Universität', 'Name des Gebers');
importFoerderer('stiftungsprofessuren', 'Hochschule', 'Stifter');


// jf.writeFileSync('hochschulen.json', hochschulenTable);
// jf.writeFileSync('foerderer.json', foerdererTable);


// #################### Index für Suchfunktion erstellen

function generateSearchIndex() {
	var searchdb = [];
	for(var name in hochschulenTable ) {
		searchdb.push({
			'name': hochschulenTable[name].Name,
			'bundesland': hochschulenTable[name].bundesland,
			'slug': slugify(hochschulenTable[name].Name),
		});
	}
	if (fs.existsSync('../searchdb.json')) fs.unlinkSync('../searchdb.json');
	jf.writeFileSync('../searchdb.json', searchdb);
}
generateSearchIndex();


// #################### Verzeichnisse hochschulen und foerderer löschen

var files = fs.readdirSync('../hochschulen');
for (var i = 0; i < files.length; i++) {
	if (fs.statSync('../hochschulen/' + files[i]).isFile()) fs.unlinkSync('../hochschulen/' + files[i]);
}
var files = fs.readdirSync('../foerderer');
for (var i = 0; i < files.length; i++) {
	if (fs.statSync('../foerderer/' + files[i]).isFile()) fs.unlinkSync('../foerderer/' + files[i]);
}



// #################### Hochschulen und Förderer aus Datenbank erstellen


for(var name in hochschulenTable ) {
	var data = hochschulenTable[name];
	var template = fs.readFileSync('hochschule-template.html').toString();
	var html = ms.to_html(template, data);
	fs.writeFileSync('../hochschulen/'+slugify(data.Name)+'.html', html);
};

for(var name in foerdererTable ) {
	var data = foerdererTable[name];
	var template = fs.readFileSync('foerderer-template.html').toString();
	var html = ms.to_html(template, data);
	fs.writeFileSync('../foerderer/'+slugify(data.Firma)+'.html', html);
};

