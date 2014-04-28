'use strict';

module.exports = {
  db: process.env.MONGOHQ_URL || 'mongodb://localhost/phigratejs-dev',
  app: {
    name: 'Phigrate.js - Development'
  }
};
