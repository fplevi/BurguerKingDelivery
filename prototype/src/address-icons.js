import search from '../Assets/icons/address-search.svg?raw';
import navigation from '../Assets/icons/address-navigation.svg?raw';
import history from '../Assets/icons/address-history.svg?raw';
import dots from '../Assets/icons/address-dots.svg?raw';
import briefcase from '../Assets/icons/address-briefcase.svg?raw';
import star from '../Assets/icons/address-star.svg?raw';
import trash from '../Assets/icons/address-trash.svg?raw';
import house from '../Assets/icons/address-house.svg?raw';
import pin from '../Assets/icons/address-pin.svg?raw';
import check from '../Assets/icons/address-check.svg?raw';

const icons = { search, navigation, history, dots, briefcase, star, trash, house, pin, check };
// Original component viewBoxes and paths; size and color belong to the instance.
export const addressIcon = (name, size = 24) => icons[name]
  .replace('<svg ', `<svg class="icon" aria-hidden="true" `)
  .replace('width="32" height="32"', `width="${size}" height="${size}"`)
  .replaceAll('fill="black"', 'fill="currentColor"');
