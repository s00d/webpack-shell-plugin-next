require('ts-node').register({
  project: 'tsconfig.json'
});

module.exports = require('./webpack.config.ts').default;
