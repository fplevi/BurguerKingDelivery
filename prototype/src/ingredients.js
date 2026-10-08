// Whopper layers (Brazilian recipe), bottom to top.
// y: closed position in the hero (px); z: stacking order; locked: part of the Base.
export const ingredients = [
  { id: 'bottom', name: 'Pão inferior', y: 242, z: 1, locked: true },
  { id: 'meat', name: 'Carne grelhada', y: 205, z: 2, locked: true },
  { id: 'cheese', name: 'Queijo', y: 179, z: 3 },
  { id: 'pickles', name: 'Picles', y: 160, z: 4 },
  { id: 'ketchup', name: 'Ketchup', y: 148, z: 5 },
  { id: 'onion', name: 'Cebola', y: 136, z: 6 },
  { id: 'tomato', name: 'Tomate', y: 114, z: 7 },
  { id: 'lettuce', name: 'Alface', y: 86, z: 8 },
  { id: 'mayo', name: 'Maionese', y: 62, z: 9 },
  { id: 'top', name: 'Pão superior', y: 21, z: 10, locked: true },
];
export const name = (id) => ingredients.find((i) => i.id === id).name;
