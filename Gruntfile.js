module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.initConfig({

        watch: {

            index: {
                files: ['www/less/*', 'www/src/*'],
                tasks: ['index']
            }
            
        },

        less: {
            index: {
                files: {
                    'www/css/index.css': 'www/less/index.less'
                }
            }

        },

        concat: {

            index: {
                src: [
                    'www/src/app.js',
                    'www/src/BaiduLoc.js',
                    'www/src/scroll.js',
                    'www/src/list.js',
                    'www/src/detail.js',
                    'www/src/index.js'
                ],
                dest: 'www/js/index.js'
            }
            
        },

        uglify: {
            index: {
                files: {
                    'www/js/index.js': 'www/js/index.js'
                }
            }
        },

        cssmin: {
            index: {
                files: {
                    'www/css/index.css': 'www/css/index.css',
                    'www/css/list.css': 'www/css/list.css'
                }
            }
        }

    });

    grunt.registerTask(
        'index', 
        ['less:index', 'concat:index']
    );

    grunt.registerTask(
        'release', 
        ['less:index', 'concat:index', 'uglify:index', 'cssmin:index']
    );

};