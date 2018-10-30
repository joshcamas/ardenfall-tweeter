var Twit = require("twit");
var TwitterBot = require("node-twitterbot").TwitterBot;

var TWITTER_SEARCH_PHRASE = '#ardenfall';
var TWITTER_USERS = ['716027329621798914']

var Bot = new Twit({
 consumer_key: process.env.BOT_CONSUMER_KEY,
 consumer_secret: process.env.BOT_CONSUMER_SECRET,
 access_token: process.env.BOT_ACCESS_TOKEN,
 access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET
});

console.log('The bot is running...');

function RetweetStatus(status,onComplete) 
{

	var id = {
		id : status.id_str
	}
	
	console.log(status.text)
	
	Bot.post('favorites/create', id, BotFavorited);
	
	function BotFavorited(error,response) 
	{
		if (error) {
			console.log('Bot could not favorite, : ' + error);
			onComplete(false);
			return
		}
		else {
			console.log('Bot favorited : ' + id.id);
		}
			
		Bot.post('statuses/retweet/:id', id, BotRetweeted);
		
		function BotRetweeted(error, response) {
			if (error) {
				console.log('Bot could not retweet, : ' + error);
				onComplete(false);
				return
			}
			else {
				console.log('Bot retweeted : ' + id.id);
				onComplete(true);
				return	
			}
		}
		
	}
	
}

/* BotInit() : To initiate the bot */
function BotInit() {


	var query = {
		q: TWITTER_SEARCH_PHRASE,
		result_type: "recent"
	}

	Bot.get('search/tweets', query, BotGotLatestTweet);

	function BotGotLatestTweet (error, data, response) {
		if (error) {
			console.log('Bot could not find latest tweet, : ' + error);
		}
		else {
			
			
			function ScanTweet(index) {
				
				if(index >= data.statuses.length)
					return;
					
				var status = data.statuses[index];
				
				console.log("Found status " + status.id);
				
				//Filter user 
				if(!TWITTER_USERS.includes(status.user.id_str)) {
					console.log("Bad user " + status.user.id_str);
					ScanTweet(index+1);
				}

				function OnTweetComplete(success) {
					if(success) 
						ScanTweet(index+1);
					else
						return;
				}
				
				RetweetStatus(status,OnTweetComplete);
				
				
			}
			
			ScanTweet(0);
		
			
		}
	}
}

/* Initiate the Bot */
BotInit();
