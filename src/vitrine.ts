import { moeda, produtos } from './data/catalogo';

type Produto = typeof produtos[number];
type Item = { id: string; tamanho: string; quantidade: number };

const chaveSacola = 'instinto-closet-sacola-v1';
const porId = new Map(produtos.map((produto) => [produto.id, produto]));
const saldo = (produto: Produto, tamanho: string) => {
  const tamanhos: Record<string, number> = produto.tamanhos as Record<string, number>;
  return Object.hasOwn(tamanhos, tamanho) ? tamanhos[tamanho] : 0;
};
const $ = <T extends HTMLElement = HTMLElement>(seletor: string) =>
  document.querySelector<T>(seletor)!;

function lerSacola(): Item[] {
  try {
    const dados = JSON.parse(localStorage.getItem(chaveSacola) ?? '[]');
    if (!Array.isArray(dados)) return [];
    const validos: Item[] = [];
    for (const item of dados) {
      if (!item || typeof item.tamanho !== 'string' || !Number.isInteger(item.quantidade)) continue;
      const produto = porId.get(item.id);
      if (!produto || item.quantidade < 1 || item.quantidade > saldo(produto, item.tamanho)) continue;
      if (!validos.some((atual) => atual.id === item.id && atual.tamanho === item.tamanho)) {
        validos.push({ id: item.id, tamanho: item.tamanho, quantidade: item.quantidade });
      }
    }
    return validos;
  } catch {
    return [];
  }
}

const sacola = lerSacola();
const modalProduto = $<HTMLDialogElement>('#produto');
const modalSacola = $<HTMLDialogElement>('#sacola');
const form = $<HTMLFormElement>('[data-adicionar]');
const itens = $('[data-itens]');
const mensagem = $('[data-mensagem]');
const textoMensagem = $<HTMLTextAreaElement>('#texto-mensagem');
const erroProduto = $('[data-erro-produto]');
const statusCopia = $('[data-copia-status]');
const botaoMensagem = document.querySelector<HTMLButtonElement>('[data-mostrar-mensagem]');
const linkWhatsApp = document.querySelector<HTMLAnchorElement>('[data-whatsapp-link]');
const caminhoFotos = document.body.dataset.fotos!;
let selecionado: Produto;

function texto(tag: string, conteudo: string, classe?: string) {
  const elemento = document.createElement(tag);
  elemento.textContent = conteudo;
  if (classe) elemento.className = classe;
  return elemento;
}

function fecharMensagem() {
  mensagem.hidden = true;
  botaoMensagem?.setAttribute('aria-expanded', 'false');
  statusCopia.textContent = '';
}

function abrirProduto(produto: Produto) {
  selecionado = produto;
  const foto = $<HTMLImageElement>('[data-foto-produto]');
  foto.src = caminhoFotos + produto.foto;
  foto.alt = produto.nome + ' na cor ' + produto.cor.toLowerCase();
  foto.style.objectPosition = produto.posicao;
  $('#nome-produto').textContent = produto.nome;
  $('[data-categoria-produto]').textContent = produto.categoria + ' · ' + produto.codigo;
  $('[data-preco-produto]').textContent = moeda(produto.preco);
  $('[data-descricao-produto]').textContent = produto.descricao;
  $('[data-cor-produto]').textContent = produto.cor;
  erroProduto.textContent = '';
  const opcoes = Object.entries(produto.tamanhos).map(([tamanho, quantidade]) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'tamanho';
    radio.value = tamanho;
    radio.required = true;
    radio.disabled = quantidade === 0;
    if (radio.disabled) radio.setAttribute('aria-label', tamanho + ' — esgotado');
    label.append(radio, texto('span', tamanho));
    return label;
  });
  $('[data-tamanhos]').replaceChildren(...opcoes);
  form.querySelector('button[type="submit"]')!.toggleAttribute('disabled', opcoes.every((opcao) => opcao.querySelector('input')!.disabled));
  modalProduto.showModal();
}

