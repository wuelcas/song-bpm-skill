'use strict';

function getEnv() {
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (process.env.AWS_LAMBDA_FUNCTION_NAME === 'MusicTempo') {
      return 'production';
    }
    return 'staging';
  }

  return 'local';
}

module.exports = getEnv();
