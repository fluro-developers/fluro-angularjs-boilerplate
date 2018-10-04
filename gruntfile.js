module.exports = function(grunt) {

    "use strict";

    var rewrite = require('connect-modrewrite');



    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        connect: {
            main: {
                options: {
                    port: 9001,
                    base: 'app'
                }
            }
        },

        watch: {

            options: {
                livereload: {
                    port: 9002
                }
            },
            css: {
                files: [
                    'build/components/**/*.scss',
                    'build/routes/**/*.scss',
                    'build/scss/**/*.scss',
                ],
                tasks: ['concat:sass', 'sass', 'autoprefixer'],
            },
            html: {
                files: [
                    'build/components/**/*.html',
                    'build/routes/**/*.html',
                    //'build/html/**/*.html',
                ],
                tasks: ['ngtemplates:components', 'ngtemplates:routes'],
            },
            js: {
                files: [
                    'build/app.js', //Watch the app configuration file
                    'build/boilerplate.js', //Watch the boilerplate to see if it changed
                    'build/components/**/*.js', //And all the components we create
                    'build/routes/**/*.js', //And all the components we create
                ],
                tasks: ['concat:js'],
            },
            bower: {
                files: [
                    'bower.json',
                ],
                tasks: ['wiredep']
            },
        },

        ngtemplates: {
            components:{
                cwd: './build/components',
                src: '**/*.html',
                dest: 'app/js/templates.components.js',
                options: {
                    module:'fluro',
                    //usemin:'/js/templates.min.js',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true, // Only if you don't use comment directives! 
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                }
            },
            routes:{
                cwd: './build/routes',
                src: '**/*.html',
                dest: 'app/js/templates.routes.js',
                options: {
                    module:'fluro',
                    prefix: 'routes/',
                    //usemin:'/js/templates.min.js',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true, // Only if you don't use comment directives! 
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                }
            }
        },


        //open: {
        //dev: {
        //  path: 'http://0.0.0.0:9001',
        //app: 'Google Chrome'
        //},
        //},





        wiredep: {
            task: {
                src: [
                    'app/index.html', // .html support...
                ],
                options: {
                    // cwd: './app',
                    exclude: [
                        '/bower_components/bootstrap/dist/js/bootstrap.js'
                    ],
                },
                fileTypes: {
                    html: {
                        block: /(([\s\t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
                        detect: {
                            js: /<script.*src=['"](.+)['"]>/gi,
                            css: /<link.*href=['"](.+)['"]/gi
                        },
                        replace: {
                            js: '<script src="/{{filePath}}"></script>',
                            css: '<link rel="stylesheet" href="/{{filePath}}" />'
                        }
                    }
                }

            }
        },
        //Build Stuff
        cssmin: {
            build: {
                files: {
                    'dist/css/style.min.css': ['app/css/style.css']
                }
            }
        },
        copy: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/**',
                    ],
                    dest: 'dist'
                }, {
                    expand: true,
                    cwd: 'app/bower_components/font-awesome/fonts',
                    src: ['*.*'],
                    dest: 'dist/fonts'
                }, {
                    expand: true,
                    cwd: 'build/scss',
                    src: [
                        '.tmp.style.scss',
                        'includes/**',
                    ],
                    dest: 'dist/scss'
                }],
            },
        },

        htmlmin: {
            generated: {
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: [
                        'index.html',
                    ],
                    dest: 'dist'
                }]
            },
            dist: {
                options: { // Target options
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'dist/index.html'
                }
            },
        },

        //Concatenate all the build js files
        concat: {
            js: {
                src: [
                    'build/app.js',
                    'build/boilerplate.js',
                    'build/routes.js', 
                    'build/components/**/*.js', 
                    'build/routes/**/*.js', 
                ],
                dest: 'app/js/app.js',
            },
            sass: {
                src: [
                    'build/scss/style.scss',
                    'build/components/**/*.scss',
                    'build/routes/**/*.scss',
                ],
                dest: 'build/scss/.tmp.style.scss',
            },
            dist: {
                src: [
                    'dist/js/vendor.js', 
                    '.tmp/js/app.annotated.js'
                ],
                dest: '.tmp/js/app.combined.js',
            },
        },

        sass: {
            build: {
                files: {
                    //'app/css/style.css': 'build/components/**/*.scss'
                    'app/css/style.css': 'build/scss/.tmp.style.scss'
                }
            }
        },


        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: {
                    '.tmp/js/app.annotated.js': ['dist/js/app.js'],
                }
            }
        },

        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: 'dist'
            }
        },


        usemin: {
            html: ['dist/{,*/}*.html', 'dist/{,*/}*.ejs'],
            css: ['dist/css/{,*/}*.css'],
            js: ['dist/js/{,*/}*.js'],
            options: {
                dirs: ['dist']
            }
        },

        autoprefixer: {
            single_file: {
                src: 'app/css/style.css',
                dest: 'app/css/style.css'
            }
        },
        uglify: {
            options: {
                mangle: false,
                // compress: false,
                beautify: true
            },
            dist: {
                options: {
                    // mangle: {
                    //     except: ['angular']
                    // },
                    mangle: true,
                    // compress: true,
                    beautify: false,
                },
                src: ['.tmp/js/app.combined.js'],
                dest: 'dist/js/app.min.js'
            }
        }
    });

    //grunt.registerTask('default', ['connect', 'open:dev', 'watch']);
    grunt.registerTask('default', ['connect', 'watch']);
    //grunt.registerTask('build', ['copy:build', 'htmlmin:build', 'uglify:build', 'cssmin:build']);
    grunt.registerTask('build', ['useminPrepare', 'concat:generated', 'copy', 'cssmin', 'htmlmin:generated', 'uglify:generated', 'usemin', 'ngAnnotate', 'concat:dist', 'uglify:dist', 'fluro', 'htmlmin:dist']);

    //'autoprefixer', 'cssmin'


    grunt.registerTask('fluro', 'add fluro meta tags', function() {
        var config = '<meta property="fluro_url" content="<%= apipath %>"> <% if(app.icon) { %> <link rel="icon" type="image/png" href="<%= apipath %>/get/<%= app.icon %>/file/image.png?w=320&h=320"> <% } %> <% if(authSettings == \'client\') { %> <meta property="fluro_application_key" content="<%= sessionKey %>"> <% } %> <% if(authSettings == \'application\') { %> <meta property="fluro_application_key" content="<%= app.apikey %>"> <% } %> <% if(authSettings == \'global\') { %> <% } %> <% if(useTimezone) { %> <meta property="fluro_timezone_offset" content="<%= timezoneOffset %>"> <% } %> <% if(app.timezone) { %> <meta property="fluro_timezone" content="<%= app.timezone %>"> <% } %>';
        var beforecss = '<% if(app.stylesheets && app.stylesheets.length) { %><link rel="stylesheet" href="/appstyle.css" /><% }  else { %>';
        var aftercss = '<% } %>';
        var googleanalytics = '<script> (function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,\'script\',\'https://www.google-analytics.com/analytics.js\',\'ga\'); <% if(app.data.gaTrackingCode) { %> ga(\'create\', \'<%= app.data.gaTrackingCode %>\', \'auto\'); <% } %> ga(\'create\', \'YOUR_GA_APP_ID_HERE\', \'auto\', \'fluro\');</script>';
        var appdata = '<script src="/appdata.js" type="text/javascript"></script>';
        var headerInject = '<% if(app.headerInject && app.headerInject.length) { %><%- app.headerInject %><% } %>';
        var footerInject = '<% if(app.footerInject && app.footerInject.length) { %><%- app.footerInject %><% } %>';

        var index = grunt.file.read('dist/index.html');
        console.log('Adding Fluro Injections');
        index = index.replace('<!-- fluro:config -->', config);
        index = index.replace('<!-- fluro:beforecss -->', beforecss);
        index = index.replace('<!-- fluro:aftercss -->', aftercss);
        index = index.replace('<!-- fluro:googleanalytics -->', googleanalytics);
        index = index.replace('<!-- fluro:headerinject -->', headerInject);
        index = index.replace('<!-- fluro:footerinject -->', footerInject);
        index = index.replace('<!-- fluro:appdata -->', appdata);

        console.log('Removing Fluro local tags')
        index = index.replace(/([\s\S]*?)<!-- fluro:devstart -->[\s\S]*?<!-- fluro:devend -->/g, '$1');


        // console.log(index);
        grunt.file.write('dist/index.html', index);
    });


};