# Amostras de projeção do Conversador (extração desidratada)

Estes dois arquivos JSON são uma extração **mínima e desidentificada** de turnos
reais de LLM medidos em 2026-08-05 (modelo `gpt-5.6-terra`) durante a medição de
vazamento do projeto original (`ia-360-w4`). Eles alimentam
`tests/unit/projecao-conversador.test.ts`.

- **Origem (histórica):** turnos `operador__7-automacoes-e-falhas` e
  `operador__9-quem-pode-mexer` da medição de 2026-08-05 do projeto original.
- **Mantido:** apenas os `result` de ferramenta que as asserções medem, na mesma
  forma (`tool_calls[].tool_calls[].result`) — incluindo o erro cru
  `unsafe_url:https_required` e identificadores com forma de UUID, que são o
  **controle positivo** de cada caso (a entrada que a projeção precisa filtrar).
- **Removido/alterado:** `final_text`, mensagens, expectativas, tokens, latência,
  modelo/versão e demais metadados de execução; nomes de automação
  neutralizados; **todos os UUIDs substituídos por valores fictícios fixos**
  (`f0000000-0000-4000-8000-...`).
- **O que isto NÃO é:** não é uma nova medição deste branch. Nenhum modelo foi
  chamado para produzir estes arquivos, e eles não provam comportamento de
  produção — provam que a projeção filtra a forma de dado que vazou.
- **Se um arquivo faltar**, o teste FALHA em vez de se auto-desligar (a
  mensagem aponta o caminho ausente).
