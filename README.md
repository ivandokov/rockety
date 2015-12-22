# Dokov Grunt

This is a really flexible ready to use Grunt setup.  
You do not have to edit the gruntfile.js and mess with JavaScript.  
It is made super easy to use with a single YAML configuration file.  
All you need to do is open ```gruntfile.yaml``` and change the settings.  

## What is included

This setup comes with:  
* LESS compiler  
* CSS minifier  
* CSS Autoprefixer  
* JS validation (JSHint)  
* JS minifier/uglifier  
* SVG symbols compiler  

## Changelog

##### v2.0.0
- Added [load-grunt-tasks](https://www.npmjs.com/package/load-grunt-tasks)
- Added [grunt-postcss](https://www.npmjs.com/package/grunt-postcss)
- Replaced deprecated [grunt-autoprefixer](https://www.npmjs.com/package/grunt-autoprefixer) with [autoprefixer](https://www.npmjs.com/package/autoprefixer)
- Replaced [grunt-contrib-cssmin](https://www.npmjs.com/package/grunt-contrib-cssmin) with [cssnano](https://www.npmjs.com/package/cssnano)
- Updated [grunt-contrib-less](https://www.npmjs.com/package/grunt-contrib-less) to v1.1.0
- Removed [grunt-contrib-contact](https://www.npmjs.com/package/grunt-contrib-contact) because [grunt-contrib-uglify](https://www.npmjs.com/package/grunt-contrib-uglify) can do the same. Concat was used when you develop and do not want to minify the source to see where your code come from easily, but source maps are better option.
- Updated [grunt-contrib-jshint](https://www.npmjs.com/package/grunt-contrib-jshint) to v0.11.3
- Updated [grunt-contrib-uglify](https://www.npmjs.com/package/grunt-contrib-uglify) to v0.11.0
- Updated [grunt-svgstore](https://www.npmjs.com/package/grunt-svgstore) to v0.5.0

##### v1.2.0
- Added support for SVG sprites. Take a look at the example in ```src/front/less/style.less```. It includes ```src/front/less/sprite.less``` and uses the mixing ```.svg()```. The SVG sprite mixins are in namespace ```#Sprite```.

##### v1.1.0
- Moved and renamed the ```src/config.json``` to ```gruntfile.yaml```  
- Added option to include multiple JavaScript files in ```src/<view>/js/``` from the ```gruntfile.yaml```.  
- Now you should list the default **scripts** file there too otherwise it will not be included.  
- It is useful when you want to store your Prototype objects in different files.  
- The files are compiled after the JavaScript modules.  


##### v1.0.0
Initial version