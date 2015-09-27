module.exports = function(grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: [{
          expand: true,
          cwd: 'bin/styles/less',
          src: ['style.less'],
          dest: 'bin/styles/css',
          ext: '.css'
        }]
      }
    },
    watch: {
      styles: {
        files: ['bin/styles/less/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.registerTask('default', ['less', 'watch']);
};
