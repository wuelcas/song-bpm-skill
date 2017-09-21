'use strict';

const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config');
const co = require('co');
const debug = require('debug')('voxa');

const clickTrackURLTemplate = config.metronome.clickTrackURLTemplate;

const spotifyApi = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret,
});

exports.register = function register(skill) {
  skill.onState('entry', {
    'AMAZON.PauseIntent': 'stop',
    'AMAZON.StopIntent': 'stop',
  });


  skill.onIntent('LaunchIntent', () => ({ reply: 'Launch.StartResponse', to: 'sayBPMForSong' }));
  skill.onIntent('AMAZON.StartOverIntent', () => ({ reply: 'Launch.StartResponse', to: 'sayBPMForSong' }));
  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Help.InstructionsMessage', to: 'sayBPMForSong' }));
  skill.onIntent('SongRequestIntent', () => ({ to: 'sayBPMForSong' }));
  skill.onIntent('AMAZON.CancelIntent', () => ({ reply: 'Exit.GoodbyeMessage', to: 'die' }));
  skill.onIntent('AMAZON.RepeatIntent', () => ({ to: 'repeatTheBPMOfTheSong' }));

  skill.onState('sayBPMForSong', (alexaEvent) => {
    switch (alexaEvent.intent.name) {
      case 'AMAZON.RepeatIntent':
        return { to: 'repeatTheBPMOfTheSong' };
      case 'AMAZON.HelpIntent':
        return { reply: 'Help.InstructionsMessage', to: 'sayBPMForSong' };
      case 'AMAZON.StartOverIntent':
        return { reply: 'Launch.StartResponse', to: 'sayBPMForSong' };
      case 'LaunchIntent':
        return { reply: 'Launch.StartResponse', to: 'sayBPMForSong' };
      case 'AMAZON.CancelIntent':
        return { reply: 'Exit.GoodbyeMessage', to: 'die' };
      case 'AMAZON.StopIntent':
        return { reply: 'Exit.GoodbyeMessage', to: 'die' };
      default:
        break;
    }
    const song = alexaEvent.intent.slots.Song.value;
    let artist = alexaEvent.intent.slots.Artist ? alexaEvent.intent.slots.Artist.value : '';
    let album = alexaEvent.intent.slots.Album ? alexaEvent.intent.slots.Album.value : '';
    let query = `track:${song}`;

    if (artist) {
      query = `${query} artist:${artist}`;
    }
    if (album) {
      query = `${query} album:${album}`;
    }

    return co(function* sayBPMFromSpotify() {
      const credentialResponse = yield spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(credentialResponse.body.access_token);

      const searchTracksResponse = yield spotifyApi.searchTracks(query, { limit: 1 });

      if (searchTracksResponse.error || !searchTracksResponse.body.tracks.items.length) {
        return {
          reply: 'SongInfo.NotFoundResponse',
          to: 'sayBPMForSong',
        };
      }

      const trackId = searchTracksResponse.body.tracks.items[0].id;

      if (!artist) {
        artist = searchTracksResponse.body.tracks.items[0].artists[0].name;
      }

      if (!album) {
        album = searchTracksResponse.body.tracks.items[0].album.name;
      }

      const audioFeaturesResponse = yield spotifyApi.getAudioFeaturesForTrack(trackId);

      if (audioFeaturesResponse.error) {
        return {
          reply: 'SongInfo.NotFoundResponse',
          to: 'sayBPMForSong',
        };
      }

      const tempo = Math.floor(audioFeaturesResponse.body.tempo);

      alexaEvent.model.BPM = tempo;
      alexaEvent.model.Song = song;
      alexaEvent.model.Artist = artist;
      alexaEvent.model.Album = album;

      let reply = 'SongInfo.TempoResponse';
      let to = 'sayBPMForSong';

      if (tempo >= config.metronome.minimumBPM && tempo <= config.metronome.maximumBPM) {
        reply = 'SongInfo.TempoResponseAndMetronomeInvitation';
        to = 'shouldPlayMetronome';
      }

      return {
        reply,
        to,
      };
    });
  });

  skill.onState('repeatTheBPMOfTheSong', (alexaEvent) => {
    if (alexaEvent.model.Artist && alexaEvent.model.BPM) {
      return {
        reply: 'SongInfo.RepeatBPMOfTheSong',
        to: 'sayBPMForSong',
      };
    }

    return {
      reply: 'SongInfo.YouHaveNotSearchAnySong',
      to: 'sayBPMForSong',
    };
  });

  skill.onState('shouldPlayMetronome', (alexaEvent) => {
    if (alexaEvent.intent.name === 'AMAZON.YesIntent') {
      const offset = 0;
      const index = 0;
      const shuffle = 0;
      const loop = 0;
      const url = clickTrackURLTemplate.replace('{bpm}', alexaEvent.model.BPM);

      const directives = buildPlayDirective(url, index, shuffle, loop, offset);

      return { reply: 'Metronome.PlayAudio', to: 'die', directives };
    }

    return {
      reply: 'Help.InviteToAskForAnotherSong',
      to: 'sayBPMForSong',
    };
  });

  skill.onState('stop', () => {
    const directives = buildStopDirective();

    return { reply: 'Metronome.Pause', to: 'die', directives };
  });

  skill.onIntent('AMAZON.ResumeIntent', (alexaEvent) => {
    if (alexaEvent.context) {
      const token = JSON.parse(alexaEvent.context.AudioPlayer.token);
      const shuffle = token.shuffle;
      const loop = token.loop;
      const index = token.index;
      const offsetInMilliseconds = alexaEvent.context.AudioPlayer.offsetInMilliseconds;
      debug(token.url);
      const url = token.url;

      const directives = buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds);

      return { reply: 'Metronome.Resume', to: 'die', directives };
    }

    return { reply: 'Exit.GoodbyeMessage', to: 'die' };
  });
};

function buildPlayDirective(url, index, shuffle, loop, offsetInMilliseconds) {
  const directives = {};
  directives.type = 'AudioPlayer.Play';
  directives.playBehavior = 'REPLACE_ALL';
  directives.token = createToken(index, shuffle, loop, url);
  directives.url = url;
  directives.offsetInMilliseconds = offsetInMilliseconds;

  return directives;
}

function createToken(index, shuffle, loop, url) {
  return JSON.stringify({ index, shuffle, loop, url });
}

function buildStopDirective() {
  const directives = {};
  directives.type = 'AudioPlayer.Stop';

  return directives;
}
