'use strict';

const expect = require('chai').expect;
const views = require('../skill/views');
const _ = require('lodash');

function assertReply(expectedReply) {
  return (context, speech) => {
    expect(speech).to.equal(`<speak>${expectedReply}</speak>`);
  };
}

function assertView(expectedView, variables, forceResponseType) {
  function getStatement(path) {
    const viewObject = _.get(views, path);
    if (!viewObject) {
      throw new Error(`${path} not found`);
    }

    const responseTypes = forceResponseType ? [forceResponseType] : ['ask', 'say', 'tell'];

    return _(responseTypes)
    .map(key => viewObject[key])
    .filter()
    .map(view => view.replace(/\{(\w+)\}/g, (m, offset) => {
      if (variables && !_.isUndefined(variables[offset])) {
        return variables[offset];
      }

      throw new Error(`Variable ${offset} missing`);
    }))
    .first();
  }

  return (context, speech) => {
    let expectedReply;
    if (_.isArray(expectedView)) {
      expectedReply = _.reduce(expectedView, (acc, view) => {
        const statement = getStatement(view);
        acc.push(statement);
        return acc;
      }, []).join('\n');
    } else {
      expectedReply = getStatement(expectedView);
    }

    expect(speech).to.equal(`<speak>${expectedReply}</speak>`);
  };
}

function assertState(expectedState) {
  return (context, response) => {
    expect(response.sessionAttributes.state).to.equal(expectedState);
  };
}

module.exports = {
  assertReply,
  assertView,
  assertState,
};
