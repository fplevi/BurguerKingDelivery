# 05: Revisão humana de pães e carne

**What to build:** o responsável pelo produto avalia se pães e carne "parecem reais" no hero e em Alterar ingredientes, no desktop e no celular, e aprova a direção visual ou lista ajustes. As demais 7 camadas só começam depois desta aprovação, seguindo a mesma luz e acabamento.

**Blocked by:** 04.

**Status:** ready-for-human

- [x] Revisar no navegador e nas capturas do ticket 04
- [x] Registrar decisão em `## Comments`: aprovado, ou lista de ajustes
- [x] Se houver ajustes, aplicá-los em 04 antes de liberar 06 e 07

## Comments

### Rodada 1 (2026-10-08)

Decisão do responsável pelo produto: carne aprovada; ajustar os dois pães antes de liberar 06 e 07.

- Pão superior: casca uniforme e lisa demais, com cara de plástico. Falta variação de tostado nas laterais e um brilho mais fosco.
- Pão inferior: lateral laranja e lisa demais, distante da foto de referência.

Ajustes aplicados em `prototype/src/scene/layer-models.js`:

- Pão superior: tostado irregular em manchas largas (mais fortes nas laterais e no topo), faixa clara junto ao corte, pontilhado fino; cores menos saturadas, puxando para o dourado-marrom; pequenas covinhas na geometria; pincelado reduzido (`clearcoat` 0,55 → 0,3, mais áspero) e relevo da casca mais marcado.
- Pão inferior: base mais escura, lateral dourada com manchas de tostado e parede levemente irregular; quase sem brilho (`clearcoat` 0,25 → 0,1, rugosidade 0,78).
- Correção encontrada na revisão: desde o ticket 09, a cena zerava a rotação própria dos modelos, e o queijo tinha deixado de aparecer em losango. Agora cada camada fica dentro de um grupo próprio, e a cena só mexe nesse grupo.

Capturas atualizadas em `.scratch/hamburguer-3d/capturas/04/` (as anteriores ficam no histórico do Git). Aguardando a rodada 2 da revisão.
