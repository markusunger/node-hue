/* global document fetch */

const heading = document.getElementById('light-heading');
const lightID = heading.dataset.id;
const redRange = document.getElementById('color-red');
const greenRange = document.getElementById('color-green');
const blueRange = document.getElementById('color-blue');
const briRange = document.getElementById('brightness');
const lightColor = document.getElementById('light-color');
const onOffButton = document.getElementById('onoff-button');

function updateColor(r, g, b) {
  const fetchBody = {
    r,
    g,
    b,
  };

  fetch(`/light/${lightID}/color`, {
    method: 'POST',
    body: JSON.stringify(fetchBody),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then((response) => {
      if (response) {
        return response.hex;
      }
      return undefined;
    });
}

function updateBrightness(bri) {
  fetch(`/light/${lightID}/brightness`, {
    method: 'POST',
    body: JSON.stringify({ bri }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const ranges = Array.from(document.getElementsByClassName('color-range'));
ranges.forEach((range) => {
  range.addEventListener('change', function change() {
    this.setAttribute('value', this.value);
    const r = redRange.value;
    const g = greenRange.value;
    const b = blueRange.value;
    const newHexColor = updateColor(lightID, r, g, b);
    lightColor.style.backgroundColor = newHexColor;
  });
});

briRange.addEventListener('change', function change() {
  this.setAttribute('value', this.value);
  updateBrightness(this.value);
});

onOffButton.addEventListener('click', () => {
  fetch(`/light/${lightID}`)
    .then(res => res.text())
    .then(() => {
      if (onOffButton.classList.contains('on')) {
        onOffButton.classList.remove('on');
        onOffButton.classList.add('off');
      } else {
        onOffButton.classList.remove('off');
        onOffButton.classList.add('on');
      }
    });
});
