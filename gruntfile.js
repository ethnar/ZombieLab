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
          cwd: 'styles',
          src: ['*.less'],
          dest: 'styles',
          ext: '.css'
        }]
      }
    },
    watch: {
      styles: {
        files: ['styles/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.registerTask('default', ['less', 'watch']);
};