#!/usr/bin/env node

import { createCli } from '../dist/src/cli/cli.js';

const program = createCli();
program.parse(process.argv);
