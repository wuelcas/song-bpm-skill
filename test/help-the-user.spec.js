'use strict';

const alexaTest = require('alexa-skill-test-framework');
const assertView = require('./assertion-helpers').assertView;
const assertState = require('./assertion-helpers').assertState;
const skill = require('../skill');

alexaTest.initialize(skill, 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000', 'amzn1.ask.account.VOID');
alexaTest.setExtraFeature('questionMarkCheck', false);

describe('Help the user', () => {
  describe('Before Launch', () => {
    alexaTest.test([
      {
        request: alexaTest.getIntentRequest('AMAZON.HelpIntent'),
        shouldEndSession: false,
        saysCallback: assertView('Help.InstructionsMessage'),
        callback: assertState('sayBPMForSong'),
      },
    ], 'Should return a help response without saying the launch response');
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
    ], 'Should return a help response after saying the launch response');
  });
});
