// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require('child_process');

module.exports = {
  exec: function _exec(command) {
    return execSync(command).toString().trim();
  },
};
