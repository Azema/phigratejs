'use strict';

module.exports = function(grunt) {
  //require('time-grunt')(grunt);

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');

  // Project Configuration
  grunt.initConfig({
    distdir: 'public/build',
    pkg: grunt.file.readJSON('package.json'),
    banner:
    '/*!\n' +
    ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
    '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
    ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
    ' * License <%= pkg.license %>\n */\n',
    assets: grunt.file.readJSON('server/config/assets.json'),
    clean: {
      build: {
        src: ['<%= distdir %>/*'],
        options: {
          force: true
        }
      }
    },
    src: {
      js: ['public/**/*.js', '!public/vendor/*'],
      vendor: ['public/vendor/**/*.js'],
      jsTpl: ['<%= distdir %>/templates/**/*.js'],
      specs: ['test/protractor/**/*.spec.js'],
      scenarios: ['test/protractor/**/*.scenario.js'],
      html: ['src/index.html'],
      tpl: {
        app: ['public/**/*.tpl.html', '!public/vendor/*']
      },
      less: ['public/system/assets/less/*.less', 'public/**/assets/less/*.less'],
      lessWatch: ['public/**/assets/less/*.less']
    },
    watch: {
      server: {
        files: ['server/**/*.js', 'server/views/**/*.html', 'gruntfile.js'],
        options: {
          reload: true,
          livereload: true
        }
      },
      html: {
        files: ['<%= src.tpl.app %>'],
        tasks: ['html2js'],
        options: {
          livereload: true
        }
      },
      less: {
        files: ['<%= src.lessWatch %>'],
        tasks: ['less:compileCore'],
        options: {
          livereload: true
        }
      }
    },
    copy: {
      fonts: {
        files: [{ dest: '<%= distdir %>/fonts/', src : '**', expand: true, cwd: 'public/vendor/bootstrap/dist/fonts/' }]
      }
    },
    jshint: {
      all: {
        src: ['gruntfile.js', 'server.js', 'server/**/*.js', '<%= assets.js %>', '!public/build/templates/app.js', 'test/**/*.js'], options: {
          jshintrc: true
        }
      }
    },
    html2js: {
      app: {
        options: {
          base: 'public'
        },
        src: ['<%= src.tpl.app %>'],
        dest: '<%= distdir %>/templates/app.js',
        module: 'templates.app'
      }
    },
    concat:{
      dist:{
        options: {
          banner: '<%= banner %>'
        },
        src:['<%= assets.app %>'],
        dest:'<%= distdir %>/js/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        mangle: false,
        banner: '<%= banner %>'
      },
      production: {
        src: ['<%= assets.vendors %>', '<%= assets.js %>'],
        dest:'<%= distdir %>/js/<%= pkg.name %>.min.js'
      }
    },
    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: '<%= pkg.name %>.css.map',
          sourceMapFilename: '<%= distdir %>/css/<%= pkg.name %>.css.map'
        },
        files: {
          '<%= distdir %>/css/<%= pkg.name %>.css': ['<%= src.less %>']
        }
      },
      minify: {
        options: {
          cleancss: true,
          report: 'min'
        },
        files: {
          '<%= distdir %>/css/<%= pkg.name %>.css': '<%= src.less %>'
        }
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: {
        src: ['public/**/assets/css/*.css']
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          delay: 1,
          env: {
            // DEBUG: '*',
            PORT: require('./server/config/config').port
          },
          cwd: __dirname
        }
      }
    },
    concurrent: {
      tasks: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec'
        //require: 'server.js'
      },
      src: ['test/mocha/**/*.js']
    },
    env: {
      test: {
        NODE_ENV: 'test'
      }
    },
    karma: {
      unit: {
        configFile: 'test/karma/karma.conf.js'
      }
    }
  });

  //Load NPM tasks
  // require('load-grunt-tasks')(grunt);

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  // Build
  //grunt.registerTask('build', ['jshint','less:compileCore', 'csslint', 'cssmin', 'uglify']);
  grunt.registerTask('build', ['clean:build'/*,'jshint'*/,'html2js'/*,'concat'*/,'less:compileCore','copy']);
  grunt.registerTask('release', ['clean','html2js','uglify','jshint',/*'karma:unit','concat',*/'less:minify','copy']);

  //Default task(s).
  if (process.env.NODE_ENV === 'production') {
    grunt.registerTask('default', ['release', 'concurrent']);
  } else {
    grunt.registerTask('default', ['build', 'concurrent']);
  }

  //Test task.
  grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
  grunt.registerTask('mocha', ['env:test', 'mochaTest']);
};
