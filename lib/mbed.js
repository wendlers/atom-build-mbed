'use babel';

import fs from 'fs';
import path from 'path';

import {EventEmitter} from 'events';
import {Directory} from 'atom';
import {File} from 'atom';


export const config = {
  verbosity: {
    title: 'verbosity',
    description: 'verbosity level',
    type: 'string',
    default: 'silent',
    enum: ['silent', 'verbose', 'very verbose'],
    order: 10
  },
  numJobs: {
    title: 'jobs',
    description: 'Number of jobs to run in parallel.',
    type: 'integer',
    default: 1,
    minimum: 1,
    maximum: 32,
    order: 20
  },
  buildDir: {
    title: 'build dir',
    description: 'Specify the build directory (relative to the current ' +
                 'project directory). Use `default` to use the `mbed` default ' +
                 'directory (which is `BUILD`).',
    type: 'string',
    default: 'default',
    order: 30
  },
  sourceDir: {
    title: 'source dir',
    description: 'Specify the sources directory (relative to the current ' +
                 'project directory). Use `default ` to use the `mbed` default ' +
                 'directory (which is the current project directory).',
    type: 'string',
    default: 'default',
    order: 30
  },
};

export function provideBuilder() {

  const errorMatch = [
    '(?<file>([A-Za-z]:[\\/])?[^:\\n]+):(?<line>\\d+):(?<col>\\d+):\\s*(fatal error|error):\\s*(?<message>.+)',
    '(?<file>([A-Za-z]:[\\/])?[^:\\n]+):(?<line>\\d+):\\s*(fatal error|error):\\s*(?<message>.+)'
  ];
  const warningMatch = [
    '(?<file>([A-Za-z]:[\\/])?[^:\\n]+):(?<line>\\d+):(?<col>\\d+):\\s*(warning):\\s*(?<message>.+)',
    '(?<file>([A-Za-z]:[\\/])?[^:\\n]+):(?<line>\\d+):\\s*(warning):\\s*(?<message>.+)'
  ];

  return class MbedBuildProvider extends EventEmitter {

    constructor(cwd) {
      super();

      this.src = cwd;

      console.log("mbed src dir: " + this.src);

      atom.config.observe('build-mbed.verbosity', () => this.emit('refresh'));
      atom.config.observe('build-mbed.numJobs', () => this.emit('refresh'));
      atom.config.observe('build-mbed.buildDir', () => this.emit('refresh'));
      atom.config.observe('build-mbed.sourceDir', () => this.emit('refresh'));
    }

    destructor() {
        console.log("done");
    }

    getNiceName() {
      return 'mbed';
    }

    isEligible() {
      this.files = ['mbed_settings.py']
        .map(f => path.join(this.src, f))
        .filter(fs.existsSync);
      return this.files.length > 0;
    }

    settings() {

      pre = function() {
      };

      post = function(success) {
          if(success) {
            atom.notifications.addSuccess("mbed build successful");
          }
          else {
            atom.notifications.addError("mbed build failed");
          }
      };

      var commonArgs = ['compile'];
      var buildDir = 'BUILD';

      if(atom.config.get('build-mbed.buildDir') != 'default') {
          buildDir = atom.config.get('build-mbed.buildDir');
          commonArgs = commonArgs.concat(
            ["--build", buildDir]);
      }

      if(atom.config.get('build-mbed.sourceDir') != 'default') {
          commonArgs = commonArgs.concat(
            ["--source", atom.config.get('build-mbed.sourceDir')]);
      }

      if(atom.config.get('build-mbed.verbosity') == 'verbose') {
        commonArgs = commonArgs.concat('--verbose');
      }
      else if(atom.config.get('build-mbed.verbosity') == 'very verbose') {
        commonArgs = commonArgs.concat('--very_verbose');
      }

      if(atom.config.get('build-mbed.numJobs') > 1) {
        commonArgs = commonArgs.concat(
          ['-j', atom.config.get('build-mbed.numJobs')]);
      }

      const releaseTarget = {
        preBuild: pre,
        postBuild: post,
        exec: 'mbed',
        name: 'mbed: release',
        args: commonArgs,
        sh: false,
        errorMatch: errorMatch,
        warningMatch: warningMatch
      };

      const releaseTargetClean = {
        preBuild: pre,
        postBuild: post,
        exec: 'mbed',
        name: 'mbed: release (clean build)',
        args: commonArgs.concat('-c'),
        sh: false,
        errorMatch: errorMatch,
        warningMatch: warningMatch
      };

      const debugTarget = {
        preBuild: pre,
        postBuild: post,
        exec: 'mbed',
        name: 'mbed: debug',
        args: commonArgs.concat(['--profile', 'mbed-os/tools/profiles/debug.json']),
        sh: false,
        errorMatch: errorMatch,
        warningMatch: warningMatch
      };

      const debugTargetClean = {
        preBuild: pre,
        postBuild: post,
        exec: 'mbed',
        name: 'mbed: debug (clean build)',
        args: commonArgs.concat(['-c', '--profile', 'mbed-os/tools/profiles/debug.json']),
        sh: false,
        errorMatch: errorMatch,
        warningMatch: warningMatch
      };

      const cleanTarget = {
        preBuild: pre,
        postBuild: post,
        exec: 'rm',
        name: 'mbed: clean',
        args: ['-fr', buildDir],
        sh: false,
        errorMatch: errorMatch,
        warningMatch: warningMatch
      };

      const targets = [
        releaseTarget,
        releaseTargetClean,
        debugTarget,
        debugTargetClean,
        cleanTarget];

      return targets
    }
  };
}
