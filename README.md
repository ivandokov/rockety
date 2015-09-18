# Grunt

This is my Grunt setup for starting new sites.  
Usually I use it in Laravel

## Config

All source files are in ```src``` folder and the grunt setup is configured by ```gruntfile.cfg``` file.  
The file is self explanatory, I guess.

## Changelog

##### v1.1.0
Moved and renamed the ```src/config.json``` to ```gruntfile.cfg```  
Added option to include multiple JavaScript files in ```src/<view>/js/``` from the ```gruntfile.cfg```.  
Now you should list the default **scripts** file there too otherwise it will not be included.  
It is useful when you want to store your Prototype objects in different files.  
The files are compiled after the JavaScript modules.  


##### v1.0.0
Initial version