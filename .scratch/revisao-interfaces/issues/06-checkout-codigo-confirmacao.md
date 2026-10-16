# 06: Checkout e Código de confirmação no padrão revisado

Status: resolved
Type: task
Blocked by: 01, 04

**What to build:** Identificação e Pagamento do Checkout usam a apresentação revisada, mantendo a etapa Endereço já padronizada pelo ticket 04.

- [x] Revisar todas as etapas e estados implementados, Resumo do pedido, indicadores de progresso e ações fixas, usando tokens, fontes e ícones do Figma.
- [x] Retirar fechar de Identifique-se e padronizar Voltar sem alterar os destinos de navegação.
- [x] Implementar o padrão reutilizável do Código de confirmação: Alterar celular abaixo da mensagem e confirmar/SMS/reenviar empilhados, preservando erros, reenvios, canais e disponibilidade das ações.
- [x] Usar os toasts previstos e preservar Pix, cartão, totais, erros de validação e regras do pedido.
- [x] Demonstrar o percurso de Identificação até a conclusão, com conferência visual web/mobile e regressões relevantes.


## Answer

Implementado nos commits `f87c12d`, `06c5d04` e `fc94916`. [Matriz/evidências](../matriz.md#ticket-06--checkout-e-código-de-confirmação) e [revisão em dois eixos](../revisao-06.md).

- Identificação, Pagamento, Resumo do pedido, indicadores e conclusão usam tokens e fontes BK. Voltar com a seta original e destinos preservados; Identifique-se sem Fechar.
- Código de confirmação reutilizável nos fluxos de Checkout/Identifique-se/novo celular de Minha conta: Alterar celular sob a mensagem, confirmar/canal/reenviar em coluna. Erros, canais, reenvio e disponibilidade preservados.
- Toasts existentes mantidos; posição acima da barra mobile. Pix, cartão, totais, personalizações e regras do pedido sem alteração.
- Evidência final contra o build isolado: **220 combinações** (20 estados × 11 larguras de 320 a 1921 px), **100 capturas**, sem overflow, paddings/gaps fora da escala ou imagens quebradas. Fontes locais usadas carregadas; título de Identifique-se corrigido para Flame Bold na conferência final.
- TDD na fronteira de interface confirmada: teste novo falhou nos dois dispositivos antes da implementação e passou depois. Regressões focadas: **107 aprovados, 7 ignorados por dispositivo**. Build Vite, sintaxe JS e diff check aprovados. Projeto JavaScript sem script de typecheck.
- Revisão paralela: **Standards 0, Spec 0 achados pendentes**. Achado inicial de cobertura parcial dos tokens na conclusão/Identifique-se corrigido e reavaliado, incluindo o incremento final de fonte/coletor.
- Suíte ampla interrompida durante o início para incorporar as correções da revisão e da conferência tipográfica. Essas rodadas não contam como aprovação; execução final em snapshot exato de `fc94916`, porta e artefatos próprios, sem alterações de aplicação posteriores.

**Suíte completa isolada de `fc94916`: 670 aprovados, 39 ignorados, 1 falha (17,1 min).** A falha é em `entrada-e-saida.spec.js:71`, chegada do pão inferior e carne no mesmo timestamp de amostragem (`2849,9 ms`, quando o teste exige anterioridade estrita). O caso passou **3/3 vezes isoladamente**, com um worker. Isso não torna a suíte completa verde nem comprova a causa. Nenhum arquivo do renderizador ou teste 3D foi alterado neste ticket. Todos os testes do fluxo revisado passaram. [Resultado estruturado](../evidencias/checkout/validacao.json). Concluído em 15/10/2026.
