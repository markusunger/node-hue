// convert xy color values into rgb, hex and back, following the specs from
// https://developers.meethue.com/develop/application-design-guidance/color-conversion-formulas-rgb-to-xy-and-back/

const xyToRgb = function xyToRgb(x, y, bri) {
  // x, y expected to be between [0, 1]
  // bri is the 'brightness' property of the light, between [0, 254]

  let z = 1 - x - y;
  if (z < 0) z = 0;
  const Y = bri / 254; // map brightness to [0, 1] range
  const X = (Y / y) * x;
  const Z = (Y / y) * z;

  // convert to RGB values
  let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
  let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
  let b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

  // apply reverse gamma correction
  r = r <= 0.0031308 ? 12.92 * r : (1 + 0.055) * (r ** (1 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1 + 0.055) * (g ** (1 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1 + 0.055) * (b ** (1 / 2.4)) - 0.055;

  // handle some edge cases... inelegantly, but I can't be arsed to fix this
  if (r > 1) r = 1;
  if (g > 1) g = 1;
  if (b > 1) b = 1;
  if (r < 0) r = 0;
  if (g < 0) g = 0;
  if (b < 0) b = 0;

  // convert rgb values to [0, 254] range and then to hex
  r = Math.round(r * 254);
  g = Math.round(g * 254);
  b = Math.round(b * 254);

  return [r, g, b];
};

const xyToHex = function xyToHex(x, y, bri) {
  let [r, g, b] = xyToRgb(x, y, bri);

  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  // pad hex values with 0 if necessary
  if (r.length === 1) r = `0${r}`;
  if (g.length === 1) g = `0${g}`;
  if (b.length === 1) b = `0${b}`;

  return `#${r}${g}${b}`;
};

const hexToXY = function hexToXY(hex) {

};

module.exports = {
  xyToRgb,
  xyToHex,
  hexToXY,
};
