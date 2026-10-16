// Receita of each product: its Camadas from bottom to top, which form the Base (locked),
// and the texts and price the page shows for it. Nothing outside this file names a product.
//
// Camada: id (unique within the Receita), name, model (3D model in layerModels and SVG
// illustration; defaults to the id, so a repeated ingredient shares one), locked (Base),
// text (its part of the description; a repeated text is said once, none says nothing),
// turn (radians about the vertical axis, so a repeated model doesn't look identical).
// Assembled burger only (opened, every Camada is square in the middle): offset, [x, z] off the
// middle (the patty's radius is ~1); lean, { on, angle }: it rests on Camada `on`, which has an
// offset, and tips over by `angle` (radians) toward the side with nothing under it.
// SVG fallback only: y, closed top in the hero (px); thickness, how much it raises the
// Camada above it when assembled (px).
const recipe = ({ layers, ...product }) => ({
  ...product,
  layers: layers.map((layer, index) => ({ model: layer.id, locked: false, z: index + 1, ...layer })),
});

export const recipes = {
  whopper: recipe({
    id: 'whopper',
    name: 'Whopper®',
    price: 3190,
    // Brazilian recipe.
    layers: [
      { id: 'bottom', name: 'Pão inferior', text: 'Pão com gergelim', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', text: 'carne grelhada', y: 205, thickness: 36, locked: true },
      { id: 'cheese', name: 'Queijo', text: 'queijo derretido', y: 179, thickness: 9 },
      { id: 'pickles', name: 'Picles', text: 'picles', y: 160, thickness: 8 },
      { id: 'ketchup', name: 'Ketchup', text: 'ketchup', y: 148, thickness: 4 },
      { id: 'onion', name: 'Cebola', text: 'cebola', y: 136, thickness: 8 },
      { id: 'tomato', name: 'Tomate', text: 'tomate fresco', y: 114, thickness: 12 },
      { id: 'lettuce', name: 'Alface', text: 'alface crocante', y: 86, thickness: 15 },
      { id: 'mayo', name: 'Maionese', text: 'maionese', y: 62, thickness: 4 },
      { id: 'top', name: 'Pão superior', y: 21, thickness: 62, locked: true },
    ],
  }),
  cheddarDuplo: recipe({
    id: 'cheddarDuplo',
    name: 'Cheddar Duplo',
    // Provisional texts and price (spec): the official menu description was not found.
    price: 3490,
    // As seen in the official photo; Base: buns and both meats.
    layers: [
      { id: 'bottom', name: 'Pão inferior', text: 'Pão com gergelim', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', text: 'duas carnes grelhadas', y: 205, thickness: 36, locked: true },
      { id: 'cheddar1', name: 'Cheddar inferior', text: 'cheddar cremoso', model: 'cheddar', y: 179, thickness: 18 },
      { id: 'meat2', name: 'Carne grelhada', model: 'meat', turn: 1.9, y: 145, thickness: 45, locked: true },
      { id: 'cheddar2', name: 'Cheddar superior', text: 'cheddar cremoso', model: 'cheddar', turn: 1.9, y: 119, thickness: 18 }, // turned with its patty, whose outline it follows
      { id: 'crispyOnion', name: 'Cebola crispy', text: 'cebola crispy', y: 92, thickness: 20 },
      { id: 'top', name: 'Pão superior', y: 21, thickness: 49, locked: true },
    ],
  }),
  stackerDuploBacon: recipe({
    id: 'stackerDuploBacon',
    name: 'Stacker Duplo Bacon',
    price: 3790, // provisional (spec)
    // As seen in the official photo; Base: buns and both meats. The cheddar is the Whopper's
    // slice in cheddar orange, not the Cheddar Duplo's creamy cheddar.
    layers: [
      { id: 'bottom', name: 'Pão inferior', text: 'Pão com gergelim', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', text: 'duas carnes grelhadas', y: 205, thickness: 36, locked: true },
      { id: 'cheddar', name: 'Cheddar', text: 'cheddar fatiado', model: 'cheddarSlice', y: 179, thickness: 9 },
      { id: 'meat2', name: 'Carne grelhada', model: 'meat', turn: 1.9, y: 145, thickness: 40, locked: true },
      { id: 'bacon', name: 'Bacon', text: 'bacon crocante', y: 113, thickness: 24 },
      { id: 'stackerSauce', name: 'Molho Stacker', text: 'molho Stacker', y: 96, thickness: 8 },
      { id: 'top', name: 'Pão superior', y: 21, thickness: 52, locked: true },
    ],
  }),
  rodeioDuplo: recipe({
    id: 'rodeioDuplo',
    name: 'Rodeio Duplo',
    price: 3690, // provisional (spec)
    // As seen in the official photo; Base: buns and both meats. Queijo and Maionese are the
    // Whopper's; the barbecue is a sauce over the upper meat, under the onion rings.
    layers: [
      { id: 'bottom', name: 'Pão inferior', text: 'Pão com gergelim', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', text: 'duas carnes grelhadas', y: 205, thickness: 36, locked: true },
      { id: 'cheese', name: 'Queijo', text: 'queijo derretido', y: 179, thickness: 9 },
      { id: 'meat2', name: 'Carne grelhada', model: 'meat', turn: 1.9, y: 145, thickness: 40, locked: true },
      { id: 'bbqSauce', name: 'Molho barbecue', text: 'molho barbecue', y: 128, thickness: 6 },
      { id: 'onionRings', name: 'Onion rings', text: 'onion rings crocantes', y: 102, thickness: 26 },
      { id: 'mayo', name: 'Maionese', text: 'maionese', y: 82, thickness: 6 },
      { id: 'top', name: 'Pão superior', y: 21, thickness: 56, locked: true },
    ],
  }),
  rodeio: recipe({
    id: 'rodeio',
    name: 'Rodeio',
    price: 2990, // provisional (spec)
    // As seen in the official photo; Base: buns and the meat. Queijo and Maionese are the
    // Whopper's, the barbecue the Rodeio Duplo's; the queijo is on the one meat, under the
    // barbecue, and a single onion ring (singular in the interface) sits near the edge, the top
    // bun resting on it and tipping over toward the other side.
    layers: [
      { id: 'bottom', name: 'Pão inferior', text: 'Pão com gergelim', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', text: 'carne grelhada', y: 205, thickness: 36, locked: true },
      { id: 'cheese', name: 'Queijo', text: 'queijo derretido', y: 179, thickness: 9 },
      { id: 'bbqSauce', name: 'Molho barbecue', text: 'molho barbecue', y: 162, thickness: 6 },
      { id: 'onionRing', name: 'Onion ring', text: 'onion ring crocante', offset: [0.42, 0.2], y: 138, thickness: 22 },
      { id: 'mayo', name: 'Maionese', text: 'maionese', y: 116, thickness: 10 },
      { id: 'top', name: 'Pão superior', lean: { on: 'onionRing', angle: 0.16 }, y: 55, thickness: 56, locked: true },
    ],
  }),
  bigKing: recipe({
    id: 'bigKing',
    name: 'Big King',
    price: 3190, // provisional (spec)
    // As seen in the official photo; Base: the three buns and both meats. The queijo is the
    // Stacker Duplo Bacon's cheddar slice, on the lower meat; the Molho Big King runs over the
    // middle bun's edge and only peeks out under the top bun (review, ticket 02); picles, cebola
    // and alface are the Whopper's, the last two spread wider to spill past the bun as in the photo.
    layers: [
      { id: 'bottom', name: 'Pão inferior', text: 'Pão com gergelim', y: 242, thickness: 0, locked: true },
      { id: 'meat', name: 'Carne grelhada', text: 'duas carnes grelhadas', y: 210, thickness: 32, locked: true },
      { id: 'cheese', name: 'Queijo', text: 'queijo', model: 'cheddarSlice', y: 192, thickness: 8 },
      { id: 'middleBun', name: 'Pão do meio', text: 'pão do meio', y: 170, thickness: 22, locked: true },
      { id: 'sauce1', name: 'Molho Big King inferior', text: 'molho Big King', model: 'bigKingSauce', y: 154, thickness: 6 },
      { id: 'meat2', name: 'Carne grelhada', model: 'meat', turn: 1.9, y: 126, thickness: 30, locked: true },
      { id: 'pickles', name: 'Picles', text: 'picles', y: 108, thickness: 8 },
      { id: 'onion', name: 'Cebola', text: 'cebola', spread: 1.08, y: 94, thickness: 8 },
      { id: 'lettuce', name: 'Alface', text: 'alface', spread: 1.14, y: 74, thickness: 14 },
      { id: 'sauce2', name: 'Molho Big King superior', text: 'molho Big King', model: 'bigKingSauceTop', y: 58, thickness: 4 },
      { id: 'top', name: 'Pão superior', y: 18, thickness: 52, locked: true },
    ],
  }),
};

/** Camada `id` of a Receita. */
export const layer = (recipe, id) => recipe.layers.find((l) => l.id === id);

/** The texts of the Camadas still in the burger, bottom to top: "Pão com gergelim, … e maionese." */
export const description = (recipe, removed = []) =>
  new Intl.ListFormat('pt-BR').format(
    new Set(recipe.layers.filter((l) => l.text && !removed.includes(l.id)).map((l) => l.text)),
  ) + '.';

/**
 * The Ingredientes retirados, bottom to top, in lower case: "Sem picles e cebola"; none, "Todos os ingredientes".
 * The one wording for both the Carrinho's Item and the Ver ingredientes status line.
 */
export const removedLine = (recipe, removed = []) => {
  const names = recipe.layers.filter((l) => removed.includes(l.id)).map((l) => l.name.toLowerCase());
  return names.length ? 'Sem ' + new Intl.ListFormat('pt-BR').format(names) : 'Todos os ingredientes';
};
