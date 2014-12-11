var jf = require('jsonfile');


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


jf.writeFileSync('hochschulen.json', hochschulenTable);
jf.writeFileSync('foerderer.json', foerdererTable);




