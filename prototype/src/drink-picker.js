/** Invisible intrinsic sizing keeps every option and the placeholder within the same compact width. */
export const drinkPickerSizing = (drinks) => `<span class="picker-size" aria-hidden="true">${['Selecione uma bebida', ...drinks].map(label => `<span>${label}</span>`).join('')}</span>`;

/** Cardápio combobox, using the same overlay and keyboard controls as the Carrinho. */
export function createDrinkPicker(button, list, drinks, onChoose) {
  let value = '', active = null;
  button.insertAdjacentHTML('beforebegin', drinkPickerSizing(drinks));
  list.innerHTML = drinks.map((drink, index) => `<li role="option" id="drink-option-${index}" data-option="${index}" aria-selected="false">${drink}</li>`).join('');

  function show(index) {
    active = index;
    list.hidden = index === null;
    button.setAttribute('aria-expanded', String(index !== null));
    if (index === null) button.removeAttribute('aria-activedescendant');
    else button.setAttribute('aria-activedescendant', `drink-option-${index}`);
    [...list.children].forEach((option, i) => option.classList.toggle('active', i === index));
    if (index !== null) list.children[index].scrollIntoView({ block: 'nearest' });
  }
  const open = () => show(Math.max(0, drinks.indexOf(value)));
  function choose(index) {
    show(null);
    onChoose(drinks[index]);
    button.focus();
  }
  button.onclick = () => active === null ? open() : show(null);
  button.onkeydown = (event) => {
    const { key } = event;
    if (active === null) {
      if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) return;
      event.preventDefault();
      return open();
    }
    const moves = { ArrowDown: Math.min(drinks.length - 1, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: drinks.length - 1 };
    if (key in moves) show(moves[key]);
    else if (key === 'Enter' || key === ' ') choose(active);
    else if (key === 'Escape') show(null);
    else if (key === 'Tab') return show(null);
    else return;
    event.preventDefault();
  };
  button.onkeyup = (event) => { if (event.key === ' ') event.preventDefault(); };
  list.onmousedown = (event) => event.preventDefault();
  list.onclick = (event) => {
    const option = event.target.closest('[data-option]');
    if (option) choose(Number(option.dataset.option));
  };
  document.addEventListener('pointerdown', (event) => {
    if (active !== null && !button.parentElement.contains(event.target)) show(null);
  });
  document.addEventListener('focusin', (event) => {
    if (active !== null && !button.parentElement.contains(event.target)) show(null);
  });
  return {
    update({ drink, combo, visible }) {
      if (!combo || !visible || drink !== value) show(null);
      value = drink;
      button.disabled = !combo;
      button.textContent = drink || 'Selecione uma bebida';
      [...list.children].forEach((option, i) => option.setAttribute('aria-selected', String(drinks[i] === drink)));
    },
  };
}
