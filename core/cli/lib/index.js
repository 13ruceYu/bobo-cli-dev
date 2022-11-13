'use strict';

module.exports = core;

const semver = require('semver');
const log = require('@bobo-cli-dev/log');
const colors = require('colors');

const pkg = require('../package.json');
const constants = require('./const');

function core () {
  try {
    checkPkgVersion();
    checkNodeVersion();
  } catch (e) {
    log.error(e.message)
  }
}

function checkNodeVersion () {
  // 第一步，获取当前 node version
  const currentVersion = process.version;
  const lowestVersion = constants.LOWEST_NODE_VERSION;

  // 第二部，对比对低版本号
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`bobo-cli 需要安装 v${lowestVersion} 以上的 Node.js`))
  }
}

function checkPkgVersion () {
  log.notice('cli', pkg.version)
}
