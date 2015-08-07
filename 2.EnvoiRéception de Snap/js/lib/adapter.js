var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

function trace(text) {
  // Cette fonction s'utilise pour l'enregistrement.
  if (text[text.length - 1] == '\n') {
    text = text.substring(0, text.length - 1);
  }
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

if (navigator.mozGetUserMedia) {
  console.log("POUR LES NAVIGATEURS FIREFOX");

  webrtcDetectedBrowser = "firefox";

  webrtcDetectedVersion =
                  parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);

  // L'objet pour la connexion RTC pair 
  RTCPeerConnection = mozRTCPeerConnection;

  // L'objet pour la description d'une Session RTC
  RTCSessionDescription = mozRTCSessionDescription;

  // L'objet pour l'échange d'information et de contenus RTC
  RTCIceCandidate = mozRTCIceCandidate;

  // Get UserMedia (La seule difference est le prefix)
  // 
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);

  // On crée un serveur ICE (Information and Content Exchange) par URL
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // On crée un serveur ICE avec un URL de type STUN.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0 &&
               (url.indexOf('transport=udp') !== -1 ||
                url.indexOf('?transport') === -1)) {
      // On crée un serveur ICE avec un URL de type TURN.
      // On peut ignorer les paramètres de transport de l'URL TURN
      var turn_url_parts = url.split("?");
      iceServer = { 'url': turn_url_parts[0],
                    'credential': password,
                    'username': username };
    }
    return iceServer;
  };

  // Jointure d'un flux de média à un élément
  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();
  };

  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };

  // Obtention video+audio
  MediaStream.prototype.getVideoTracks = function() {
    return [];
  };

  MediaStream.prototype.getAudioTracks = function() {
    return [];
  };
} else if (navigator.webkitGetUserMedia) {
  console.log("POUR LES NAVIGATEURS CHROME");

  webrtcDetectedBrowser = "chrome";
  webrtcDetectedVersion =
             parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]);

  // On crée un serveur ICE (Information and Content Exchange) par URL pour Chrome
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // On crée un serveur ICE avec un URL de type STUN.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedVersion < 28) {
        // On crée un serveur ICE avec un URL de type TURN (Les versions chrome utilisent
		//un ancien format de TURN)
        var url_turn_parts = url.split("turn:");
        iceServer = { 'url': 'turn:' + username + '@' + url_turn_parts[1],
                      'credential': password };
      } else {
        // Le format TURN pour les versions anciennes et nouvelles de chrome
        iceServer = { 'url': url,
                      'credential': password,
                      'username': username };
      }
    }
    return iceServer;
  };

  // L'objet pour la connexion RTC pair 
  RTCPeerConnection = webkitRTCPeerConnection;

  // Get UserMedia (La seule difference est le prefix)
  // 
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

  // Jointure d'un flux de média à un élément
  attachMediaStream = function(element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }
  };

  reattachMediaStream = function(to, from) {
    to.src = from.src;
  };

  // 
  // unification pour toutes les versions de Chrome
  if (!webkitMediaStream.prototype.getVideoTracks) {
    webkitMediaStream.prototype.getVideoTracks = function() {
      return this.videoTracks;
    };
    webkitMediaStream.prototype.getAudioTracks = function() {
      return this.audioTracks;
    };
  }

  // La syntaxe de la nouvelle méthode pour les versions anciennes de chrome
  if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
    webkitRTCPeerConnection.prototype.getLocalStreams = function() {
      return this.localStreams;
    };
    webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
      return this.remoteStreams;
    };
  }
} else {
  console.log("Votre Navigateur n'est pas compatible pour le WebRTC");
}
