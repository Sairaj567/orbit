import * as fs from 'fs';
import * as path from 'path';

try {
  fs.writeFileSync('C:\\Program Files\\PostgreSQL\\17\\share\\extension\\test_write.txt', 'hello');
  console.log('Successfully wrote test_write.txt!');
  fs.unlinkSync('C:\\Program Files\\PostgreSQL\\17\\share\\extension\\test_write.txt');
} catch (e: any) {
  console.error('Failed write test:', e.message);
}
