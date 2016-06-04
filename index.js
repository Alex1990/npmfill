var fs = require('fs');
var ini = require('ini');
var path = require('path');
var extend = require('xtend');
var shelljs = require('shelljs');
var minimist = require('minimist');
var format = require('string-template');

var cwd = process.cwd();
var rePkgSrc = /^([\w-]+:)([\w-]+\/)([\w-]+)(@v?\d+\.\d+\.\d+)?$/;

function readNpmConfig() {
  var projectConfigFile = path.join(cwd, '.npmrc');
  var userConfigFile = path.join(process.env.HOME, '.npmrc');
  var projectConfig;
  var userConfig;

  try {
    fs.accessSync(projectConfigFile);
    projectConfig = ini.parse(fs.readFileSync(projectConfigFile, 'utf-8'));
  } catch (e) {}

  try {
    fs.accessSync(userConfigFile);
    userConfig = ini.parse(fs.readFileSync(userConfigFile, 'utf-8'));
  } catch (e) {}

  return extend({}, userConfig, projectConfig);
}

function parsePkg(pkgSrc) {
  var obj = {};

  pkgSrc = pkgSrc + '';

  pkgSrc.replace(rePkgSrc, function (match, s1, s2, s3, s4) {
    obj.registry = (s1 + '').slice(0, -1);
    obj.user = s2;
    obj.repository = s3 + '';
    obj.version = s4 ? '#' + s4.slice(1) : '';
  });

  return obj;
}

function invokeNpm(command) {
  shelljs.exec(command, function (code, stdout, stderr) {
    if (code === 0) {
      console.log(stdout);
    } else {
      console.error(stderr);
    }
  });
}

module.exports = function () {
  var config = readNpmConfig();
  var npmfill = config.npmfill || {};
  var originArgv = process.argv.slice(2);
  var argv = minimist(originArgv);
  var command;

  if (argv._[0] === 'install' || argv._[0] === 'i') {
    var pkg = parsePkg(argv._[1]);
    var registry = pkg.registry;
    var user = pkg.user;
    var repository = pkg.repository;
    var version = pkg.version;

    if (registry && npmfill.hasOwnProperty(registry)) {
      var pkgUri = format(npmfill[registry], {
        user: user,
        repository: repository,
        version: version
      });

      var installOptsAlias = {
        S: 'save',
        D: 'save-dev',
        O: 'save-optional',
        E: 'save-exact',
        B: 'save-bundle'
      };
      var installOpts = [];

      for (var p in installOptsAlias) {
        if (installOptsAlias.hasOwnProperty(p)) {
          installOpts.push(installOptsAlias[p]);
        }
      }

      var installArgv = minimist(originArgv, {
        boolean: installOpts,
        alias: installOptsAlias
      });

      command = 'npm install ' + pkgUri;
      installOpts.forEach(function (opt) {
        if (installArgv[opt]) {
          command += ' --' + opt;
        }
      });
    } else {
      command = 'npm ' + originArgv.join(' ');
    }
  } else {
    command = 'npm ' + originArgv.join(' ');
  }

  invokeNpm(command);
};
