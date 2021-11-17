import yargs from 'yargs';
import fs from 'fs'
import path from 'path';

const { argv } = yargs;

const { directory = "../quoi", src = 'src', translations = 'src/assets/locales/', save = false } = { ...argv }
console.log(argv);
const langs = ['de', 'en', 'zh'];
const regexp = /t\([\'\"](.*?)[\'\"],\s?[\'\"](.*?)[\'\"].*?\)/ig;

const list = [];

const langObjects = langs.map(key => {
  const filePath = path.join(directory, translations, `${key}.json`);
  const fileContext = fs.readFileSync(filePath);
  try {
    const contextObject = JSON.parse(fileContext);
    return contextObject;
  }
  catch (e) {
    return {};
  }
});

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
      Array.from(fileContext.matchAll(regexp)).forEach(t => {
        list.push({ key: t[1], value: t[2] })
      });
    }
  })
}

walk(path.join(directory, src))

list.forEach(({ key, value }) => {
  langObjects.forEach(item => {
    if (!item[key]) {
      console.log(key)
      item[key] = value;
    }
  })
});


if (save) {
  langObjects.forEach((object, index) => {
    const filePath = path.join(directory, translations, `${langs[index]}.json`);
    fs.writeFileSync(filePath, JSON.stringify(object, null, 2), { encoding: 'utf8' })
  })
}