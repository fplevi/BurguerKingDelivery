# 04: Buscar, confirmar no mapa e salvar um novo endereço

**What to build:**
- **Busca** (`#endereco/buscar`, Figma 02/13/14) com as situações fixas: "paulista", "augusta", "estrada do campo" (fora da região, Figma 12, com "Escolher outro endereço" e "Voltar ao cardápio") e sem resultados.
- **"Usar localização atual"** pela permissão real do navegador: negada → Figma 11, com "Tentar localização novamente"; concedida → Av. Paulista, 1578.
- **Confirmar localização** (`#endereco/confirmar`, Figma 03/15) com o mapa dos tiles estáticos de `prototype/Assets/maps/` (entram no Git com um `SOURCES.md`: OpenStreetMap, ODbL), o marcador fixo no centro e o arraste do mapa em "Ajustar localização no mapa".
- **Dados de entrega** (`#endereco/dados`, Figma 04) com as validações e "Como você quer salvar?". "Salvar endereço" volta à lista com o novo endereço marcado e o toast "Endereço salvo" (Figma 10).

Spec: `.scratch/checkout/spec.md` (Endereço, Situações fixas).

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Busca com as quatro situações fixas
- [ ] Fora da região impede seguir
- [ ] Localização negada e concedida
- [ ] Mapa estático com arraste e atribuição do OpenStreetMap
- [ ] Dados de entrega com obrigatórios, "sem número" e "sem complemento"
- [ ] Salvar endereço com o toast e o endereço marcado
- [ ] Testes Playwright (geolocalização pelo contexto do Playwright)
