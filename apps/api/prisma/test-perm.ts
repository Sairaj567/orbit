import * as fs from 'fs';

const paths = [
  'C:\\Program Files\\PostgreSQL\\17',
  'C:\\Program Files\\PostgreSQL\\17\\lib',
  'C:\\Program Files\\PostgreSQL\\17\\share',
  'C:\\Program Files\\PostgreSQL\\17\\share\\extension',
];

for (const p of paths) {
  try {
    fs.accessSync(p, fs.constants.W_OK);
    console.log('Writable:', p);
  } catch {
    console.log('NOT Writable:', p);
  }
}
