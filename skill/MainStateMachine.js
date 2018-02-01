'use strict';

// Include the state machine module and the replyWith function
const Voxa = require('voxa');
const ga = require('voxa-ga');
const views = require('./views');
const variables = require('./variables');
const states = require('./states');
const config = require('../config');

const skill = new Voxa({ variables, views });
states.register(skill);
ga(skill, config.google_analytics);

module.exports = skill;
