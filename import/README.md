# Generierung von Hochschulwatch

Die Seite besteht aus fertigen HTML-Seiten und enthält keine serverseitigen Scripte z.B. in PHP. Der HTML-Generator in diesem Verzeichnis baut aus Rohdaten und Vorlagen (Templates) die Seiten zusammen. JavaScript, CSS, Schriften und Bilder werden nicht automatisch erstellt, sondern sind schon fertig in den Verzeichnissen.


## Rohdaten

Die Daten liegen im Verzeichnis *daten* als *json*-Dateien.


## node.js

Der Generator benötigt *node.js* mit den *npm*-Paketen *jsonfile* und *mustache*.

    $ npm install jsonfile
    $ npm install mustache
    $ nodejs json2html.js

