# Song BPM Skill

### Development Setup

* Install and use Node ^v4.3.2
* [Create a new Spotify Application]('https://developer.spotify.com/my-applications/#!/') since we need to use the [Spotify Web API](https://developer.spotify.com/web-api/)
* Run `npm install`
* Rename the `config/local.json.example` to `config/local.json` and edit it with all of the requisite fields.

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


