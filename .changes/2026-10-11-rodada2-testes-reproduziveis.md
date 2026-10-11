---
impacto: nada_mudou
secao: corrigido
titulo: O clone limpo volta a rodar as cercas de projecao e de caminhos, e o example vira reproduzivel
---

Cinco frentes sem efeito para quem opera uma VPS:

- a cerca da projecao volta a rodar, agora sobre uma amostra histórica desidratada e versionada em `tests/fixtures/agent-projection/` — o material privado segue fora da distribuição;
- quatro varreduras que comparavam caminho relativo em `/` passam a normalizar o separador no Windows, sem afrouxar nenhuma regra nem allowlist;
- `ORIGIN.md` ganha a única ocorrência sancionada do termo histórico (a URL canônica do upstream); a guarda continua reprovando texto nu, URLs estendidas, outros arquivos e nomes de arquivo;
- o example do demo passa a versionar seu `package-lock.json` (`npm ci` reproduzível em clone limpo); o projeto raiz segue com pnpm e os overrides de segurança intactos;
- `.codex`/`.cursor` voltam a ignorar configuração local, com allowlist por arquivo apenas para as duas portas revisadas (`hooks.json` e a regra do Cursor).
