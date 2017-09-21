'use strict';

const alexaTest = require('alexa-skill-test-framework');
const assertView = require('./assertion-helpers').assertView;
const skill = require('../skill');
const clickTrackURLTemplate = require('../config').metronome.clickTrackURLTemplate;

alexaTest.initialize(skill, 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000', 'amzn1.ask.account.VOID');
alexaTest.setExtraFeature('questionMarkCheck', false);

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
    ], 'Should start a metronome at the found song tempo');
  });

  describe('Pause or stop metronome', () => {
    alexaTest.test([
      {
        request: alexaTest.getIntentRequest('AMAZON.StopIntent'),
        stopsStream: true,
      },
    ], 'Should pause the stream with a Stop Intent');
    alexaTest.test([
      {
        request: alexaTest.getIntentRequest('AMAZON.PauseIntent'),
        stopsStream: true,
      },
    ], 'Should pause the stream with a Pause Intent');
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
    ], 'Should resume a stream in a Resume Intent');
  });
});
