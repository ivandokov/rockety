# Rockety

# Warning
**This project is unmaintained at the moment due to its similarity with Laravel Mix. There is a slight chance the project will get updated in the future.**

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]

This is a flexible ready to use front-end development toolbox based on [Gulp].
You do not have to edit the gulpfile.js and mess with JavaScript.
It is made super easy to use with a single **yml** configuration file.

[What is included]  
[Installation]  
[Usage]  
[Configuration]  
[Options]  
[Changelog]  
[Changelog CLI]  

## What is included

This setup comes with:
- EJX templating for including partials easier
- LESS compiler
- SASS compiler
- CSS minifier
- CSS Autoprefixer
- ESLint for JS syntax validation
- Babel & Webpack for ES2015+ transpiling
- JS minifier/uglifier
- SVG symbols sprite
- Livereload  

## Installation
Rockety comes with a Node.js installer for easier usage.
You have to install the installer and the required software to run Rockety:
```bash
npm install rockety-cli gulp-cli -g
```
Optionally you can install [Yarn] and it will make the process faster.

## Usage
Create a project
```bash
rockety create [project-name]
```

Installs latest cutting edge development and unstable version:
```bash
rockety create [project-name] --dev
```

Skip update check of rockety-cli:
```bash
rockety create [project-name] --noupdate
```

## Configuration
#### rockety.yml
This is an example of the configuration file and most of the options are self explanatory:
```yaml
# Global options for all sources
options:
    livereloadPort: 35729
    babelPolyfill: true
    autoprefixer:
        browsers:
            - last 2 versions
    svgInline: false
    watch:
        - public/**/*.html:
            - reload
        - src/common/**/*.{scss,less}:
            - css

# Sources section defines all source directories and their settings.
# By default a regular site needs only one style and script file,
# but more complicated sites could benefit of multiple sources.
# For example if you have an admin panel and you want to separate the
# styles and scripts from the front part of the website this is a perfect
# case for multiple sources.
sources:
    main:
        src: src
        dest: public/assets
        css:
            main: main.scss
            vendor:
                - node_modules/bootstrap/dist/css/bootstrap.min.css
        js:
            main: main.js
            vendor:
                - node_modules/jquery/dist/jquery.min.js
                - node_modules/bootstrap/dist/js/bootstrap.bundle.min.js
```

### Options
#### livereloadPort
There are cases when you want to run Rockety for multiple projects at once and there is a setting for the port to prevent conflicts.

#### babelPolyfill
If you are using ES2015+ syntax you may need to include Babel Polyfill for browser support.

#### autoprefixer
This object is directly passed to autoprefixer. You can use it to setup browsers support or other options listed in the [autoprefixer documentation].

#### svgInline
Builds inline SVGs according to the [svgstore documentation].

#### watch
List of file paths which will trigger specified tasks when changes are detected. Usually this is a place for your templates, but also for any common code. For example you are developing website with admin interface and you have common styles for the main website and the admin panel. You want to share some styles in `src/common/css` and include them in both sources. With the default configuration you will trigger `css` task when changing the common styles and rebuild the css for all sources.

#### Multiple sources
Sources section defines all source directories and their settings. By default a regular site needs only one style and script file, but more complicated sites could benefit of multiple sources. For example if you have an admin panel and you want to separate the styles and scripts from the front part of the website this is a perfect case for multiple sources.

Each source has options for [css] and [js].
```yaml
sources:
    main:
        src: src/front
        dest: public/front/assets
        ...
    admin:
        src: src/admin
        dest: public/admin/assets
        ...
```

### CSS
SASS and LESS are supported out of the box. You can select which one you would like to use by changing the extension (`.scss` / `.less`) of the main file specified at `main` property in the [configuration file]. The code is minified and uglified for production builds.

`vendor` is a list of third party styles usually coming from plugins or libraries. It's important to remember that all vendor files are concatenated in a single `vendor.css` file, but are not concatenated with the styles which you write to leverage better browser caching.

### JS
The configuration for JavaScript is pretty similar. The `main` property says which file is the main one and since Babel and Webpack are included you can use ES2015 modules to import other files. The code is minified and uglified for production builds.

`vendor` is a list of third party scripts usually coming from plugins or libraries. It's important to remember that all vendor files are concatenated in a single `vendor.js` file but are not concatenated with your code which you write to leverage better browser caching.

