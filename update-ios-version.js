const fs = require('fs-extra');
const path = require('path');
const plist = require('plist');

const packageJson = fs.readJsonSync('package.json');
const version = packageJson.version;

const infoPlistPath = path.join(__dirname, 'ios', 'App', 'App', 'Info.plist');
const infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
const parsedPlist = plist.parse(infoPlist);

parsedPlist.CFBundleShortVersionString = version;
parsedPlist.CFBundleVersion = version;

const updatedPlist = plist.build(parsedPlist);
fs.writeFileSync(infoPlistPath, updatedPlist, 'utf8');