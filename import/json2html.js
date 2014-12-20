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


function beautifyCurrency(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' €';
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
		hochschulen[i].addi = beautify( hochschulen[i].addi );
		hochschulen[i]['absolut-2010-string'] = beautifyCurrency( hochschulen[i]['absolut-2010'] );
		hochschulen[i]['wirtschaft-2010-string'] = beautifyCurrency( hochschulen[i]['wirtschaft-2010'] );
		hochschulen[i]['absolut-2011-string'] = beautifyCurrency( hochschulen[i]['absolut-2011'] );
		hochschulen[i]['wirtschaft-2011-string'] = beautifyCurrency( hochschulen[i]['wirtschaft-2011'] );
		hochschulen[i]['absolut-2012-string'] = beautifyCurrency( hochschulen[i]['absolut-2012'] );
		hochschulen[i]['wirtschaft-2012-string'] = beautifyCurrency( hochschulen[i]['wirtschaft-2012'] );

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



function importFoerderungen(filename, hochschulBezeichner, foerdererBezeichner) {
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

		// Bei Zuwendungen-Daten den Wert als Zahl angeben.
		if (filename == 'sponsoring') {
			foerderung.Wert = foerderung.Wert.toString().replace(/,/g , ".") * 1;
			foerderung.WertString = beautifyCurrency(Math.round(foerderung.Wert));
		}

		var hochschule = hochschulenTable[foerderung[hochschulBezeichner]];
		hochschule[filename] = hochschule[filename] || [];
		hochschule[filename].push( foerderung );

		var foerderer = foerdererTable[foerderung[foerdererBezeichner]];
		foerderer[filename] = foerderer[filename] || [];
		foerderer[filename].push( foerderung );
	});
}

importFoerderungen('deutschlandstipendien', 'Name', 'Firma');
importFoerderungen('hochschulraete', 'Uni', 'Unternehmen');
importFoerderungen('kooperation', 'Name', 'Förderer');
importFoerderungen('sponsoring', 'Universität', 'Name des Gebers');
importFoerderungen('stiftungsprofessuren', 'Hochschule', 'Stifter');


// Debug output
// jf.writeFileSync('hochschulen.json', hochschulenTable);
// jf.writeFileSync('foerderer.json', foerdererTable);


// #################### Header und Footer vom HTML-Template laden

var templateHeader = fs.readFileSync('templates/header.html').toString();
var templateFooter = fs.readFileSync('templates/footer.html').toString();

// #################### index.html, about.html, kontakt.html


fs.writeFileSync('../index.html', ms.render(
	templateHeader+ fs.readFileSync('templates/index.html').toString() + templateFooter,
	{srcpath: './', activeHome: true }
));

fs.writeFileSync('../foerderer.html', ms.render(
	templateHeader+ fs.readFileSync('templates/foerdererUebersicht.html').toString() + templateFooter,
	{srcpath: './', activeFoerderer: true }
));

fs.writeFileSync('../kontakt.html', ms.render(
	templateHeader+ fs.readFileSync('templates/kontakt.html').toString() + templateFooter,
	{srcpath: './', activeContact: true }
));

// #################### Themenseiten


fs.writeFileSync('../themen/forschungskooperationen.html', ms.render(
	templateHeader+ fs.readFileSync('templates/forschungskooperationen.html').toString() + templateFooter,
	{srcpath: '../'}
));

fs.writeFileSync('../themen/hochschulraete.html', ms.render(
	templateHeader+ fs.readFileSync('templates/hochschulraete.html').toString() + templateFooter,
	{srcpath: '../'}
));

fs.writeFileSync('../themen/sponsoring.html', ms.render(
	templateHeader+ fs.readFileSync('templates/sponsoring.html').toString() + templateFooter,
	{srcpath: '../'}
));

fs.writeFileSync('../themen/stiftungsprofessuren.html', ms.render(
	templateHeader+ fs.readFileSync('templates/stiftungsprofessuren.html').toString() + templateFooter,
	{srcpath: '../'}
));

