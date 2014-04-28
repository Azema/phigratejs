// updatedAt.js
'use strict';

module.exports = exports = function timestampsPlugin(schema, options) {
  schema.add({ createdAt: { type: Date, default: Date.now }, updatedAt: Date });

  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });

  if (options && options.index.createdAt) {
    schema.path('createdAt').index(options.index.createdAt);
  }
  if (options && options.index.updatedAt) {
    schema.path('updatedAt').index(options.index.updatedAt);
  }
};

/* vim: set ts=2 sw=2 sts=2 et ai: */
