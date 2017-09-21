'use strict';

const alexaTest = require('alexa-skill-test-framework');
const assertView = require('./assertion-helpers').assertView;
const assertState = require('./assertion-helpers').assertState;
const skill = require('../skill');
const clickTrackURLTemplate = require('../config').metronome.clickTrackURLTemplate;

alexaTest.initialize(skill, 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000', 'amzn1.ask.account.VOID');
alexaTest.setExtraFeature('questionMarkCheck', false);

describe('Launch', () => {
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
    ]);
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

describe('Metronome', () => {
  describe('Start Metronome', () => {
    const index = 0;
    const shuffle = 0;
    const loop = 0;
    const url = clickTrackURLTemplate.replace('{bpm}', 156);
    alexaTest.test([
      {
        request: alexaTest.getLaunchRequest(),
      },
      {
        request: alexaTest.getIntentRequest('SongRequestIntent', { Song: 'All creatures', Artist: 'kings kaleidoscope' }),
      },
      {
        request: alexaTest.getIntentRequest('AMAZON.YesIntent'),
        shouldEndSession: true,
        saysCallback: assertView('Metronome.PlayAudio'),
        playsStream: {
          behavior: 'REPLACE_ALL',
          url,
          token: JSON.stringify({ index, shuffle, loop, url }),
          offset: 0,
        },
      },
    ]);
  });

  describe('Pause or stop metronome', () => {
    alexaTest.test([
      {
        request: alexaTest.getIntentRequest('AMAZON.StopIntent'),
        stopsStream: true,
      },
    ]);
    alexaTest.test([
      {
        request: alexaTest.getIntentRequest('AMAZON.PauseIntent'),
        stopsStream: true,
      },
    ]);
  });

  describe('Resume metronome', () => {
    const index = 0;
    const shuffle = 0;
    const loop = 0;
    const url = clickTrackURLTemplate.replace('{bpm}', 156);
    const offset = 123;
    const token = JSON.stringify({ index, shuffle, loop, url });
    alexaTest.test([
      {
        request: alexaTest.addAudioPlayerContextToRequest(alexaTest.getIntentRequest('AMAZON.ResumeIntent'), token, offset),
        playsStream: {
          behavior: 'REPLACE_ALL',
          token,
          url,
          offset,
        },
      },
    ]);
  });
});
