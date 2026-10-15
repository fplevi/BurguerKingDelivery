# Icons do Figma

Fonte: arquivo BK `BElIaiOW5D1qFF8QStnoDo`, Page 1; consulta em 15/10/2026.
Biblioteca **Icons**, variante **Format=Outline, Weight=Bold**. A origem de um pacote npm não foi comprovada. Não substituir por uma biblioteca presumida.

Os SVGs são exports originais, sem redesenho dos paths. Sufixos indicam a caixa da instância usada no Cardápio; `shopping-cart-24` tem a cor da ação primária, enquanto `shopping-cart-32` tem a cor do header. Usar `<img class="bk-icon" width="…" height="…" alt="" aria-hidden="true">` dentro de controles com nome acessível. Manter a caixa de interação independente. Checkbox e select continuam controles nativos, com os exports como background.

| Arquivo | Componente remoto | Key | Uso / caixa |
| --- | --- | --- | --- |
| shopping-cart-32.svg / shopping-cart-24.svg | ShoppingCart `308:14853` | `1bd675425055e190827e4d1140414ae300a6b604` | header 32, adicionar 24 |
| user-16.svg | User `296:17367` | `f7372780f955e5c365972b99c05f9ba2b7b70e32` | conta 16 |
| map-pin-24.svg | MapPin `307:11350` | `b641ad217951cf3e6789ff17d2bb434839f7b6b0` | Endereço de entrega 24 |
| caret-down-16.svg | CaretDown `308:14818` | `5eff189a6333a488f64ec551e1744d1fc63a1803` | Bebida do combo 16 |
| minus-16.svg | Minus `308:15070` | `b7c6410e29b4b0005d1d0ba54be3e3841bb2ed15` | diminuir 16 |
| plus-16.svg | Plus `305:11337` | `ca8c1c17a5f57d938e45630bb801141ed812c226` | aumentar 16 |
| check-24.svg | Check `300:11418`, instância `308:14976` em `25:222` | `16c67e993965c3a46dc398337ef640e87446d926` | Combo 24 |
| sliders-32.svg | Sliders `308:14903` | `cd5f5bb20d3a3cf0288df0dd851581cb3e2b200b` | Ver ingredientes 32 |
| house.svg | House `300:11465` | `56cf73fbf287b7a72c34e976edcec3337db1ace7` | reserva para ticket 07 |
| arrow-left.svg | ArrowLeft `307:11466` | `49f364e9f2711fb8115928da9648cfc346b9a0b3` | reserva para navegação |
| receipt.svg | Receipt `335:12129` | `6163cd232ba141ad743ed5c0d148d6f9c6cd3f71` | reserva para tickets 07/08 |

Os três exports de reserva são vetores com caixa ajustada ao desenho, não à instância. Compor em uma caixa 24/32 conforme a referência e preservar proporção; não esticar os vetores. Não migrados neste ticket.

Os símbolos antigos de `index.html`, `account.js`, `checkout.js` e `tracking.js` têm consumidores nos fluxos pendentes. Remover somente após sua migração. Logo e fotos não são ícones.
`crown-16.svg`: export original da instância Crown `I124:1293;124:1204;308:15117` em `24:183`, consultada em 15/10/2026. Caixa 16 × 16; selo Selecionado dos cards (ticket 02).

`check-16.svg`: export original de Check `290:11156`, componente remoto `300:11418`, key `16c67e993965c3a46dc398337ef640e87446d926`, em `290:11151` (chips de Ver ingredientes), consultado em 15/10/2026. Plus `305:11371` usa o mesmo componente já exportado em `plus-16.svg`; Minus usa `minus-16.svg` para a ação de retirar no hover/foco. Os três SVGs são máscaras CSS de 16 × 16, com a cor herdada do chip em cada estado; os paths originais são preservados.
