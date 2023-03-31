#!/usr/bin/env node

import GarethDuncanDev from './garethduncandev.js';

const dev = new GarethDuncanDev();

const version = dev.version;
console.log(`v${version}`);

const message = dev.readme();
console.log(message);
