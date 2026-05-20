const fs = require('fs');
const path = require('path');

const walkSync = (dir, callback) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && (filepath.endsWith('.tsx') || filepath.endsWith('.ts'))) {
      callback(filepath);
    }
  });
};

const replaceInFile = (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;

  const replacements = [
    { regex: /themeColors\.defaultBlack\[10\]/g, replacement: 'themeColors.black[9]' },
    { regex: /themeColors\.figmaTeal/g, replacement: 'themeColors.teal' },
    { regex: /themeColors\.grey/g, replacement: 'themeColors.gray' }
  ];

  replacements.forEach(({ regex, replacement }) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
};

walkSync(path.join(__dirname, 'src/module/GeneralJournal/DetailAccount'), replaceInFile);
