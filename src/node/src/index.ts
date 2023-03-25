#!/usr/bin/env node

import { GarethDuncanDev } from './garethduncandev.js';
import { GAZZDEV_VERSION } from './version.js';

const version = GAZZDEV_VERSION;
console.log(`v${version}`);

const gazzDev = new GarethDuncanDev();
const message = gazzDev.readme();
console.log(message);
