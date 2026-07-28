const fs = require('fs');
const glob = require('glob');

const files = glob.sync('apps/api/src/**/*.controller.ts');

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /import \{ ClerkAuthGuard \} from '.*clerk-auth\.guard';/g,
    "import { SessionAuthGuard } from '../auth/guards/session-auth.guard';",
  );
  content = content.replace(/@UseGuards\(ClerkAuthGuard/g, '@UseGuards(SessionAuthGuard');
  fs.writeFileSync(file, content);
});
console.log('Updated', files.length, 'files');