### HTML
To use [EJX] template engine you can take a look at the documentation, but the main reason for a template engine to be used is to enable partials to be included. For example you can have the same header and footer for the entire website and you can use a single file for each one and include them in the templates like this:
```
<% include header.html %>
```

### Gulp tasks
Rockety-cli delegates the arguments which are not used internally to Gulp so any Gulp arguments will work.

Rockety comes with number of Gulp tasks and by changing the rockety.yml configuration file you are adding more handful tasks.

To see all available tasks you can execute `rockety tasks` in the folder of your project.

The main tasks which you will use the most are the following:

`rockety help` - display rockety-cli command manual.

`rockety build` - executes all css, js, svg and copy, etc tasks at once.

`rockety build:production` / `rockety build:prod` - executes all build tasks without sourcemaps and with minification, prepared for production.

`rockety watch` - executes build and starts watching files for changes

`rockety serve` - launches local web server at http://localhost:8000 where you can develop. The server injects livereload.js and it is not required for you to include it manually.

`rockety config` - lists your configuration settings. This is useful to validate your rockety.yml file in case of syntax errors

There are also separate tasks for each source configuration. For example you can build only the css for `main` by executing `rockety css:main`

Additionally you have type tasks which combine all source tasks for the certain type. For example you can build all css related tasks for all sources by executing `rockety css`

## Changelog
##### v5.2.5
- Added [bootstrap-font-sizes] as dependency

##### v5.2.4
- Messed up the releases

##### v5.2.3
- Fixed svg store `inlineSvg` option to always add `display:none` to the svg

##### v5.2.2
- Updated some packages
- Ran `npm audit fix`
- Added .npmignore

##### v5.2.1
- Ignored shapes.svg in the output directory

##### v5.2.0
- Moved Bootstrap styles from vendor to compiled SCSS files for variable overrides beacuse this is what is required usually. Nobody is using the default Bootstrap styles.
- Updated to Bootstrap 4.1.0

##### v5.1.1
- Fixed watchers to include subdirectories

