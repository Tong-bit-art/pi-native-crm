---
impacto: nada_mudou
secao: corrigido
titulo: As cercas de teste ficam determinísticas — URL canônica com fronteira completa, .env de teste sem comentário-virando-valor e data com locale fixado
---

Três correções de base de teste, sem efeito para quem opera uma VPS:

- a exceção de URL canônica do `ORIGIN.md` passa a exigir o token completo (fronteira esquerda e direita) e vira matriz permanente de casos — endereço estendido ou embutido em outro continua reprovando;
- o parser de `.env` dos testes entende comentários de fim de linha (e o modo de falha medido de `CHAVE=` com espaços), e o teste do adapter isola a variável de ambiente que mede, com os casos de prioridade fixados;
- a cerca da tela de dias bloqueados fixa o locale do próprio teste, mantendo intactas as asserções de negócio da data.
