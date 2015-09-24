# Dokov Grunt

This is a really flexible ready to use Grunt setup.  
It is made super easy to use with a single JSON based configuration file.  
You do not have to edit the gruntfile.js and mess with JavaScript.  
All you need to do is open ```gruntfile.cfg``` and change the settings.  

## What is included

This setup comes with:  
* LESS compiler  
* CSS minifier  
* CSS Autoprefixer  
* JS validation (JSHint)  
* JS minifier/uglifier  
* SVG symbols compiler  

## Changelog

##### v1.1.0
- Moved and renamed the ```src/config.json``` to ```gruntfile.cfg```  
- Added option to include multiple JavaScript files in ```src/<view>/js/``` from the ```gruntfile.cfg```.  
- Now you should list the default **scripts** file there too otherwise it will not be included.  
- It is useful when you want to store your Prototype objects in different files.  
- The files are compiled after the JavaScript modules.  


##### v1.0.0
Initial version
