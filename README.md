# BurguerKingDelivery

Protótipo de delivery com cardápio, hambúrgueres 3D, personalização de ingredientes, carrinho e fluxo simulado de checkout.

- [Abrir o site](https://fplevi.github.io/BurguerKingDelivery/)
- [Instalação, comandos e documentação técnica](prototype/README.md)

## Publicação

O GitHub Pages publica o build de `prototype/` pelo workflow [GitHub Pages](.github/workflows/pages.yml). Alterações nessa pasta enviadas à branch `main` disparam uma nova publicação; também é possível executá-la manualmente em Actions.

O workflow usa o caminho fornecido pelo GitHub Pages como `base` do Vite, para carregar scripts, imagens, fontes e Web Workers sob `/BurguerKingDelivery/`. O desenvolvimento local continua na raiz (`/`).

Para reproduzir o build publicado, na pasta `prototype/`:

```sh
npm ci
npm run build -- --base=/BurguerKingDelivery/
npm run preview
```

Abra `http://localhost:4173/BurguerKingDelivery/`.
