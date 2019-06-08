// Hue controller

const fs = require('fs');
const util = require('util');
const request = require('request');
const Ssdp = require('node-ssdp').Client;

const ssdpClient = new Ssdp();
const asyncRequest = util.promisify(request);

// path to app config file
const CFG_FILE = `${__dirname}/../config.json`;

const config = (() => {
  let cfgObject;
  try {
    cfgObject = JSON.parse(fs.readFileSync(CFG_FILE, 'utf8'));
  } catch (err) {
    throw err;
  }
  return cfgObject;
})();

async function queryAPI(url, method, body = {}) {
  let response;
  try {
    response = await asyncRequest({
      method,
      uri: `http://${config.bridge.address}/api/${config.user}/${url}`,
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.log(`Error on API ${method} query to ${url}: ${error}`);
    return undefined;
  }
  return JSON.parse(response.body);
}

function findBridge() {
  ssdpClient.on('response', (header, statusCode, info) => {
    if (header.SERVER.includes('IpBridge')) {
      config.bridge = {
        address: info.address,
        port: info.port,
      };
      return true;
    }
    return false;
  });
  ssdpClient.search('ssdp:all');
}

async function getLights() {
  const lights = await queryAPI('lights', 'GET');
  return lights;
}

async function getLight(id) {
  const light = await queryAPI(`lights/${id}`, 'GET');
  return light;
}

async function setLightOnOff(id, value) {
  await queryAPI(`lights/${id}/state`, 'PUT', { on: value });
}

module.exports = {
  findBridge,
  getLights,
  getLight,
  setLightOnOff,
};
