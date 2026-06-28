import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// to import .env file

import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'

async function main() {
  await Template.build(template, 'vibe-nextjs-sarthak-dev', {
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);