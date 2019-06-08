const express = require('express');
const hue = require('./src/hue');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// web interface
app.get('/', async (req, res) => {
  const lights = await hue.getLights();
  res.render('index', {
    lights,
    hslToRgb: hue.hslToRgb,
  });
});

// API routes
app.get('/light/:id', async (req, res) => {
  const light = await hue.getLight(req.params.id);
  console.log(light);
  hue.setLightOnOff(req.params.id, !light.state.on);
  res.json({});
});

app.listen(4567, () => {
  hue.findBridge();
  console.log('Started server on port 4567 ...');
});
