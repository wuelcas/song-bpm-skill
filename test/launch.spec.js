'use strict';

const alexaTest = require('alexa-skill-test-framework');
const assertView = require('./assertion-helpers').assertView;
const assertState = require('./assertion-helpers').assertState;
const skill = require('../skill');

alexaTest.initialize(skill, 'amzn1.ask.skill.00000000-0000-0000-0000-000000000000', 'amzn1.ask.account.VOID');
alexaTest.setExtraFeature('questionMarkCheck', false);

describe('Launch response', () => {
  alexaTest.test([
    {
      request: alexaTest.getLaunchRequest(),
      shouldEndSession: false,
      saysCallback: assertView('Launch.StartResponse'),
      callback: assertState('sayBPMForSong'),
    },
  ], 'Should return the launch response');
});
