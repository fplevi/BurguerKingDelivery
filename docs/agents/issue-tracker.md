# Issue tracker: Markdown local

- Cada funcionalidade usa `.scratch/<feature-slug>/`.
- A especificação fica em `spec.md`.
- Cada ticket fica em `issues/<NN>-<slug>.md`, numerado a partir de `01`.
- A triagem usa uma linha `Status:` próxima ao início, conforme `triage-labels.md`.
- Comentários são acrescentados ao final, sob `## Comments`.

Publicar significa criar o arquivo correspondente, incluindo os diretórios necessários.
Consultar um ticket significa ler o arquivo indicado; quando houver apenas um número,
localize-o no diretório da funcionalidade.

## Wayfinder

- Mapa: `.scratch/<effort>/map.md`, com Notes, Decisions-so-far e Fog.
- Tickets: `.scratch/<effort>/issues/<NN>-<slug>.md`.
- `Type:` identifica research, prototype, grilling ou task.
- `Blocked by: NN, NN` registra dependências.
- Escolha o ticket de menor número ainda aberto, sem responsável e com todas
  as dependências em `Status: resolved`.
- Antes de trabalhar, salve `Status: claimed`.
- Ao concluir, acrescente `## Answer`, salve `Status: resolved` e registre
  um resumo com link em Decisions-so-far no mapa.
