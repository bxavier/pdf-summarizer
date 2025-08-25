#!/usr/bin/env node

const mode = process.argv[2] || 'server';

if (mode === 'cli') {
  require('./app');
} else if (mode === 'server') {
  require('./api/server');
} else {
  console.log('Usage: npm start [server|cli]');
  process.exit(1);
}