##### v5.1.0
- Fixed gitignore in public/assets to ignore only the build output files
- Removed http-equiv meta from index.html
- Refactored watch directive to be more universal and fixed [#16](https://github.com/ivandokov/rockety/issues/16).

##### v5.0.2
- Updated packages (Bootstrap 4, etc)

##### v5.0.1
- Fixed sass error log which was stopping the watcher

##### v5.0.0
- Added Babel and Webpack for ES2015+ support and transpiling to ES5.
- Simplified configuration file syntax.
- Minification is on by default for production and off for development
- Sourcemaps are off by default for production and on for development

##### v4.0.0
- Minimal Node.js version required is 6.12.2.
- Gulpfile.js syntax is updated to ES6.
- Replaced gulp-connect with express and added ejs support for .html files and closing [#13](https://github.com/ivandokov/rockety/issues/13).
- Handled error when syntax of less/sass is wrong and crashes the watch process.
- Use sass by default.
- Refactoring.

##### v3.8.0
- Added serve command to launch web server with Livereload but still keep the option to use watch command with Livereload.
- Removed livereload.js script from index.html because it's not needed anymore. For watch command the developers could use browser plugin or again insert the script.
- Updated index.html commands list.

##### v3.7.0
- By default use less in the default config file.
- Disabled minification in the default config file to speed up the development build.
- Fixed livereload printing many files. rockety.yml watch selection was too wide
- Added build:production and build:prod (alias) for building for production.
- Sourcemaps are disabled for production.
- Allow sourcemaps to be written to external files instead of embeded inside the output file

##### v3.6.1
- v3.6.0 was missing Yarn install and yarn.lock was outdated.

##### v3.6.0
- Removed rockety-assets since Bootstrap 4 beta 2 is included by default and the two collide.

##### v3.5.1
- Fixed paths to vendor files. Now they can be anywhere, not fixed to src/vendor as Bower was set before.
- index.php -> index.html
- Bootstrap 4.0.0-beta.2 installed by default.

##### v3.5.0
- Rockety-assets is moved from Bower to npm. Bye bye Bower.
- Ignored public/assets/*
- Fixed issue when source is missing "watch"

##### v3.4.1
- Added gitignore for Bower src/vendor folder

##### v3.4.0
- Vendor files for js and css are bundled separately. This is for better resource caching
- Sourcemaps are working properly now. A drawback is that you cannot use LESS and SASS in the same time. You have to choose one. If both are enabled in rockety.yml the LESS is selected
- Concatenated js files are now using bundle.js instead of scripts.js

##### v3.3.2
- Fixed source path for javascripts

##### v3.3.1
- Changed default config for svg inline to be false which was left true by mistake

##### v3.3.0
- Added option for svgstore to output only <svg> element without <?xml ?> and DOCTYPE to use inline, default: false.

##### v3.2.1
- Added yarn.lock file. The rockety-cli now will check if you have Yarn installed and will use it. If not it will fallback to npm.

##### v3.2.0
- Added Autoprefixer configuration in [rockety.yml]
- Deleted `public/.gitignore`. This was used to keep test builds clean and rockety-cli delete it but for the people which do not use the installer this is a problem.
- Added `.gitattributes`

##### v3.1.0
- Changed [rockety.yml] format a little bit. Now there are global options and the different sources have their own directive. This is a minor change in the config file and this is why the version bump is minor. Please check the [rockety.yml] for the new format.
- Livereload port is not configurable


##### v3.0.9
- Add missing "copy" subtask to "build" task

##### v3.0.8
- Fixed crashes of watch process because of syntax errors in user scripts
- Added more flexibility to the [rockety.yml] configuration files. Now you can freely remove any not required configuration and the build process will not fail. For example you may not need to "copy" files or even remove any "js" if you project doesn't need it.

##### v3.0.7
- Updated quick guide

##### v3.0.6
- Fixed error for watch command when there isn't copy task
- Accidentally published the package to www.npmjs.com

##### v3.0.5
- Moved jshint config to `.jshintrc` or easier modification and allow IDEs to use it

##### v3.0.4
- Added quick guide to the default index.php

##### v3.0.3
- Removed Rockety svg logo from src and added it inline in index.php

##### v3.0.2
- Removed changelog file and add a link to changelog in the documentation site

##### v3.0.1
- Add forgotten dependencies

##### v3.0.0
- Complete rewrite from scratch using Gulp instead of Grunt
- More flexibility - you can control the source and destination
- Instead of default, the watch task is separate
- Build task is added
- Separate tasks for each source
- Separate tasks for css/svg/js
- New default index.php with Rockety logo

##### v2.2.0
- Renamed the project to Rockety

##### v2.1.0
- Stopped JSHint of breaking the build
- Declated all js modules as globals for JSHint so it doesn't complain
- Added grunt build task
- Merged PR [#1](https://github.com/ivandokov/rockety/pull/1) which fixes shapes.svg bug

##### v2.0.0
- Added [load-grunt-tasks]
- Added [grunt-postcss]
- Replaced deprecated [grunt-autoprefixer] with [autoprefixer]
- Replaced [grunt-contrib-cssmin] with [cssnano]
- Updated [grunt-contrib-less] to v1.1.0
- Removed [grunt-contrib-contact] because [grunt-contrib-uglify] can do the same. Concat was used when you develop and do not want to minify the source to see where your code come from easily, but source maps are better option.
- Updated [grunt-contrib-jshint] to v0.11.3
- Updated [grunt-contrib-uglify] to v0.11.0
- Updated [grunt-svgstore] to v0.5.0

##### v1.2.0
_ Added support for SVG sprites. Take a look at the example in `src/front/less/style.less`. It includes `src/front/less/sprite.less` and uses the mixing `.svg()`. The SVG sprite mixins are in namespace `#Sprite`.

##### v1.1.0
- Moved and renamed the `src/config.json` to `gruntfile.yaml`
- Added option to include multiple JavaScript files in `src/<view>/js/` from the `gruntfile.yaml`.
- Now you should list the default **scripts** file there too otherwise it will not be included.
- It is useful when you want to store your Prototype objects in different files.
- The files are compiled after the JavaScript modules.

##### v1.0.0
- Initial version

## Changelog CLI

##### cli v1.11.1
- Fixed issue with `proxy()` which was breaking commands send to `gulp`

##### cli v1.11.0
- Bumped node version to 6.12.2
- Syntax updated to ES6

##### cli v1.10.1
- Updated help

##### cli v1.10.0
- Fixed bug with `rockety create`
- Removed Bower because `rockety-assets` is a node module

##### cli v1.9.0
- Better error handling for proxy commands when executing outside Rockety project folder
- Fix in help
- Allow project creation in current folder when using "." for project name/path

##### cli v1.8.0
- Fixed env for `exec/execSync/spawn` which fixes the proxy function for using: `rockety build/watch/etc`

##### cli v1.7.0
- Install dependencies with yarn if it is available

##### cli v1.6.1
- `--dev` flag downloads master branch instead of dev branch
- Removed cleanup code because it is handled by gitattributes now

##### cli v1.6.0
- Renamed install argument to create because it makes more sense

##### cli v1.5.1
- Fixed error when creating cache dir
- Fixed update message

##### cli v1.5.0
- Cache Rockety version locally to declearse install time for next projects

##### cli v1.4.4
- Started changelog for `rockety-cli`
- Updated readme

##### cli v1.4.3
- Updated readme

##### cli v1.4.2
- Exit if directory exists

##### cli v1.4.1
- Fixed path for `find()`

##### cli v1.4.0
- Proxy arguments to Gulp
- Default command is replaced with create one: `rockety create [project-name]`
- Fixed bug when wrong extracted folder name is selected and removed `/bin/bash` alias from `exec`
- Added option to not check for `rockety-cli update: --noupdate`
- Added help
- Refactoring

##### cli v1.3.2
- Fixed message for update

##### cli v1.3.1
- Show errors from npm and bower if any
- Updated message for npm and bower install

##### cli v1.3.0
- Check for updates before doing anything else
- Colorful messages
- Spinner when running bower/npm install

##### cli v1.2.5
- Changed exec shell to bash
- Combined log messages for npm and bower
- Move cleanup before npm/bower install

##### cli v1.2.4
- Removed changelog from cleanup list

##### cli v1.2.3
- Fixed paths for cleanup and exec for global install of cli

##### cli v1.2.1
- Run `bower install`
- Add `public/.gitignore` to cleanup list

##### cli v1.2.0
- Clean up unnecessary files from project folder after extraction
- More code refactoring
- Run `npm install` when extration is done

##### cli v1.1.0
- Added option to create dev version
- Code refactoring

##### cli v1.0.5
- Check if project directory exists

##### cli v1.0.4
- Added shebang

##### cli v1.0.3
- Fixed path to bin and main file

##### cli v1.0.2
- Added create and usage commands

## Author
[Ivan Dokov](http://dokov.bg/)

## Contributors
[Martin Vatev](https://dribbble.com/Vatev)


[what is included]: #what-is-included
[installation]: #installation
[usage]: #usage
[configuration]: #configuration
[options]: #options
[css]: #css
[js]: #js
[configuration file]: #rocketyyml
[rockety.yml]: #rocketyyml
[changelog]: #changelog
[changelog cli]: #changelog-cli
[gulp]: https://gulpjs.com
[yarn]: https://yarnpkg.com
[ejs]: http://ejs.co
[downloads-image]: https://img.shields.io/npm/dm/rockety.svg
[npm-url]: https://www.npmjs.com/package/rockety
[npm-image]: https://img.shields.io/npm/v/rockety.svg
[greenkeeper-url]: https://greenkeeper.io/
[greenkeeper-image]: https://badges.greenkeeper.io/ivandokov/rockety.svg
[autoprefixer documentation]: https://github.com/postcss/autoprefixer#options
[svgstore documentation]: https://github.com/w0rm/gulp-svgstore#options
[load-grunt-tasks]: https://www.npmjs.com/package/load-grunt-tasks
[grunt-postcss]: https://www.npmjs.com/package/grunt-postcss
[grunt-autoprefixer]: https://www.npmjs.com/package/grunt-autoprefixer
[autoprefixer]: https://www.npmjs.com/package/autoprefixer
[grunt-contrib-cssmin]: https://www.npmjs.com/package/grunt-contrib-cssmin
[cssnano]: https://www.npmjs.com/package/cssnano
[grunt-contrib-less]: https://www.npmjs.com/package/grunt-contrib-less
[grunt-contrib-contact]: https://www.npmjs.com/package/grunt-contrib-contact
[grunt-contrib-uglify]: https://www.npmjs.com/package/grunt-contrib-uglify
[grunt-contrib-jshint]: https://www.npmjs.com/package/grunt-contrib-jshint
[grunt-svgstore]: https://www.npmjs.com/package/grunt-svgstore
[bootstrap-font-sizes]: https://www.npmjs.com/package/bootstrap-font-sizes


