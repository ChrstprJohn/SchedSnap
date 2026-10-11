import process from 'node:process';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { hashPassword } from '../server/adminAuth.js';

if (!process.stdin.isTTY) throw new Error('Run npm run admin:setup in an interactive terminal.');
function password(prompt) {
  process.stdout.write(prompt);
  return new Promise((resolveAnswer, reject) => {
    let value = '';
    process.stdin.setRawMode(true); process.stdin.resume();
    const finish = () => { process.stdin.off('data', receive); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); };
    const receive = chunk => {
      for (const character of chunk.toString()) {
        if (character === '\u0003') { finish(); reject(new Error('Setup cancelled.')); return; }
        if (character === '\r' || character === '\n') { finish(); resolveAnswer(value); return; }
        if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
        else if (character >= ' ' && value.length < 256) value += character;
      }
    };
    process.stdin.on('data', receive);
  });
}
try {
  const first = await password('Choose an admin password (at least 16 characters): ');
  if (first.length < 16 || first.length > 256) throw new Error('Use 16–256 characters.');
  const second = await password('Confirm password: ');
  if (first !== second) throw new Error('Passwords did not match.');
  const file = resolve(import.meta.dirname, '../.env.local');
  let source = existsSync(file) ? await readFile(file, 'utf8') : '';
  for (const [name, value] of Object.entries({ ADMIN_PASSWORD_HASH: hashPassword(first), ADMIN_SESSION_SECRET: randomBytes(32).toString('hex') })) {
    const expression = new RegExp(`^${name}=.*$`, 'm');
    source = expression.test(source) ? source.replace(expression, `${name}=${value}`) : source.trimEnd() + `\n${name}=${value}\n`;
  }
  await writeFile(file, source);
  console.log('Admin configured in .env.local. Restart the local server and open /admin.');
  console.log('Copy ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET into Vercel server environment settings.');
  console.log('For deployment, configure the login firewall rule described in documentation/ADMIN.md.');
} finally { process.stdin.setRawMode(false); process.stdin.pause(); }
