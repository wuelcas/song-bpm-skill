'use strict';

const alexaTest = require('alexa-skill-test-framework');
const assertView = require('./assertion-helpers').assertView;
const assertState = require('./assertion-helpers').assertState;
const skill = require('../skill');

alexaTest.initialize(skill, 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000', 'amzn1.ask.account.VOID');
alexaTest.setExtraFeature('questionMarkCheck', false);

describe('Launch', () => {
  describe('Found a song', () => {
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
        saysCallback: assertView('SongInfo.TempoResponse', { Song: 'All creatures', BPM: '156', Artist: 'kings kaleidoscope', Album: 'Asaph\'s Arrows' }),
        callback: assertState('shouldPlayMetronome'),
      },
    ]);
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
    ]);
  });
});

describe('Repeat', () => {
  describe('When the user have not search any song', () => {
    alexaTest.test([
      {
        request: alexaTest.getIntentRequest('AMAZON.RepeatIntent'),
        shouldEndSession: false,
        saysCallback: assertView('SongInfo.YouHaveNotSearchAnySong'),
        callback: assertState('sayBPMForSong'),
      },
    ]);
  });

  describe('When the user have search a song', () => {
    alexaTest.test([
      {
        request: alexaTest.getLaunchRequest(),
      },
      {
        request: alexaTest.getIntentRequest('SongRequestIntent', { Song: 'All creatures', Artist: 'kings kaleidoscope' }),
      },
      {
        request: alexaTest.getIntentRequest('AMAZON.NoIntent'),
      },
      {
        request: alexaTest.getIntentRequest('AMAZON.RepeatIntent'),
        shouldEndSession: false,
        saysCallback: assertView('SongInfo.RepeatBPMOfTheSong', { Song: 'All creatures', BPM: '156', Artist: 'kings kaleidoscope', Album: 'Asaph\'s Arrows' }),
        callback: assertState('sayBPMForSong'),
      },
    ]);
  });
});

describe('Help the user', () => {
  describe('Before Launch', () => {
    alexaTest.test([
      {
        request: alexaTest.getIntentRequest('AMAZON.HelpIntent'),
        shouldEndSession: false,
        saysCallback: assertView('Help.InstructionsMessage'),
        callback: assertState('sayBPMForSong'),
      },
    ]);
  });
  describe('After Launch', () => {
    alexaTest.test([
      {
        request: alexaTest.getLaunchRequest(),
      },
      {
        request: alexaTest.getIntentRequest('AMAZON.HelpIntent'),
        shouldEndSession: false,
        saysCallback: assertView('Help.InstructionsMessage'),
        callback: assertState('sayBPMForSong'),
      },
    ]);
  });
});
