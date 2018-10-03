# Generierung von Hochschulwatch

Die Seite besteht aus fertigen HTML-Seiten und enthält keine serverseitigen Scripte z.B. in PHP. Der HTML-Generator in diesem Verzeichnis baut aus Rohdaten und Vorlagen (Templates) die Seiten zusammen. JavaScript, CSS, Schriften und Bilder werden nicht automatisch erstellt, sondern sind schon fertig in den Verzeichnissen.


## Rohdaten

Die Daten liegen im Verzeichnis *daten* als *json*-Dateien. Sie sind mit dem csv-to-json-Generator (http://www.convertcsv.com/csv-to-json.htm) aus den *csv*-Dateien im Ordner *daten/vorlage-in-csv* generiert.


## node.js

Der Generator benötigt *node.js* mit den *npm*-Paketen *jsonfile* und *mustache*.

    $ npm install jsonfile
    $ npm install mustache
    $ node json2html.js
