/* global document fetch */

const buttons = Array.from(document.getElementsByClassName('onoff-button'));

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
