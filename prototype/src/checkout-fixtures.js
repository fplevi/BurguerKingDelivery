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

/**
 * Endereços de pedidos anteriores of the Clientes cadastrados (Figma Endereço 05), most recent first: the fields of an
 * Endereço salvo but `label`, and `lastOrder`, the day of the last Pedido there. All served.
 */
export const previousAddresses = [
  { id: 'anterior-pinheiros', street: 'Rua dos Pinheiros, 870', district: 'Pinheiros', city: 'São Paulo — SP', complement: 'Casa', reference: 'Portão verde', lastOrder: '5 de outubro' },
  { id: 'anterior-santos', street: 'Alameda Santos, 960', district: 'Jardim Paulista', city: 'São Paulo — SP', complement: 'Bloco B', reference: 'Apto. 42', lastOrder: '28 de setembro' },
  { id: 'anterior-oscar-freire', street: 'Rua Oscar Freire, 1200', district: 'Jardim Paulista', city: 'São Paulo — SP', complement: '', reference: 'Recepção do edifício', lastOrder: '12 de setembro' },
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
const plain = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const searchPlaces = (query) => searches.filter(([k]) => plain(query).includes(k)).flatMap(([, ids]) => ids.map((id) => places.find((p) => p.id === id)));
/** "Usar localização atual" with the permission granted (whatever the coordinates), and "Buscar pelo mapa": the map's centre. */
export const locatedPlace = paulista;

/**
 * Cartões salvos of the Clientes cadastrados: `id`, `brand`, `last4`, `holder` and `expiry` (MM/AA). Paying with one
 * asks for its código de segurança: `declinedCvv` is recusado, any other 3 digits aprovado.
 */
export const savedCards = [{ id: 'visa-4242', brand: 'Visa', last4: '4242', holder: 'Mariana Silva', expiry: '08/29' }];
export const declinedCvv = '000';

/**
 * Novo cartão by number (16 digits): aprovado or recusado. Any other number is "Número de cartão inválido", without
 * reaching the processing. The brand comes from the first digit (`cardBrand`).
 */
export const cardNumbers = { '4242424242424242': true, '5555555555554444': true, '4000000000000002': false };
export const cardBrand = (number) => ({ 4: 'Visa', 5: 'Mastercard' })[String(number)[0]] ?? '';

/** The card payment's processing (Figma cardProcessing), in ms. */
export const processingTime = 1500;

/** Identifier of the first Pedido confirmado of the session; the next ones follow in sequence. */
export const firstOrder = 1024;

/** Same profile for both celulares: Mariana Silva, with Casa and Trabalho, the Endereços de pedidos anteriores and the Visa •••• 4242. */
const mariana = { name: 'Mariana Silva', addresses: savedAddresses, previous: previousAddresses, cards: savedCards };

/**
 * Clientes cadastrados by celular (11 digits): (61) 99999-1234 has the Pix approved 10 s after it is generated;
 * (61) 90000-0000 never has it approved (it expires). Any other celular is a Novo cliente (no addresses).
 */
export const customers = {
  '61999991234': { ...mariana, pixApproved: true },
  '61900000000': { ...mariana, pixApproved: false },
};
