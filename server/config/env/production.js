'use strict';

module.exports = {
  db: process.env.MONGOHQ_URL || 'mongodb://localhost/phigratejs',
  app: {
    name: 'Phigrate.js - Production'
  }
};
