/**
 * 中国蚁剑::更新程序
 * 开写: 2016/05/31
 * 更新: 2016/06/19
 * 说明: 从2.0.0起，取消在线更新程序的方式，改为程序启动一分钟后，检测github->release最新的版本更新信息，然后提示手动更新
 */

const config = require('./config');
const superagent = require('superagent');

class Update {
  constructor(electron) {
    this.logger = new electron.Logger('Update');
    electron.ipcMain.on('check-update', this.checkUpdate.bind(this));
  }

  /**
   * 检查更新
   * 如果有更新，则以通知的方式提示用户手动更新，用户点击跳转到更新页面
   * @return {[type]} [description]
   */
  checkUpdate(event) {
    this.logger.debug('checkUpdate..');
    superagent
      .get('https://api.github.com/repos/antoor/antSword/releases/latest')
      .end((err, ret) => {
        try {
          let lastInfo = JSON.parse(ret.text);
          let newVersion = lastInfo['tag_name'];
          let curVersion = config['package'].version;
          // 比对版本
          if (curVersion !== newVersion) {
            this.logger.info('Found a new version', newVersion);
            event.sender.send('notification-update', {
              ver: newVersion,
              url: lastInfo['html_url']
            });
          } else {
            this.logger.warn('No new version.');
          }
        } catch(e) {
          this.logger.fatal('ERR', e);
        }
      });
  }
}

module.exports = Update;
