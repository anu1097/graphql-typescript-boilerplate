require("ts-node/register");
const { globalJestSetup } = require('./setup');

module.exports = async function () {
  await globalJestSetup();
  return null;
}