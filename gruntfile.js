module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    /* :::::::::: JS Hint - Lint .js files :::::::::: */
    jshint: {
      options: {
        'globals': {
          'jQuery': true,
          'alert': true
        }
      },
      files: [
        'gruntfile.js',
        'assets/js/functions.js',
        'assets/js/scripts.js'
      ]
    },

    /* :::::::::: Compass - compile and compress SASS :::::::::: */
    compass: {
      dev: {
        options: {
          sassDir: ['assets/sass'],
          cssDir: ['assets/css'],
          environment: 'development'
        }
      },
      prod: {
        options: {
          sassDir: ['assets/sass'],
          cssDir: ['assets/css'],
          environment: 'production',
          outputStyle: 'compressed',
          noLineComments: true
        }
      }
    },

    /* :::::::::: Uglify - compile and compress JavaScript :::::::::: */
    uglify: {
      all: {
        files: {
          'assets/js/scripts.min.js': [
            'assets/js/scripts.js',
            'assets/js/lib/conditionizr-4.3.0.min.js',
            'assets/js/lib/modernizr.flexbox.js',
          ]
        }
      }
    },
    

    /* :::::::::: Clean - delete main.css when compressing for production :::::::::: */
    /*
    clean: {
      css: ['assets/css/style.css']
    },
    */

    /* :::::::::: Minify - minify css :::::::::: */
    cssmin: {
      options: {
        sourceMap: true,
      },
      my_target: {
        files: [{
          expand: true,
          cwd: 'assets/css/',
          src: ['*.css', '!*.min.css'],
          dest: 'assets/css/',
          ext: '.min.css'
        }]
      }
    }

    /* :::::::::: Watch - compile CSS and JavaScript on save :::::::::: */
    watch: {
      options: {
        livereload: true,
      },
      compass: {
        files: ['assets/sass/*.scss'],
        tasks: ['compass:dev', 'notify']
      },
      js: {
        files: ['gruntfile.js','assets/js/scripts.js',],
        tasks: ['jshint', 'uglify', 'notify']
      }
    },

    /* :::::::::: Grunt Notifications :::::::::: */
    notify: {
      watch: {
        options: {
          title: 'R-R-Refresh!',
          message: 'All Grunt processes have completed.'
        }
      }
    }

  });

  // load tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compass');
  //grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');

  // register tasks
  grunt.registerTask('default', [
    'jshint',
    //'clean',
    'compass:dev',
    'uglify',
    'cssmin',
    'watch',
    'notify'
  ]);
  


  grunt.registerTask('prod', [
    //'clean',
    'compass:prod',
    'uglify',
    'cssmin'
  ]);

};
