# Portfólio em movimento

Portfólio estático em português com quatro páginas. A implementação parte da captura fornecida no Google Drive e dos recursos públicos do portfólio de [Luke Baffait](https://lukebaffait.fr/). O perfil, o retrato e os três trabalhos pessoais vêm do [Dev011](https://dev011.netlify.app/). A coleção inclui também os projetos publicados no [acervo Unico Web](https://www.unicoweb.com.br/portfolio), identificados pela origem.

## Abrir no computador

Na pasta que contém este arquivo, execute:

```sh
python3 -m http.server 8080 --directory dist
```

Abra `http://localhost:8080/`. No Windows, use `py` no lugar de `python3`. As rotas de trabalhos, apresentação e contato ficam em `/works/`, `/info/` e `/contact/`.

## Adaptar o conteúdo

Edite `dist/portfolio.js` para personalizar a apresentação. Coloque suas imagens em `dist/assets/` e indique o caminho no conteúdo. Os recursos de animação, imagens, fontes e bibliotecas são servidos pelo próprio site.

## Publicar

Use `dist/` como raiz do seu domínio em uma hospedagem estática que sirva `index.html` em cada diretório. O projeto dispensa compilação.

A produção na Vercel usa `vercel.json` e o comando `node scripts/publicar.mjs`. O diretório gerado é `public/`. A compilação prepara URLs canônicas, o mapa das quatro páginas e os dados estruturados a partir do domínio de produção. Ao mudar de domínio, defina `SITE_URL`. Para servir os mesmos arquivos em um subdiretório, configure `SITE_BASE_PATH`, por exemplo `/portfolio-kaue-lima/`. Os links canônicos apontam para a versão principal na Vercel.

O mapa para o Google Search Console está em [sitemap.xml](https://portfolio-kaue-lima.vercel.app/sitemap.xml).
