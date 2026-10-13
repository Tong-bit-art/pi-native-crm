---
impacto: nada_mudou
secao: corrigido
titulo: O e2e volta a reconhecer a entrada legal /app e o idioma padrão anônimo das páginas de erro
---

Correções de contrato de teste, sem efeito para quem opera uma VPS:

- as specs e helpers e2e deixam de esperar `/app/…` (o regex antigo rejeitava o destino legal `/app` pós-MFA) e passam a usar uma porta estrita — caminho exato mais a mesma origem; login, MFA, RBAC e os demais fluxos seguem medidos como antes;
- as páginas anônimas 404/500/503 medem o idioma padrão da instalação (`zh-CN`) com strings exatas, e o `/403` continua medindo o idioma do navegador, como o código decide.
