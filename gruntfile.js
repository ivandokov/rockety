module.exports = function(grunt) {

	var cfgCache = {};

	function Config() {

		var config = {};
		var views;
		var view;
		var livereloadPort;
		var modules;
		var module;
		var cfg;

		cfg = grunt.file.readJSON('src/config.json');

		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			modules = cfg.views[view].js.modules;

			for ( module in modules ) {
				if ( ! modules.hasOwnProperty(module) ) continue;

				modules[module] = 'src/modules/js/' + modules[module] + '.js';
			}

			if ( grunt.file.exists('src/'+ view +'/js/scripts.js') )
				modules.push('src/'+ view +'/js/scripts.js');

			cfg.views[view].js.modules = modules;
		}

		views = cfg.views;
		livereloadPort = cfg.livereloadPort || 35730;

		/**
		* JS Hint
		*/
		config.jshint = {
			options: {
				bitwise: true,
				camelcase: true,
				eqeqeq: true,
				forin: true,
				latedef: 'nofunc',
				newcap: true,
				noarg: true,
				noempty: true,
				nonbsp: true,
				quotmark: 'single',
				undef: true,
				unused: false,
				strict: true,
				trailing: true,
				browser: true,
			},
			modules: ['src/modules/js/*.js'],
		};
		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			config.jshint[view] = ['src/'+ view +'/js/scripts.js'];
		}


		/**
		* Concat
		*/
		config.concat = {
			options: {
				separator: ';'
			}
		};
		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			config.concat[view] = {
				src: views[view].js.modules,
				dest: 'public/assets/'+ view +'/js/scripts.js',
			};
		}


		/**
		* Uglify
		*/
		config.uglify = {};
		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			if ( ! cfg.views[view].js.minify ) continue;

			config.uglify[view] = {
				src: 'public/assets/'+ view +'/js/scripts.js',
				dest: 'public/assets/'+ view +'/js/scripts.js',
			};
		}


		/**
		* LESS
		*/
		config.less = {};
		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			config.less[view] = {files: {}};
			config.less[view].files['public/assets/'+ view +'/css/style.css'] = 'src/'+ view +'/less/style.less';
		}


		/**
		* Autoprefixer
		*/
		config.autoprefixer = {
			options: {
				browsers: ['last 2 version', 'ie 9'],
				map: false,
			}
		};
		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			config.autoprefixer[view] = {
				src: 'public/assets/'+ view +'/css/style.css',
				dest: 'public/assets/'+ view +'/css/style.css',
			};
		}


		/**
		* CSS Minifier
		*/
		config.cssmin = {};
		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			if ( ! cfg.views[view].less.minify ) continue;

			config.cssmin[view] = {
				files: [
					{ src: 'public/assets/'+ view +'/css/style.css', dest: 'public/assets/'+ view +'/css/style.css' }
				]
			};
		}


		/**
		* SVG Store
		*/
		config.svgstore = {
			options: {
				prefix: 'svg-',
				cleanup: true,
				svg: {
					style: 'display:none',
				},
			}
		};
		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			config.svgstore[view] = {files: {}};
			config.svgstore[view].files['public/assets/'+ view +'/svg/shapes.svg'] = ['src/'+ view +'/svg/*.svg'];
		}

		/**
		* Watch
		*/
		config.watch = {
			options: {
				spawn: false,
				livereload: livereloadPort,
			}
		};

		for ( view in cfg.views ) {
			if ( ! cfg.views.hasOwnProperty(view) ) continue;

			config.watch[view + 'css'] = {
				files: ['src/'+ view +'/less/*.less'],
				tasks: ['less:'+ view, 'autoprefixer:'+ view]
			};
			if ( cfg.views[view].less.minify )
				config.watch[view + 'css'].tasks.push('cssmin:'+ view);

			config.watch[view + 'js'] = {
				files: ['src/'+ view +'/js/**/*.js'],
				tasks: ['jshint:'+ view, 'concat:'+ view]
			};
			if ( cfg.views[view].js.minify )
				config.watch[view + 'js'].tasks.push('uglify:'+ view);

			config.watch[view + 'svg'] = {
				files: ['src/'+ view +'/svg/*.svg'],
				tasks: ['svgstore:'+ view]
			};

			config.watch[view + 'views'] = {files: []};
			for ( var tpl in cfg.views[view].views )
				config.watch[view + 'views'].files.push(cfg.views[view].views[tpl]);
		}

		config.watch.lessmodules = {
			files: ['src/modules/less/*.less'],
			tasks: ['less', 'cssmin', 'autoprefixer']
		};

		config.watch.jshintmodules = {
			files: ['src/modules/js/*.js'],
			tasks: ['jshint:modules', 'concat', 'uglify'],
		};

		config.watch.reload_config = {
			files: ['src/config.json'],
			tasks: ['reload_config', 'cssmin', 'jshint:modules', 'concat', 'uglify'],
		};

		return config;
	}

	grunt.config.init(Config());

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-svgstore');

	grunt.registerTask('reload_config', "Reload config", function() {
		grunt.config.data = Config();
    	console.log("Reloading config");
	});

	grunt.registerTask('config', "Print config", function() {
    	console.log(JSON.stringify(Config(), null, 4));
	});

	grunt.registerTask('default', ['watch']);

};