fs.writeFileSync('../themen/stipendien.html', ms.render(
	templateHeader+ fs.readFileSync('templates/stipendien.html').toString() + templateFooter,
	{srcpath: '../'}
));

// #################### Index für Suchfunktion erstellen

function generateSearchIndex() {
	var searchdb = {
		hochschulen: [],
		foerderer: []
	};

	for(var name in hochschulenTable ) {
		searchdb.hochschulen.push({
			'name': hochschulenTable[name].Name,
			'bundesland': hochschulenTable[name].bundesland,
			'slug': slugify(hochschulenTable[name].Name),
		});
	}

	var searchFoerderer = [];
	for(var name in foerdererTable ) {
		searchdb.foerderer.push({
			'name': foerdererTable[name].Firma,
			'slug': slugify(foerdererTable[name].Firma),
		});
	}


	searchdb = 'var searchdb = '+ JSON.stringify(searchdb, null,"\t") + ';\n';
	fs.writeFileSync('../js/searchdb.js', searchdb);

}
generateSearchIndex();



// #################### Bundesländer

function generateBundeslaender() {
	var template = fs.readFileSync('templates/bundesland.html').toString();
	template = templateHeader + template + templateFooter;

	var bundeslaender = ['Baden-Württemberg','Bayern','Berlin',
	'Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern',
	'Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland',
	'Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'];
	for(var bundesland in bundeslaender) {
		var data = {
			name: bundeslaender[bundesland],
			hochschulen: []
		};

		var hochschulenRaw = [];
		for(var name in hochschulenTable ) {
			if (hochschulenTable[name].bundesland == bundeslaender[bundesland])
				hochschulenRaw.push( hochschulenTable[name].Name );
		}

		hochschulenRaw.sort();
		for(var hochschule in hochschulenRaw) {
			var firstChar = hochschulenRaw[hochschule].toUpperCase().charCodeAt(0);
			if (!data.hochschulen[firstChar]) {
				data.hochschulen[firstChar] = {
					char: hochschulenRaw[hochschule].toUpperCase()[0],
					names: []
				};
			}
			data.hochschulen[firstChar].names.push(
				hochschulenRaw[hochschule]
			);
		}

		data.srcpath = '../';
		data.activeBundesland = true;
		data.slugify = function(){ return slugify(this.toString()); };
		var html = ms.render(template, data);
		fs.writeFileSync('../bundesland/'+slugify(bundeslaender[bundesland])+'.html', html);
	}
}
generateBundeslaender();



// #################### Verzeichnisse hochschulen und foerderer löschen

var files = fs.readdirSync('../hochschule');
for (var i = 0; i < files.length; i++) {
	if (fs.statSync('../hochschule/' + files[i]).isFile()) fs.unlinkSync('../hochschule/' + files[i]);
}
var files = fs.readdirSync('../foerderer');
for (var i = 0; i < files.length; i++) {
	if (fs.statSync('../foerderer/' + files[i]).isFile()) fs.unlinkSync('../foerderer/' + files[i]);
}



// #################### Hochschulen und Förderer aus Datenbank erstellen

var template = fs.readFileSync('templates/hochschule.html').toString();
template = templateHeader + template + templateFooter;
for(var name in hochschulenTable ) {
	var data = hochschulenTable[name];
	data.srcpath = '../';
	data.slugify = function(){ return slugify(this.toString()); };
	data.encodeURIComponent = function(){ return encodeURIComponent(this.toString()); };

	var html = ms.render(template, data);
	fs.writeFileSync('../hochschule/'+slugify(data.Name)+'.html', html);
};

var template = fs.readFileSync('templates/foerderer.html').toString();
template = templateHeader + template + templateFooter;
for(var name in foerdererTable ) {
	var data = foerdererTable[name];
	data.srcpath = '../';
	data.activeFoerderer = true;
	data.slugify = function(){ return slugify(this.toString()); };
	var html = ms.render(template, data);
	fs.writeFileSync('../foerderer/'+slugify(data.Firma)+'.html', html);
};

