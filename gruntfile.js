module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-clean");      // for deleting folders, files
    grunt.loadNpmTasks("grunt-ts");                 // for compiling typescript to js
    grunt.loadNpmTasks("grunt-contrib-watch");      // for watching files and execute tasks on changes

    /* GRUNT TASK CONFIG */
    grunt.initConfig({
        config: {
            dev: "dev",
            prod: "prod"
        },
        clean: {            
            dev: "<%= config.dev %>",
            prod: "<%= config.prod %>",

            // grunt-ts is creating .baseDir.js files on compiling.. dont ask why.. (there is already an issue on github)
            baseDirBug: ["src/**/.baseDir.ts", 
                "<%= config.dev %>/**/.baseDir.js", "<%= config.dev %>/**/.baseDir.js.map"]
        },
        ts: {
            dev: {
                src: ["src/**/*.ts"],
                outDir: "<%= config.dev %>"                
            }
        },
        watch: {
            ts: {
                files: ["src/**/*.ts"],
                tasks: ["ts", "clean:baseDirBug"]
            },
        }
    });

    /* ALIAS TASKS */
    grunt.registerTask("dev", ["clean:dev", "ts", "clean:baseDirBug"]);
    grunt.registerTask("devWatch", ["dev", "watch"]); // TODO !!

    grunt.registerTask("prod", ["clean:prod"]);
};