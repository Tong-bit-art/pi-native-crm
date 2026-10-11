---
impacto: nada_mudou
secao: corrigido
titulo: O check de arquitetura do runtime roda no Windows, e a porta de entrada do repositório fica explícita
---

Duas frentes sem efeito para quem opera uma VPS:

- A varredura de arquitetura do runtime nos testes comparava caminhos relativos com barra (`/`) enquanto o Windows devolvia `\`; o scanner passa a normalizar na fronteira e as mesmas regras de diretório valem em qualquer SO. Nenhuma regra foi afrouxada — o controle negativo continua reprovando um import de Pi fora do adaptador.
- O README passa a mostrar três caminhos de entrada (preview estático sem chave, backend local real e self-host de produção com status ainda em construção), ganha versão em inglês e um ORIGIN.md que separa o herdado do que este branch mudou. Os links de código do demo de exemplo apontam para o código importado deste branch; os commits históricos do projeto original ficam apenas registrados e rotulados.
