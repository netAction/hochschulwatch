# Generierung von Hochschulwatch

Die Seite besteht aus fertigen HTML-Seiten und enthält keine serverseitigen Scripte z.B. in PHP. Der HTML-Generator in diesem Verzeichnis baut aus Rohdaten und Vorlagen (Templates) die Seiten zusammen. JavaScript, CSS, Schriften und Bilder werden nicht automatisch erstellt, sondern sind schon fertig in den Verzeichnissen.


## Rohdaten

Die Daten liegen im Verzeichnis *daten* als *csv*-Dateien. Sie sind *UTF-8* encodiert und mit *;* getrennt.


## node.js

Der Generator benötigt *node.js* mit den *npm*-Paketen *csv-parse* und *mustache*.

    $ npm install
    $ node json2html.js
