// Acompanhamentos, Bebidas and Sobremesas: photo-only products (no Receita, no 3D), names and grid
// order from the Figma (40-509, 49-1104, 127-2594). Nothing outside this file names one of them.
//
// Product: id (unique across the categories and the Receitas), name (grid and cart), title (hero;
// "\n" breaks the line, otherwise after the first word), text (hero description), price (cents,
// illustrative: the Figma's, or searched on delivery menus; see the ticket 04 answer), photo
// and box, the photo's drawn area in the 800 × 800 file (the transparent margins are cut off,
// as in the Figma).
import pepperoni from '../Assets/sides/official/site_pepperoni_balls.png';
import batata from '../Assets/sides/official/site_Batata_Media.png';
import balde from '../Assets/sides/official/site_Balde_Batata.png';
import onion from '../Assets/sides/official/site_Onion_Rings.png';
import chicken from '../Assets/sides/official/site_BK_Chicken.png';
import baconese from '../Assets/sides/official/site_molhao_baconese.png';
import crispy from '../Assets/sides/official/site_molhao_cebola_crispy.png';
import citrico from '../Assets/sides/official/site_molhao_citrico.png';
import coca from '../Assets/drinks/official/site_Coca.png';
import cocaZero from '../Assets/drinks/official/site_Coca_zero.png';
import laranja from '../Assets/drinks/official/site_Suco_Laranja.png';
import uva from '../Assets/drinks/official/site_Suco_Uva.png';
import sprite from '../Assets/drinks/official/site_Sprite.png';
import fanta from '../Assets/drinks/official/site_Fanta_Laranja_2026-05-13-133315_xdeb.png';
import agua from '../Assets/drinks/official/site_Agua.png';
import nutellaBrownie from '../Assets/desserts/official/site_BK_Mix_Nutella_Brownie.png';
import leitePo from '../Assets/desserts/official/site_BK_Mix_LeitePo_Nutella.png';
import cookies from '../Assets/desserts/official/site_BK_Mix_Nutella_Cookies.png';
import biscoff from '../Assets/desserts/official/site_BK_Mix_Biscoff_2026-07-08-194931_pixn.png';
import brownie from '../Assets/desserts/official/site_BK_Mix_Brownie.png';
import ovomaltine from '../Assets/desserts/official/site_BK_Mix_Ovomaltine.png';
import sundaeChocolate from '../Assets/desserts/official/site_Sundae_Chocolate.png';
import sundaeDoceLeite from '../Assets/desserts/official/site_Sundae_DocedeLeite.png';

const p = (id, name, price, photo, box, text, title = name) => ({ id, name, title, text, price, photo, box });

