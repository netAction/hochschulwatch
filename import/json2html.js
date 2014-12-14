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
		hochschulenLookup[hochschulen[i].Name] = hochschulen[i].addi = beautify( hochschulen[i].addi );

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

fs.writeFileSync('../about.html', ms.render(
	templateHeader+ fs.readFileSync('templates/about.html').toString() + templateFooter,
	{srcpath: './', activeAbout: true }
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
	var searchdb = [];
	for(var name in hochschulenTable ) {
		searchdb.push({
			'name': hochschulenTable[name].Name,
			'bundesland': hochschulenTable[name].bundesland,
			'slug': slugify(hochschulenTable[name].Name),
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
	var html = ms.render(template, data);
	fs.writeFileSync('../hochschule/'+slugify(data.Name)+'.html', html);
};

var template = fs.readFileSync('templates/foerderer.html').toString();
template = templateHeader + template + templateFooter;
for(var name in foerdererTable ) {
	var data = foerdererTable[name];
	data.srcpath = '../';
	data.slugify = function(){ return slugify(this.toString()); };
	var html = ms.render(template, data);
	fs.writeFileSync('../foerderer/'+slugify(data.Firma)+'.html', html);
};

