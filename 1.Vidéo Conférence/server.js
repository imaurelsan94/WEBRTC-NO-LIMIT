//Code de config. du serveur de signalisation compatible avec notre application Node.js
var static = require('node-static');
var http = require('http');

// On crée un noeud static (node-static server instance) 
var file = new(static.Server)();

//On utilise le module htpp 'CreateServer' pour déployer notre serveur local
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(2016); //2016 est le port d'écoute qu'on utilisera pour se connecter au serveur localhost:2016



