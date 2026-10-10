---
name: auto-versionamento
description: Atualiza a versão do projeto e registra as mudanças após implementar funcionalidades, corrigir bugs ou concluir blocos de código.
---

# Auto-Versionamento

Use esta skill ao finalizar uma alteração de código que tenha sido implementada, corrigida ou concluída.

## Regra principal

Sempre atualize automaticamente a versão do projeto após a alteração. Use versionamento progressivo, preservando o padrão já adotado pelo projeto quando existir. Exemplos válidos incluem `1.0 Beta`, `1.1`, `1.5` e `2.0`.

Antes de escolher a versão:

- Procure a versão atual em arquivos de configuração, documentação, arquivo principal e `CHANGELOG.md`.
- Incremente de forma coerente com o impacto: correções pequenas podem usar o próximo incremento menor; funcionalidades relevantes podem avançar o incremento intermediário ou maior; uma mudança estrutural ampla pode iniciar uma nova versão principal.
- Não reescreva nem remova o histórico existente.

## Registro obrigatório

Registre a nova versão em pelo menos um destes locais:

1. No início do arquivo principal trabalhado, usando um comentário compatível com a linguagem; ou
2. Em `CHANGELOG.md`, criando-o quando necessário.

Prefira `CHANGELOG.md` quando a mudança envolver vários arquivos, quando já houver um changelog no projeto ou quando o arquivo principal não comportar comentários de versão. A entrada deve conter a versão e um resumo objetivo das mudanças realizadas.

Se o projeto já tiver um mecanismo oficial de versão (por exemplo, `package.json`, `pyproject.toml` ou equivalente), mantenha esse valor sincronizado com o registro escolhido. Não invente múltiplos formatos de versão nem altere arquivos não relacionados sem necessidade.

Verifique ao final se a versão foi realmente atualizada e se o registro descreve a alteração concluída. Informe no resultado final qual versão foi aplicada e onde ela foi registrada.
