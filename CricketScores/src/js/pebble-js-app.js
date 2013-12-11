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

var teamname = "New Zealand";
var updateInterval = 10;
var JSONURL = "http://pipes.yahoo.com/pipes/pipe.run?_id=b2b8571617d65f12000120cf55d01bec&_render=json"
var XMLURL = "http://www.ecb.co.uk/live-scores.xml"

function fetchScores() {
	var response;
	var req = new XMLHttpRequest();
	req.open('GET', JSONURL, false);
	req.onload = function(e) {
		response = req.responseText;
		parseScoreResponse(response);
	}
	req.send(null);
};

var createResponseForPebble = function(team1String, team2String, isTest) {
	var scorePattern = new RegExp(/\d{1,3}-\d{1}d|\d{1,3}-\d{1}|\d{1,3}/g);
	
	// team1
	var team1Name = findTeam(team1String)
	var team1ScoreArray = team1String.match(scorePattern);
	var team1Score1 = "--";
	var team1Score2 = "--";
	if ( !team1ScoreArray ) {
		// do nothing
	} else if ( team1ScoreArray.length == 2 ) {
		team1Score1 = team1ScoreArray[0];
		team1Score2 = team1ScoreArray[1];
	} else {
		team1Score1 = team1ScoreArray[0];
	};
	
	// team2
	var team2Name = findTeam(team2String)
	var team2ScoreArray = team2String.match(scorePattern);
	var team2Score1 = "--";
	var team2Score2 = "--";
	if ( !team2ScoreArray ) {
		// do nothing
	} else if ( team2ScoreArray.length == 2 ) {
		team2Score1 = team2ScoreArray[0];
		team2Score2 = team2ScoreArray[1];
	} else {
		team2Score1 = team2ScoreArray[0];
	};

	var message = {
	    "team1_name":team1Name,
	    "team1_score":team1Score1,
	    "team1_score2":team1Score2,
	    "team2_name":team2Name,
	    "team2_score":team2Score1,
	    "team2_score2":team2Score2
	};
	console.log("Sending:", team1Score1);
	
	Pebble.sendAppMessage({
	    "team1_name":team1Name,
	    "team1_score":team1Score1,
	    "team1_score2":team1Score2,
	    "team2_name":team2Name,
	    "team2_score":team2Score1,
	    "team2_score2":team2Score2
	});
};

var parseScoreResponse = function(response) {
	var activeGames = JSON.parse(response).value.items;
	if ( activeGames.length == 0 ) { 
		console.log("No Active Games")
		// do something
	}
	else {
		findUserMatchingGame(activeGames);
	};
};

var findUserMatchingGame = function(activeGames) {
	var userTeamGame = null;
	for (var i = 0; i < activeGames.length; i++) {			
		var gameString = activeGames[i].title;
		var teamRegex = new RegExp(teamname);
		var teamMatch = teamRegex.exec(gameString);
		if (teamMatch) { 
			userTeamGame = activeGames[i].title;
			parseUserMatchedGame(userTeamGame)
			break;
		};
	};
	// do something
};

var isTest = function(gameString) {
	var isTest = false;
	var isTestPattern = /&/;
	var isTestMatch = gameString.match(isTestPattern);
	if ( isTestMatch && isTestMatch.length > 0 ) { isTest = true; };
	return isTest;
};

var parseUserMatchedGame = function(gameString) {
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
			return teamHash[key];
		}
	}
};

Pebble.addEventListener("ready",
    function(e) {
        fetchScores();
        setInterval(function() {
        	fetchScores();
        }, updateInterval*1000);
    }
);