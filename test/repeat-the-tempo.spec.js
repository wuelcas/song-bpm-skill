'use strict';

const alexaTest = require('alexa-skill-test-framework');
const assertView = require('./assertion-helpers').assertView;
const assertState = require('./assertion-helpers').assertState;
const skill = require('../skill');

alexaTest.initialize(skill, 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000', 'amzn1.ask.account.VOID');
alexaTest.setExtraFeature('questionMarkCheck', false);

describe('Repeat Intent', () => {
  describe('When the user have not search any song', () => {
    alexaTest.test([
      {
        request: alexaTest.getIntentRequest('AMAZON.RepeatIntent'),
        shouldEndSession: false,
        saysCallback: assertView('SongInfo.YouHaveNotSearchAnySong'),
        callback: assertState('sayBPMForSong'),
      },
    ], 'Should return a response inviting the user to search a song');
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
    ], 'Should return the BPM of the last found song');
  });
});
