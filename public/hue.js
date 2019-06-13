/* eslint-disable no-param-reassign */
/* global document fetch */

const buttons = Array.from(document.getElementsByClassName('onoff-button'));
const colors = Array.from(document.getElementsByClassName('light-color'));

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    fetch(`/light/${button.dataset.id}`)
      .then(res => res.json())
      .then(() => {
        if (button.classList.contains('on')) {
          button.classList.remove('on');
          button.classList.add('off');
        } else {
          button.classList.remove('off');
          button.classList.add('on');
        }
      });
  });
});

colors.forEach((color) => {
  const dataColor = color.dataset.color;
  color.style.backgroundColor = dataColor;
});
