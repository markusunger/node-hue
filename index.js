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
  if (light) {
    hue.setLightOnOff(req.params.id, !light.state.on);
    res.json({});
  }
  res.json({});
});

app.post('/light/:id/change', async (req, res) => {
  const [newX, newY] = colors.rgbToXY(req.body.r, req.body.g, req.body.b);
  console.log(`Receiving post request to change light ${req.params.id} to ${newX},${newY}`);
  const newXY = hue.changeLight(req.params.id, { xy: [newX, newY] });
  res.json({ hex: colors.xyToRgb([...newXY]) });
});

// server start
app.listen(4567, () => {
  hue.findBridge();
  console.log('Started server on port 4567 ...');
});
