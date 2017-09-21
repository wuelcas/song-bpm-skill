# Song BPM Skill

### Development Setup

* Install and use Node ^v4.3.2
* [Create a new Spotify Application]('https://developer.spotify.com/my-applications/#!/') since we need to use the [Spotify Web API](https://developer.spotify.com/web-api/)
* Run `npm install`
* Rename the `config/local.json.example` to `config/local.json` and edit it with all of the requisite fields.

### Metronome Click Tracks

To start a metronome at the tempo of a found song you'll need MP3 recordings of click tracks and upload them to an Amazon Bucket (S3), or you favorite storage service, and make all files public so Alexa can start the audio player with specific file.

Every metronome click track has to be named based on a pattern containing the BPM number so you can replace the `{bpm}` placeholder in your url template inside your local config file.

You can find click tracks for free in [here]('http://songmaven.com/music-downloads/click-track-mp3-downloads.php') from 40 to 200 BPM. 

Specify the range of your availables click tracks inside your config file.

### Run Server

If you use VS Code then just hit `F5` and it will start the server.

You can run the server from a command line running `npm run watch`.

Both commands will watch for changes.


### Directory Structure

	`config/` -> Environment variables or configuration
	`services/` -> API clients, Authentications and Extras
	`skill/` -> Amazon Echo Skill login, the state machine and flow
	`speechAssets/` -> Amazon Echo Utterances, Intent Schema and Custom Slots.
	`tests/` -> Unit Tests
	`server.js` -> Development server.
	`gulpfile.js` -> Gulp tasks
	`serverless.yml` -> Serverless configuration
	`package.json` -> Dependencies
	`README.md`


