# 09: Layouts do Checkout no celular

**What to build:** os layouts abaixo de 1024px pelo Figma mobile (`239-8996`):
- Uma coluna com rolagem vertical e o Resumo do pedido abaixo do conteúdo.
- Nas telas de seleção e preenchimento do pagamento, Total do pedido e a ação de pagamento ficam fixos no rodapé ("Checkout / ação fixa"); no fluxo de endereço, a ação principal fica fixa ("Entrega / ação fixa"). Nos dois casos, o fim do conteúdo não fica escondido atrás do rodapé.
- No cartão de endereço, complemento e referência ficam em linhas separadas, com o divisor antes da previsão.
- Preços em `#502314`, fontes do BK, botões secundários com contorno e indicador de etapas na variante Mobile.

Capturas de revisão em 390 e 1280 em `.scratch/checkout/capturas/`. Spec: `.scratch/checkout/spec.md` (Memória e layouts).

**Blocked by:** 05, 08

**Status:** ready-for-agent

- [ ] Uma coluna e Resumo do pedido abaixo
- [ ] Rodapé fixo no pagamento e no endereço, sem esconder conteúdo
- [ ] Cartão de endereço com linhas separadas
- [ ] Sem rolagem horizontal em 390
- [ ] Testes de layout em 390 e 1280
- [ ] Capturas para revisão humana
