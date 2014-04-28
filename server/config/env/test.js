'use strict';

module.exports = {
  db: process.env.MONGOHQ_URL || 'mongodb://localhost/phigratejs-test',
  port: 3001,
  app: {
    name: 'Phigrate.js - Test'
  }
};
