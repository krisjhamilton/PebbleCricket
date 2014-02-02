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

// defaults
var teamname = "India";
var updateInterval = 3000; // 5 minutes
var JSONURL = "http://pipes.yahoo.com/pipes/pipe.run?_id=b2b8571617d65f12000120cf55d01bec&_render=json"; // add &r=randomnumber
var XMLURL = "http://www.ecb.co.uk/live-scores.xml";

var updateIntervalId;

function fetchScores() {
	var response = null;
	var req = new XMLHttpRequest();
	req.open('GET', XMLURL, false);
	req.setRequestHeader('Pragma', 'no-cache');
	req.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
	req.setRequestHeader('Expires', 'Mon, 12 Jul 2010 03:00:00 GMT');
	req.onload = function(e) {
		response = req.responseText;
		// parseScoreResponse(response);
		parseXMLResponseText(response);
	}
	req.send(null);
};

var parseXMLResponseText = function(responseText) {
	var responseArray = responseText.split("\n");
	var gameString;
	var isWomenGame = false;
	for (var i = 0; i < responseArray.length; i++) {
		// check for women's games
		if ( responseArray[i].match(/title/) && responseArray[i].match("Women") ) {
			isWomenGame = true;
		} else {
			isWomenGame = false;
		};
		if ( responseArray[i].match(/title/) && responseArray[i].match(teamname) ) {
			if (!isWomenGame) {
				gameString = responseArray[i].trim();
				break;
			};
		};
	};
	if ( !gameString ) {
		// no active games
		var team = findTeam(teamname);
		Pebble.sendAppMessage({
			"team1_name":team,
	    	"team1_score":"HAS NO",
	    	"team2_name":"ACTIVE",
	    	"team2_score":"GAMES"
		});
	} else {
		parseUserMatchedGame(gameString);
	}
}

var createResponseForPebble = function(team1String, team2String, isTest) {
	var scorePattern = new RegExp(/\d{1,3}-\d{1}d|\d{1,3}-\d{1}|\d{1,3}/g);
	
	// team1
	var team1Name = findTeam(team1String);
	var team1ScoreArray = team1String.match(scorePattern);
	var team1Score = "--";
	if ( !team1ScoreArray ) {
		// do nothing
	} else if ( team1ScoreArray.length == 2 ) {
		team1Score = team1ScoreArray[1];
	} else {
		team1Score = team1ScoreArray[0];
	};
	
	// team2
	var team2Name = findTeam(team2String);
	var team2ScoreArray = team2String.match(scorePattern);
	var team2Score = "--";
	if ( !team2ScoreArray ) {
		// do nothing
	} else if ( team2ScoreArray.length == 2 ) {
		team2Score = team2ScoreArray[1];
	} else {
		team2Score = team2ScoreArray[0];
	};

	var message = {
	    "team1_name":team1Name,
	    "team1_score":team1Score,
	    "team2_name":team2Name,
	    "team2_score":team2Score
	};
	
	Pebble.sendAppMessage({
	    "team1_name":team1Name,
	    "team1_score":team1Score,
	    "team2_name":team2Name,
	    "team2_score":team2Score
	});
};

var parseScoreResponse = function(response) {
	var activeGames = JSON.parse(response).value.items;
	if ( activeGames.length == 0 ) { 
		console.log("No Active Games")
		Pebble.sendAppMessage({
			"team1_name":"NO",
	    	"team1_score":"ACTIVE",
	    	"team2_name":"GAMES",
	    	"team2_score":"CURRENTLY"
		});
	}
	else {
		findUserMatchingGame(activeGames);
	};
};

var findUserMatchingGame = function(activeGames) {
	var userTeamGame = null;
	var foundMatchingGame = false;
	for (var i = 0; i < activeGames.length; i++) {			
		var gameString = activeGames[i].title;
		var teamRegex = new RegExp(teamname);
		var teamMatch = teamRegex.exec(gameString);

		// check for womem's games and ignore if found
		var womenRegex = new RegExp("Women");
		var womenMatch = womenRegex.exec(womenRegex);
		console.log('WOMEN:'+womenMatch.length);

		if ( teamMatch && (womenMatch.length > 0) ) { 
			userTeamGame = activeGames[i].title;
			foundMatchingGame = true;
			parseUserMatchedGame(userTeamGame);
			break;
		};
	};
	// no matching games
	if ( !foundMatchingGame ) {
		var team = findTeam(teamname);
		Pebble.sendAppMessage({
			"team1_name":team,
	    	"team1_score":"HAS NO",
	    	"team2_name":"ACTIVE",
	    	"team2_score":"GAMES"
		});
	};
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
        updateIntervalId = setInterval(function() {
        	fetchScores();
        }, updateInterval*1000);
    }
);

Pebble.addEventListener("showConfiguration", function(e) {
	Pebble.openURL("http://ishanthukral.github.io/PebbleCricket/config.html");
	console.log(e.type);
	console.log(e.response);
});

Pebble.addEventListener("webviewclosed", function(e) {
	var configuration = JSON.parse(e.response);
	clearInterval(updateIntervalId);
	teamname = configuration.team;
	updateInterval = configuration.time;
	fetchScores();
	console.log("Configuration window returned: ", configuration);
});