function atualizarSacola() {
  const quantidade = sacola.reduce((total, item) => total + item.quantidade, 0);
  $('[data-contador]').textContent = String(quantidade);
  $('[data-abrir-sacola]').setAttribute('aria-label', 'Abrir sacola, ' + quantidade + (quantidade === 1 ? ' item' : ' itens'));
  const subtotal = sacola.reduce((total, item) => total + porId.get(item.id)!.preco * item.quantidade, 0);
  $('[data-subtotal]').textContent = moeda(subtotal);
  $('[data-total]').hidden = !quantidade;
  itens.replaceChildren();

  if (!quantidade) {
    itens.append(texto('p', 'Sua sacola está vazia.', 'vazio-titulo'), texto('p', 'Explore a vitrine e adicione suas peças favoritas.', 'vazio-texto'));
    const explorar = texto('button', 'Voltar à vitrine', 'botao secundario');
    explorar.addEventListener('click', () => {
      modalSacola.close();
      $('#pecas').scrollIntoView();
    });
    itens.append(explorar);
    fecharMensagem();
    return;
  }

  const linhas = sacola.map((item, indice) => {
    const produto = porId.get(item.id)!;
    const linha = document.createElement('article');
    linha.className = 'item-sacola';
    const foto = document.createElement('img');
    foto.src = caminhoFotos + produto.foto;
    foto.alt = '';
    foto.style.objectPosition = produto.posicao;
    const info = document.createElement('div');
    info.append(
      texto('h3', produto.nome),
      texto('p', produto.cor + ' · Tam. ' + item.tamanho),
      texto('strong', moeda(produto.preco * item.quantidade)),
    );
    const acoes = document.createElement('div');
    acoes.className = 'item-acoes';
    const contexto = produto.nome + ', tamanho ' + item.tamanho;
    for (const [acao, rotulo, titulo] of [
      ['menos', '−', 'Diminuir quantidade de '],
      ['total', String(item.quantidade), ''],
      ['mais', '+', 'Aumentar quantidade de '],
      ['remover', 'Remover', 'Remover '],
    ]) {
      if (acao === 'total') {
        acoes.append(texto('span', rotulo));
        continue;
      }
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.textContent = rotulo;
      botao.dataset.acao = acao;
      botao.dataset.indice = String(indice);
      botao.setAttribute('aria-label', titulo + contexto);
      botao.disabled = (acao === 'mais' && item.quantidade >= saldo(produto, item.tamanho)) ||
        (acao === 'menos' && item.quantidade === 1);
      acoes.append(botao);
    }
    info.append(acoes);
    linha.append(foto, info);
    itens.append(linha);
    return '• ' + item.quantidade + '× ' + produto.nome + ' — ' + produto.cor +
      ' — tam. ' + item.tamanho + ' — cód. ' + produto.codigo + ' — ' + moeda(produto.preco) + '/un.';
  });

  textoMensagem.value = [
    'Olá, Instinto Closet! Escolhi estas peças na vitrine:',
    '', ...linhas, '', 'Subtotal das peças: ' + moeda(subtotal),
    'Podem confirmar a disponibilidade e me informar as opções de entrega?',
  ].join('\n');
  if (linkWhatsApp) {
    linkWhatsApp.href = 'https://wa.me/' + document.body.dataset.whatsapp + '?text=' + encodeURIComponent(textoMensagem.value);
  }
}

function salvarSacola() {
  try {
    localStorage.setItem(chaveSacola, JSON.stringify(sacola));
  } catch {
    // A sacola continua disponível enquanto a página estiver aberta.
  }
  atualizarSacola();
}

document.querySelectorAll<HTMLButtonElement>('[data-produto]').forEach((botao) => {
  botao.addEventListener('click', () => abrirProduto(porId.get(botao.dataset.produto!)!));
});

const filtros = document.querySelectorAll<HTMLButtonElement>('[data-filtro]');
const cards = document.querySelectorAll<HTMLElement>('[data-categoria]');
filtros.forEach((botao) => {
  botao.addEventListener('click', () => {
    filtros.forEach((filtro) => filtro.setAttribute('aria-pressed', String(filtro === botao)));
    let visiveis = 0;
    cards.forEach((card) => {
      card.hidden = botao.dataset.filtro !== 'Todas' && botao.dataset.filtro !== card.dataset.categoria;
      if (!card.hidden) visiveis++;
    });
    $('[data-total-pecas]').textContent = visiveis + (visiveis === 1 ? ' peça' : ' peças');
  });
});

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const tamanho = String(new FormData(form).get('tamanho') ?? '');
  const existente = sacola.find((item) => item.id === selecionado.id && item.tamanho === tamanho);
  if (saldo(selecionado, tamanho) <= (existente?.quantidade ?? 0)) {
    erroProduto.textContent = 'Você já adicionou todas as unidades disponíveis neste tamanho.';
    return;
  }
  if (existente) existente.quantidade++;
  else sacola.push({ id: selecionado.id, tamanho, quantidade: 1 });
  salvarSacola();
  modalProduto.close();
  modalSacola.showModal();
});

$('[data-abrir-sacola]').addEventListener('click', () => modalSacola.showModal());
itens.addEventListener('click', (evento) => {
  const botao = (evento.target as HTMLElement).closest<HTMLButtonElement>('button[data-acao]');
  if (!botao) return;
  const indice = Number(botao.dataset.indice);
  const item = sacola[indice];
  const acao = botao.dataset.acao;
  if (acao === 'remover') sacola.splice(indice, 1);
  if (acao === 'menos' && item.quantidade > 1) item.quantidade--;
  if (acao === 'mais' && item.quantidade < saldo(porId.get(item.id)!, item.tamanho)) item.quantidade++;
  salvarSacola();
  const mesmoBotao = itens.querySelector<HTMLButtonElement>(`[data-indice="${indice}"][data-acao="${acao}"]:enabled`);
  (mesmoBotao ?? itens.querySelector('button:enabled') ?? modalSacola.querySelector<HTMLElement>('[data-fechar]'))?.focus();
});
botaoMensagem?.setAttribute('aria-expanded', 'false');
botaoMensagem?.addEventListener('click', () => {
  mensagem.hidden = false;
  botaoMensagem.setAttribute('aria-expanded', 'true');
  textoMensagem.focus();
});
$('[data-copiar]').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(textoMensagem.value);
    statusCopia.textContent = 'Mensagem copiada.';
  } catch {
    textoMensagem.select();
    statusCopia.textContent = 'Selecione e copie a mensagem para usar no WhatsApp.';
  }
});
for (const modal of [modalProduto, modalSacola]) {
  modal.querySelector('[data-fechar]')!.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (evento) => {
    if (evento.target === modal) {
      const { top, bottom, left, right } = modal.getBoundingClientRect();
      if (evento.clientX < left || evento.clientX > right || evento.clientY < top || evento.clientY > bottom) modal.close();
    }
  });
}
modalSacola.addEventListener('close', fecharMensagem);
atualizarSacola();
