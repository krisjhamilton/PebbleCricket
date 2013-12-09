var teamHash = {
	"Australia": "AUS",
	"Afghanistan": "AFG",
	"Bangladesh": "BAN",
	"England": "ENG",
	"India": "IND",
	"Kenya": "KEN",
	"New Zealand": "NZ",
	"Pakistan": "PAK",
	"South Africa": "SA",
	"Sri Lanka": "SL",
	"West Indies": "WI",
	"Zimbabwe": "ZIM"
}

var teamname = "Australia"

function fetchScores() {
	var response;
	var req = new XMLHttpRequest();
	req.open('GET', 'http://www.ecb.co.uk/live-scores.xml', true);
	req.onload = function(e) {
		var parser = new DOMParser();
		var xmlResponse = parser.parseFromString(req.responseText, "text/xml");
		parseScoreResponse(xmlResponse);
	}
	req.send(null);
}

var createResponseForPebble = function() {

}

var parseScoreResponse = function(response) {
	var activeGames = response.getElementsByTagName("title");
	if ( activeGames.length <= 1 ) { 
		// do something
	}
	else {
		findUserMatchingGame(activeGames);
	};
}

var findUserMatchingGame = function(activeGames) {
	var userTeamGame = null;
	for (var i = 1; i < activeGames.length; i++) {			
		var gameString = activeGames[i].childNodes[0].nodeValue;
		var teamRegex = new RegExp(teamname);
		var teamMatch = teamRegex.exec(gameString);
		if (teamMatch) { userTeamGame = activeGames[i]; };
	};
	if ( userTeamGame == null ) {
		// do something
	}
	else {
		parseUserMatchedGame(userTeamGame.childNodes[0].nodeValue);
	}
}

var isTest = function(gameString) {
	var isTest = false;
	var isTestPattern = new RegExp(/&/);
	var isTestMatch = isTestPattern.exec(gameString);
	if ( isTestMatch.length > 0 ) { isTest = true; };
	return isTest;
}

var parseUserMatchedGame = function(gameString) {
	var vsIndex = gameString.indexOf('vs');
	var team1String = gameString.substring(0, vsIndex-1);
	var team2String = gameString.substring(vsIndex+3, gameString.length);
	var scorePattern = new RegExp(/\d{1,3}-\d{1}d|\d{1,3}-\d{1}|\d{1,3}/g);
	var match = gameString.match(scorePattern);
	// console.log(gameString, match);
}

var findTeam = function(teamString) {

}

Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
    }
);