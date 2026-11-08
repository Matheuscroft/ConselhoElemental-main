# I05 — ícone do app instalado — 0.1.133

06/11/2026. Fábio enviou Mago_app.jpeg e pediu a mesma imagem como ícone do app no celular. Arquivo fornecido: JPEG quadrado 2048×2048. Conversão mecânica em PNGs, sem geração, redesenho, recorte ou mudança de composição. Fonte do usuário mantida intacta; metadados EXIF não copiados para os assets públicos.

## Configuração

- Manifest: ícones reais 192×192 e 512×512, purpose any, URLs com hash da fonte.
- iPhone: apple-touch-icon 180×180 dedicado.
- Favicon: PNG 32×32 dedicado.
- Manifest com query de versão 0.1.133 para evitar cache de HTML antigo; URLs novas para os ícones.
- name/short_name/start_url/scope/display/orientation preservados; não muda identidade de instalação, origem ou persistência.

Corrigidas declarações anteriores que apontavam o mesmo PNG 2048×2048 como se tivesse tamanhos 192 e 512. Não declarar maskable para uma arte integral sem preparação específica de área segura; o sistema operacional aplica seu tratamento nativo. Arquivo antigo public/icon.png preservado para referências antigas, sem usá-lo nos novos links de instalação.

Atualização de 08/11/2026: o endereço continua preservado, o peso não. Servia 2048×2048 com 5,93 MB em cada deploy e para qualquer referência antiga que ainda o buscasse. Como o maior ícone declarado no manifest é 512, nenhum consumidor legítimo daquela URL precisa de 2048: agora é um 512×512 de 0,43 MB, e o master de 2048 foi para `app/arte-fonte/icone/icon-2048.png`, fora do que é publicado. O README de `arte-fonte` traz as alternativas medidas e descartadas, e o comando para regerar.

## Verificações

Quatro PNGs conferidos por Sharp: formato, largura/altura e ausência de EXIF. Manifest refere dimensões reais, root scope e start_url preservados, display standalone. PNG 512 inspecionado visualmente: mesma arte inteira. Um teste de compatibilidade de produtor SQL passou (8,51s); TypeScript, ESLint, build Vite envDir:false (10,50s) e diff-check passaram. Sem suíte completa nova para esta alteração de assets/metadados; resultados de 679 da P04 permanecem históricos.

Produto/manifests/lock/whitelist/changelog 0.1.133. Candidato 20261106192643_account_archive_version_133.sql só local: aceita novo produtor sobre hash do validador anterior, sem alterar formato, dados gravados ou escrita hospedada false. Nenhuma aplicação remota. Source/runtime, stores, cálculos e gates de conta/restauração/lembretes preservados, além da edição da whitelist de versão.

## Publicação e instalação

Publicar no projeto fixo conselho-elemental-testes / fr-prodiction e conferir READY, HTML, manifest e SHA dos ícones servidos. Sem dados pessoais no build, reset de storage, novo projeto, troca de domínio ou push.

O navegador/SO pode manter o ícone de uma instalação anterior em cache. Esta rodada não remove nem reinstala atalhos/apps do usuário e não verifica um aparelho físico. Não orientar apagar app/dados sem avaliar o progresso já salvo e sua cópia de segurança. Nova instalação usa os novos assets declarados; se uma instalação antiga não atualizar, orientar conforme o aparelho/navegador e preservar os dados.

Confirmação remota será registrada após o deploy.

## Publicação conferida

Deployment dpl_AVx2Bgg3uvpFA1zU6RwRx6nQJeaz, READY/production no projeto dedicado conselho-elemental-testes. HTML de /santuario contém apple-touch 180 e manifest com versão 0.1.133. Manifest servido igual ao arquivo local; quatro PNGs responderam 200 e os SHA-256 dos bytes servidos coincidem com os locais, com dimensões 32/180/192/512 exatas. Não houve teste de instalação em aparelho físico ou mudança no ícone já instalado pelo usuário.

Custódia sequencial e diff-check concluídos; reservas encerradas. Nenhum dado pessoal importado/alterado, SQL remoto, push, modificação dos outros projetos ou instrução de apagar dados do celular.
