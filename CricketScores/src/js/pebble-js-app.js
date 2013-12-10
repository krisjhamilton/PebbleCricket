var teamHash = {
	"Australia": "AUS",
	"Afghanistan": "AFG",
	"Bangladesh": "BAN",
	"Canada": "CAN",
	"England": "ENG",
	"India": "IND",
	"Ireland": "IRE",
	"Kenya": "KEN",
	"New Zealand": "NZ",
	"Pakistan": "PAK",
	"South Africa": "SA",
	"Sri Lanka": "SL",
	"United States of America": "USA",
	"West Indies": "WI",
	"Zimbabwe": "ZIM"
};

var teamname = "Australia";
var updateInterval = 30;

function fetchScores() {
	console.log("In fetchScores");
	var response;
	var req = new XMLHttpRequest();
	req.open('GET', 'http://www.ecb.co.uk/live-scores.xml', true);
	req.onload = function(e) {
		var parser = new DOMParser();
		var xmlResponse = parser.parseFromString(req.responseText, "text/xml");
		parseScoreResponse(xmlResponse);
	}
	req.send(null);
};

var createResponseForPebble = function(team1String, team2String, isTest) {
	console.log("In createResponseForPebble");
	var scorePattern = new RegExp(/\d{1,3}-\d{1}d|\d{1,3}-\d{1}|\d{1,3}/g);
	
	// team1
	var team1Name = findTeam(team1String)
	var team1ScoreArray = team1String.match(scorePattern);
	
	// team2
	var team2Name = findTeam(team2String)
	var team2ScoreArray = team2String.match(scorePattern);
	
	Pebble.sendAppMessage({
	    "team1_name":team1Name,
	    "team1_score":team1ScoreArray[0],
	    "team1_score2":team1ScoreArray[1],
	    "team2_name":team2Name,
	    "team2_score":team2ScoreArray[0],
	    "team2_score2":team2ScoreArray[1]
	});
};

var parseScoreResponse = function(response) {
	console.log("In parseScoreResponse");
	var activeGames = response.getElementsByTagName("title");
	if ( activeGames.length <= 1 ) { 
		console.log("No Active Games")
		// do something
	}
	else {
		findUserMatchingGame(activeGames);
	};
};

var findUserMatchingGame = function(activeGames) {
	console.log("In findUserMatchingGame");
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
};

var isTest = function(gameString) {
	var isTest = false;
	var isTestPattern = new RegExp(/&/);
	var isTestMatch = isTestPattern.exec(gameString);
	if ( isTestMatch.length > 0 ) { isTest = true; };
	return isTest;
};

var parseUserMatchedGame = function(gameString) {
	console.log("In parseScoreResponse");
	var vsIndex = gameString.indexOf('vs');
	var team1String = gameString.substring(0, vsIndex-1);
	var team2String = gameString.substring(vsIndex+3, gameString.length);
	createResponseForPebble(team1String, team2String, isTest(gameString));
};

var findTeam = function(teamString) {
	for (key in teamHash) {
		var teamNameRegex = key;
		var matches = teamString.match(teamNameRegex);
		if (matches) {
			console.log(teamHash[key]);
			return teamHash[key];
		}
	}
};

Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
        setInterval(function() {
        	fetchScores();
        }, updateInterval*1000);
    }
);