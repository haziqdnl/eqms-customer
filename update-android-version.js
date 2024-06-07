const fs = require('fs-extra');
const path = require('path');

const packageJson = fs.readJsonSync('package.json');
const version = packageJson.version;
const versionCode = version.split('.').map((num, idx) => parseInt(num, 10) * Math.pow(100, 2 - idx)).reduce((a, b) => a + b, 0);

const buildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

const versionCodeRegex = /versionCode \d+/;
const versionNameRegex = /versionName "[^"]+"/;

const updatedBuildGradle = buildGradle
    .replace(versionCodeRegex, `versionCode ${versionCode}`)
    .replace(versionNameRegex, `versionName "${version}"`);

fs.writeFileSync(buildGradlePath, updatedBuildGradle, 'utf8');