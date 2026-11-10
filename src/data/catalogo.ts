export const produtos = [
  {
    id: 'blusa-canelada', codigo: 'IC01', nome: 'Blusa canelada', categoria: 'Blusas',
    cor: 'Bordô', preco: 3500, foto: 'canelada.webp', posicao: 'center 31%',
    descricao: 'Canelado bordô com gola alta e manga curta. Uma peça para combinar com jeans ou com uma calça de alfaiataria.',
    tamanhos: { P: 2, M: 3, G: 0 },
  },
  {
    id: 'corset', codigo: 'IC02', nome: 'Corset com botões', categoria: 'Corsets',
    cor: 'Chocolate', preco: 8999, foto: 'corset.webp', posicao: 'center 65%',
    descricao: 'Corset tomara que caia em tom chocolate, com botões frontais e recorte ajustado.',
    tamanhos: { P: 2 },
  },
  {
    id: 'calca-wide-leg', codigo: 'IC03', nome: 'Calça wide leg', categoria: 'Calças',
    cor: 'Azul', preco: 14000, foto: 'jeans.webp', posicao: 'center bottom',
    descricao: 'Jeans azul claro de perna ampla com detalhes desgastados. Na foto, combinada com uma blusa marrom.',
    tamanhos: { '38': 0, '40': 2, '42': 1 },
  },
  {
    id: 'blusa-tule', codigo: 'IC04', nome: 'Blusa de tule', categoria: 'Blusas',
    cor: 'Marrom', preco: 8999, foto: 'tule.webp', posicao: 'center 40%',
    descricao: 'Blusa de alças com decote em V e desenho delicado sobre o tule marrom.',
    tamanhos: { P: 1, M: 2 },
  },
  {
    id: 'calca-brilho', codigo: 'IC05', nome: 'Calça brilho rodeio', categoria: 'Calças',
    cor: 'Marrom', preco: 14000, foto: 'rodeio.webp', posicao: 'center bottom',
    descricao: 'Calça marrom com pontos de brilho e perna reta. A numeração 42 tem ajuste de 40 na referência da loja.',
    tamanhos: { '42': 1 },
  },
];

export const categorias = ['Todas', 'Blusas', 'Calças', 'Corsets'];
export const moeda = (centavos: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100);
