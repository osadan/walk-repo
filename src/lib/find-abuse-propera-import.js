//node --experimental-json-modules ./src/lib/find-abuse-propera-import
import yargs from 'yargs';
import fs from 'fs'
import path from 'path';
import externals from './externals.json';

const externalsKeys = externals.map(item => Object.keys(item)[0])

const { argv } = yargs;
console.log(argv)
const {
  directory = "../lh-shipment-consols",
  src = 'src',
  save = false,
  repo = ''
} = { ...argv }

const regexpPropera = /from\s+['\"]@?propera\/+(.*)?['\"];?/img;
const regexpLayout = /from\s+['\"]@?layout\/+(.*)?['\"];?/img;
const regexpRouter = /from\s+['\"]@?router\/+(.*)?['\"];?/img;

const list = [];

async function walk(dir) {

  const files = fs.readdirSync(dir);
  files.forEach(child => {
    const filePath = path.join(dir, child);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      return walk(filePath);
    }
    else if (path.extname(filePath).match(/.jsx?$/)) {
      const fileContext = fs.readFileSync(filePath, { encoding: 'utf8' });
      Array.from(fileContext.matchAll(regexpPropera)).forEach(t => {
        const str = '@freightos/propera/propera/' + t[1];
        const exist = externalsKeys.find(key => key === str);
        if (!exist) {
          list.push({ path: str, file: filePath });
        }
      });

      Array.from(fileContext.matchAll(regexpLayout)).forEach(t => {
        const str = '@freightos/propera/layout/' + t[1];
        const exist = externalsKeys.find(key => key === str);
        if (!exist) {
          list.push({ path: str, file: filePath });
        }
      });

      Array.from(fileContext.matchAll(regexpRouter)).forEach(t => {
        const str = '@freightos/propera/router/' + t[1];
        const exist = externalsKeys.find(key => key === str);
        if (!exist) {
          list.push({ path: str, file: filePath });
        }
      });

    }
  })
}


walk(`/home/ohad/Projects/freightos/client/${repo}/src`);
console.log(list);