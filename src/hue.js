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

function xyBriToHex(x, y, bri) {
  // to convert from the crazy CIE color space that Hue bulbs use to sane RGB hex values
  // taken from https://stackoverflow.com/questions/22894498/philips-hue-convert-xy-from-api-to-hex-or-rgb
  // I'm not crazy enough to come up with this on my own)
  const z = 1.0 - x - y;

  const Y = bri / 255.0; // Brightness of lamp
  const X = (Y / y) * x;
  const Z = (Y / y) * z;
  let r = X * 1.612 - Y * 0.203 - Z * 0.302;
  let g = -X * 0.509 + Y * 1.412 + Z * 0.066;
  let b = X * 0.026 - Y * 0.072 + Z * 0.962;
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
  const maxValue = Math.max(r,g,b);
  r /= maxValue;
  g /= maxValue;
  b /= maxValue;
  r = r * 255;   if (r < 0) { r = 0 };
  g = g * 255;   if (g < 0) { g = 0 };
  b = b * 255;   if (b < 0) { b = 0 };

  r = Math.round(r).toString(16);
  g = Math.round(g).toString(16);
  b = Math.round(b).toString(16);

  if (r.length < 2)
      r="0"+r;        
  if (g.length < 2)
      g="0"+g;        
  if (b.length < 2)
      b="0"+r;        
  const rgb = "#"+r+g+b;

  return rgb;             
}

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
  xyBriToHex,
};