/** Each category: the grid heading, the product chosen on load and its products in the Figma's order. */
export const categories = {
  acompanhamentos: {
    heading: 'Escolha seu acompanhamento',
    initial: 'batataFrita',
    products: [
      p('esferasPepperoni', 'Esferas do Dragão de Pepperoni', 1990, pepperoni, [24, 114, 800, 649], 'Bolinhas crocantes recheadas com queijo e pepperoni.'),
      p('batataFrita', 'Batata Frita', 990, batata, [268, 221, 524, 616], 'Batatas douradas e crocantes para acompanhar.'),
      p('baldeBatata', 'Balde de Batata', 2490, balde, [97, 178, 561, 618], 'Batatas douradas e crocantes no balde, para dividir.'),
      p('onionRings', 'Onion Rings', 1590, onion, [299, 242, 500, 615], 'Anéis de cebola empanados e crocantes.'),
      p('bkChicken', 'BK Chicken', 1090, chicken, [93, 354, 670, 614], 'Pedaços de frango empanados e crocantes.'),
      p('molhaoBaconese', 'Molhão Baconese', 490, baconese, [200, 302, 563, 700], 'Molho cremoso de bacon para mergulhar as batatas.'),
      p('cebolaCrispy', 'Cebola Crispy', 490, crispy, [201, 302, 562, 613], 'Cebola frita e crocante para acompanhar.'),
      p('molhaoCitrico', 'Molhão Maionese Cítrica', 490, citrico, [200, 302, 561, 625], 'Maionese com toque cítrico para mergulhar as batatas.'),
    ],
  },
  bebidas: {
    heading: 'Escolha sua bebida',
    initial: 'cocaCola',
    products: [
      p('cocaCola', 'Coca-Cola', 990, coca, [305, 255, 496, 614], 'O sabor clássico, gelado e na lata. Perfeito para acompanhar seu pedido.', 'Coca-Cola Original'),
      p('cocaColaZero', 'Coca-Cola Zero', 990, cocaZero, [306, 256, 495, 614], 'O sabor da Coca-Cola sem açúcar, gelado e na lata.'),
      p('naturalOneLaranja', 'Natural One Laranja', 1290, laranja, [321, 149, 476, 617], 'Suco de laranja 100% da fruta, gelado e na garrafa.', 'Natural One\nLaranja'),
      p('naturalOneUva', 'Natural One Uva', 1290, uva, [319, 149, 484, 671], 'Suco de uva 100% da fruta, gelado e na garrafa.', 'Natural One\nUva'),
      p('sprite', 'Sprite', 990, sprite, [308, 260, 495, 646], 'Refrigerante de limão, gelado e na lata.'),
      p('fantaLaranja', 'Fanta Laranja', 990, fanta, [306, 255, 495, 619], 'Refrigerante de laranja, gelado e na lata.'),
      p('aguaDeCopo', 'Água de Copo', 590, agua, [293, 258, 509, 614], 'Água mineral sem gás, gelada e no copo.', 'Água\nde Copo'),
    ],
  },
  sobremesas: {
    heading: 'Escolha sua sobremesa',
    initial: 'bkMixBrownie',
    products: [
      p('bkMixNutellaBrownie', 'BK® Mix Nutella® com Brownie', 2790, nutellaBrownie, [224, 179, 733, 622], 'Sorvete de baunilha com Nutella® e pedaços de brownie.', 'BK® Mix Nutella®\ncom Brownie'),
      p('bkMixLeitePoNutella', 'BK® Mix Leite em Pó com Nutella®', 2790, leitePo, [229, 193, 570, 700], 'Sorvete de baunilha com leite em pó e Nutella®.', 'BK® Mix Leite em Pó\ncom Nutella®'),
      p('bkMixCookiesNutella', 'BK® Mix Cookies com Nutella®', 2790, cookies, [224, 180, 735, 750], 'Sorvete de baunilha com cookies e Nutella®.', 'BK® Mix Cookies\ncom Nutella®'),
      p('bkMixBiscoff', 'BK® Mix Biscoff®', 2590, biscoff, [214, 169, 538, 727], 'Sorvete de baunilha com biscoito e creme Biscoff®.', 'BK® Mix\nBiscoff®'),
      p('bkMixBrownie', 'BK® Mix de Brownie', 2390, brownie, [230, 149, 568, 717], 'BK® Mix de Brownie para completar seu pedido.', 'BK® Mix\nde Brownie'),
      p('bkMixCrocante', 'BK® Mix Crocante', 2390, ovomaltine, [228, 189, 572, 625], 'Sorvete de baunilha com flocos crocantes.', 'BK® Mix\nCrocante'),
      p('sundaeChocolate', 'Sundae de Chocolate', 1290, sundaeChocolate, [253, 211, 525, 651], 'Sorvete de baunilha com calda de chocolate.', 'Sundae de\nChocolate'),
      p('sundaeDoceLeite', 'Sundae de Doce de Leite', 1290, sundaeDoceLeite, [254, 210, 523, 619], 'Sorvete de baunilha com calda de doce de leite.', 'Sundae de\nDoce de Leite'),
    ],
  },
};

/** Any photo-only product, by id. */
export const products = Object.fromEntries(Object.values(categories).flatMap((c) => c.products.map((x) => [x.id, x])));
