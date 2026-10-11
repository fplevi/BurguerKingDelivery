// Situações fixas of the Checkout (spec .scratch/checkout/spec.md, also in the README): no real SMS, WhatsApp,
// geocoding, gateway or Pix, so each outcome comes from a known input.

/** The only valid Código de confirmação, for any celular and channel; any other 6 digits is Código incorreto. */
export const validCode = '123456';

/**
 * Endereços salvos of the Clientes cadastrados, in the order shown (the first one starts marked). Each one: `id`,
 * `label` (Casa, Trabalho or Favoritos), `street` (with the number), `district`, `city`, `complement` and `reference`
 * ('' when there is none). Every one of them is served: Taxa de entrega and estimate below.
 */
export const savedAddresses = [
  { id: 'casa', label: 'Casa', street: 'Av. Paulista, 1578', district: 'Bela Vista', city: 'São Paulo — SP', complement: 'Apto. 21', reference: 'Portaria principal' },
  { id: 'trabalho', label: 'Trabalho', street: 'Rua Augusta, 1508', district: 'Consolação', city: 'São Paulo — SP', complement: '8º andar', reference: 'Recepção' },
];

/** Any served address: Taxa de entrega (in centavos) and Entrega estimada. */
export const deliveryFee = 890;
export const deliveryTime = '30–45 min';

/**
 * Places of the Busca and of "Usar localização atual" (the map's tiles cover only the Av. Paulista, 1578; every place
 * shows them): `id`, `name` (the result's title), `street` and `number` (the Dados de entrega's Rua and Número),
 * `district`, `city`, `poi` (a named place: its result also shows the street and number) and `served` (false: Fora da
 * região de entrega).
 */
const paulista = { id: 'paulista-1578', name: 'Avenida Paulista, 1578', street: 'Av. Paulista', number: '1578', district: 'Bela Vista', city: 'São Paulo — SP', served: true };
export const places = [
  { ...paulista, id: 'masp', name: 'MASP — Museu de Arte de São Paulo', poi: true },
  paulista,
  { ...paulista, id: 'paulista-1000', name: 'Avenida Paulista, 1000', number: '1000' },
  { id: 'augusta-1508', name: 'Rua Augusta, 1508', street: 'Rua Augusta', number: '1508', district: 'Consolação', city: 'São Paulo — SP', served: true },
  { id: 'campo-120', name: 'Estrada do Campo, 120', street: 'Estrada do Campo', number: '120', district: 'Área rural', city: 'São Paulo — SP', served: false },
];
/** The Busca: what it contains (lower case, no accents) picks the results; nothing matching, Busca sem resultados. */
const searches = [
  ['paulista', ['masp', 'paulista-1578', 'paulista-1000']],
  ['augusta', ['augusta-1508']],
  ['estrada do campo', ['campo-120']],
];
const plain = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const searchPlaces = (query) => searches.filter(([k]) => plain(query).includes(k)).flatMap(([, ids]) => ids.map((id) => places.find((p) => p.id === id)));
/** "Usar localização atual" with the permission granted (whatever the coordinates), and "Buscar pelo mapa": the map's centre. */
export const locatedPlace = paulista;

/** Same profile for both celulares: Mariana Silva, with Casa and Trabalho. */
const mariana = { name: 'Mariana Silva', addresses: savedAddresses };

/**
 * Clientes cadastrados by celular (11 digits): (61) 99999-1234 has the Pix approved 10 s after it is generated;
 * (61) 90000-0000 never has it approved (it expires). Any other celular is a Novo cliente (no addresses).
 */
export const customers = {
  '61999991234': { ...mariana, pixApproved: true },
  '61900000000': { ...mariana, pixApproved: false },
};
