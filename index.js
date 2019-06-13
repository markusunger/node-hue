const express = require('express');
const hue = require('./src/hue');
const colors = require('./src/color');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

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
      xyToHex: colors.xyToHex,
      HexToXY: colors.HexToXY,
    });
  } else {
    res.render('error', {
      message: 'That\'s not a valid light',
    });
  }
});

// API routes
app.get('/light/:id', async (req, res) => {
  const light = await hue.getLight(req.params.id);
  if (light) {
    hue.setLightOnOff(req.params.id, !light.state.on);
    res.json({});
  }
  res.json({});
});

app.listen(4567, () => {
  hue.findBridge();
  console.log('Started server on port 4567 ...');
});
