'use strict';

module.exports = core;

const path = require('path')
const semver = require('semver');
const log = require('@bobo-cli-dev/log');
const colors = require('colors');
const rootCheck = require('root-check');
const userHome = require('user-home');
const pathExists = require('path-exists');
const minimist = require('minimist')
const dotEnv = require('dotenv')

const pkg = require('../package.json');
const constants = require('./const');

let args, config;

async function core () {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
    await checkGlobalUpdate();
  } catch (e) {
    log.error(e.message)
  }
}

async function checkGlobalUpdate () {
  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  // const npmName = pkg.name;
  const npmName = 'lodash';
  // 2. 调用 NPM api 获取所有版本号
  const { getNpmSemverVersion } = require('@bobo-cli-dev/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
    更新命令：npm install -g ${npmName}`))
  }
  // 3. 提取所有版本号，对比获取大于当前版本号项
  // 4. 获取最新版本，提示用户更新到该版本
}

async function checkEnv () {
  const dotEnvPath = path.resolve(userHome, '.env')
  const flag = await pathExists(dotEnvPath)
  if (flag) {
    config = dotEnv.config({
      path: dotEnvPath
    })
  }
  createDefaultConfig()
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig () {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constants.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkInputArgs () {
  args = minimist(process.argv.slice(2))
  checkArgs();
}

function checkArgs () {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
}

function checkUserHome () {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前用户主目录不存在！'))
  }
}

function checkRoot () {
  rootCheck();
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
