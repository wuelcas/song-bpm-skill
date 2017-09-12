'use strict';

const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config');
const co = require('co');

const spotifyApi = new SpotifyWebApi({
  clientId: config.spotify.clientId,
  clientSecret: config.spotify.clientSecret,
});

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', () => ({ reply: 'Launch.StartResponse', to: 'sayBPMForSong' }));
  skill.onIntent('AMAZON.StartOverIntent', () => ({ reply: 'Launch.StartResponse', to: 'sayBPMForSong' }));
  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Help.InstructionsMessage', to: 'sayBPMForSong' }));
  skill.onIntent('SongRequestIntent', () => ({ to: 'sayBPMForSong' }));
  skill.onIntent('AMAZON.CancelIntent', () => ({ reply: 'Exit.GoodbyeMessage', to: 'die' }));
  skill.onIntent('AMAZON.StopIntent', () => ({ reply: 'Exit.GoodbyeMessage', to: 'die' }));
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
      default:
        break;
    }

    const song = alexaEvent.intent.slots.Song.value;
    let artist = alexaEvent.intent.slots.Artist.value || '';
    let album = alexaEvent.intent.slots.Album.value || '';
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

      return {
        reply: 'SongInfo.TempoResponse',
        to: 'sayBPMForSong',
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
};
