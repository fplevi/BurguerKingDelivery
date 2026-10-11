// Situações fixas of the Checkout (spec .scratch/checkout/spec.md, also in the README): no real SMS, WhatsApp,
// geocoding, gateway or Pix, so each outcome comes from a known input.

/** The only valid Código de confirmação, for any celular and channel; any other 6 digits is Código incorreto. */
export const validCode = '123456';

/** Same profile for both celulares: Mariana Silva. */
const mariana = { name: 'Mariana Silva' };

/**
 * Clientes cadastrados by celular (11 digits): (61) 99999-1234 has the Pix approved 10 s after it is generated;
 * (61) 90000-0000 never has it approved (it expires). Any other celular is a Novo cliente.
 */
export const customers = {
  '61999991234': { ...mariana, pixApproved: true },
  '61900000000': { ...mariana, pixApproved: false },
};
