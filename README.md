# Instinto Closet

MVP estático em Astro para apresentar uma coleção, explorar peças por categoria, abrir os detalhes de cada produto e montar uma sacola. O estoque, os preços e os tamanhos do catálogo são ilustrativos. A sacola fica salva no navegador e gera uma mensagem com as variações, quantidades e subtotal.

## Rodar localmente

Use Node.js 22.12+ ou 24 LTS.

```sh
npm ci
npm run dev
```

Configure o número de atendimento em `.env` a partir de `.env.example`. Use 55, DDD e número, somente dígitos. Com a variável `PUBLIC_WHATSAPP_NUMBER` configurada, a sacola abre o WhatsApp com a mensagem pronta. Sem o número, ela oferece a prévia e a opção de copiar o texto.

## Catálogo e build

As peças de demonstração ficam em `src/data/catalogo.ts` e as fotos enviadas como referência, em `public/fotos`. O catálogo é local nesta etapa.

```sh
npm run build
npm run preview
```

A saída estática fica em `dist/`. Ajuste o catálogo e o número de atendimento antes de usar a vitrine com clientes.
