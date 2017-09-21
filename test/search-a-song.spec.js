'use strict';

const alexaTest = require('alexa-skill-test-framework');
const assertView = require('./assertion-helpers').assertView;
const assertState = require('./assertion-helpers').assertState;
const skill = require('../skill');

alexaTest.initialize(skill, 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000', 'amzn1.ask.account.VOID');
alexaTest.setExtraFeature('questionMarkCheck', false);

describe('Search a song', () => {
  describe('Found a song with an available BPM for Metronome', () => {
    alexaTest.test([
      {
        request: alexaTest.getLaunchRequest(),
        shouldEndSession: false,
        saysCallback: assertView('Launch.StartResponse'),
        callback: assertState('sayBPMForSong'),
      },
      {
        request: alexaTest.getIntentRequest('SongRequestIntent', { Song: 'All creatures', Artist: 'kings kaleidoscope' }),
        shouldEndSession: false,
        saysCallback: assertView('SongInfo.TempoResponseAndMetronomeInvitation', { Song: 'All creatures', BPM: '156', Artist: 'kings kaleidoscope', Album: 'Asaph\'s Arrows' }),
        callback: assertState('shouldPlayMetronome'),
      },
    ], 'Should find a song, return the BPM and invite the user to start a metronome');
  });

  describe('Found a song with no available BPM for Metronome', () => {
    alexaTest.test([
      {
        request: alexaTest.getLaunchRequest(),
        shouldEndSession: false,
        saysCallback: assertView('Launch.StartResponse'),
        callback: assertState('sayBPMForSong'),
      },
      {
        request: alexaTest.getIntentRequest('SongRequestIntent', { Song: 'distance', Artist: 'vanilla sky' }),
        shouldEndSession: false,
        saysCallback: assertView('SongInfo.TempoResponse', { Song: 'distance', BPM: '192', Artist: 'vanilla sky', Album: 'Waiting for Something' }),
        callback: assertState('sayBPMForSong'),
      },
    ], 'Should find a song, return the BPM and invite the user to search another song');
  });

  describe('Did not found the song', () => {
    alexaTest.test([
      {
        request: alexaTest.getLaunchRequest(),
        shouldEndSession: false,
        saysCallback: assertView('Launch.StartResponse'),
        callback: assertState('sayBPMForSong'),
      },
      {
        request: alexaTest.getIntentRequest('SongRequestIntent', { Song: 'snbvcdf' }),
        shouldEndSession: false,
        saysCallback: assertView('SongInfo.NotFoundResponse'),
        callback: assertState('sayBPMForSong'),
      },
    ], 'Should not find a song and return a not found song response');
  });
});
