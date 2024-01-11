# EqmsCustomer

## Table of Contents
- [Commands](#Commands)

## Commands

- Create Angular project
> ng new project_name

- Add and update plugin/library (alternative of npm install)
> ng add plugin_name
> ng update plugin_name

- Run dev server
> ng serve

- Clean project cache
> ng cache clean

- Build project (default: production env) or wth specific env
> ng build
> ng build --configuration development
> ng build --configuration staging
> ng build --configuration production

- Build project and packages with versioning
- ['https://medium.com/@tolvaly.zs/how-to-version-number-angular-6-applications-4436c03a3bd3']
> npm run build

- Add Ionic Capacitor config
> npx cap init

- Sync Build to Ionic Capacitor
> npx cap sync

- Open Ionic Capacitor Emulator
> npx cap open android
> npx cap open ios

- Recommended Ionic Capacitor build before opening emulator
> ng cache clean; ng build --configuration development; npx cap sync; npx cap open android;

- Recommended Ionic Capacitor build before publishing to repository
> ng cache clean; ng build; npm run build; npx cap sync;

- Generate component|module|service|interface|class|enum|pipe|guard|directive file
> ng generate component f_name
> ng g c f_name
--
> ng generate module f_name
> ng g m f_name
--
> ng generate service f_name
> ng g s f_name
--
> ng generate interface f_name
> ng g i f_name
--
> ng generate class f_name
> ng g c f_name
--
> ng generate enum f_name
> ng g e f_name
--
> ng generate pipe f_name
> ng g p f_name
--
> ng generate guard f_name
> ng g g f_name
--
> ng generate directive f_name
> ng g d f_name