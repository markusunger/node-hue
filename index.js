const express = require('express');
const hue = require('./src/hue');
const colors = require('./src/color');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

// web interface
app.get('/', async (req, res) => {
  const lights = await hue.getLights();
  res.render('index', {
    lights,
    xyToHex: colors.xyToHex,
  });
});

app.get('/detail/:id', async (req, res) => {
  const light = await hue.getLight(req.params.id);
  if (light) {
    res.render('detail', {
      light,
      lightID: req.params.id,
      xyToHex: colors.xyToHex,
      xyToRgb: colors.xyToRgb,
      hexToXY: colors.hexToXY,
      rgbToHex: colors.rgbToHex,
    });
  } else {
    res.render('error', {
      message: 'That\'s not a valid light',
    });
  }
});

// API routes
app.get('/light/:id', async (req, res) => {
  // switch light on state to opposite of current on state
  const light = await hue.getLight(req.params.id);
  if (light) hue.setLightOnOff(req.params.id, !light.state.on);
  res.send(null);
});

app.post('/light/:id/color', async (req, res) => {
  const [newX, newY] = colors.rgbToXY(req.body.r, req.body.g, req.body.b);
  const newXY = hue.changeLight(req.params.id, { xy: [newX, newY] });
  if (newXY) {
    res.json({ hex: colors.xyToRgb([...newXY]) });
  } else {
    res.send(null);
  }
});

app.post('/light/:id/brightness', async (req, res) => {
  await hue.changeLight(req.params.id, { bri: Number(req.body.bri) });
  res.json(null);
});

// server start
app.listen(4567, () => {
  hue.findBridge();
  console.log('Started server on port 4567 ...');
});
