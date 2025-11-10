// app/data/produtos.js

// IMPORTS ESTÁTICOS (obrigatório para Metro)
// Ajuste os nomes/paths conforme seus arquivos em /assets
const IMG_1 = require("../assets/1.webp");
const IMG_2 = require("../assets/2.png");
const IMG_R = require("../assets/R.jpg");
// placeholder (crie esse arquivo ou ajuste o caminho)
const IMG_PLACEHOLDER = require("../assets/abc.png");

// Mapa principal (sempre definido)
const produtosMap = {
  "1": {
    id: "1",
    nome: "Hambúrguer Artesanal",
    preco: 24.9,
    descricao: "Hambúrguer 200g com queijo, alface e molho especial da casa",
    categoria: "salgado",
    ingredientes: ["Pão brioche", "Carne 200g", "Queijo cheddar", "Alface", "Tomate", "Molho especial"],
    img: IMG_1
  },
  "2": {
    id: "2",
    nome: "Coca-Cola Lata",
    preco: 6.5,
    descricao: "Refrigerante Coca-Cola lata 350ml gelado",
    categoria: "bebida",
    img: IMG_2
  },
  "3": {
    id: "3",
    nome: "Brownie de Chocolate",
    preco: 12.9,
    descricao: "Brownie artesanal com cobertura de chocolate e nozes",
    categoria: "sobremesa",
    ingredientes: ["Chocolate amargo", "Manteiga", "Açúcar", "Farinha", "Nozes"],
    img: IMG_R
  },
  "4": {
    id: "4",
    nome: "Pizza Margherita",
    preco: 38.9,
    descricao: "Pizza tradicional com molho de tomate, muçarela e manjericão",
    categoria: "salgado",
    ingredientes: ["Massa fina", "Molho de tomate", "Mussarela", "Manjericão fresco", "Azeite"],
    img: IMG_2
  }
};

// Agrupa produtos por categoria (keys compatíveis com o código existente)
function groupByCategory(map) {
  const grouped = { Salgados: [], Bebidas: [], Sobremesas: [] };
  Object.values(map).forEach(p => {
    const cat = (p.categoria || '').toLowerCase();
    if (cat === 'salgado' || cat === 'salgados') grouped.Salgados.push(p);
    else if (cat === 'bebida' || cat === 'bebidas') grouped.Bebidas.push(p);
    else if (cat === 'sobremesa' || cat === 'sobremesas') grouped.Sobremesas.push(p);
    else {
      // se categoria desconhecida, adicione em Sobremesas por fallback
      grouped.Sobremesas.push(p);
    }
  });
  return grouped;
}

export const produtos = groupByCategory(produtosMap);

// --- FUNÇÕES DE ACESSO SEGURO ---
// Usar funções evita avaliação prematura que pode causar erro em caso de import circular.
export function getProdutosMap() {
  // garante que sempre retorne um objeto
  return produtosMap || {};
}

export function getProdutosArray() {
  const map = getProdutosMap();
  // garante que sempre retorne um array, evita TypeError
  return (map && typeof map === "object") ? Object.values(map) : [];
}

// Consulta direta por id (retorno seguro)
export function getProdutoById(id) {
  if (!id && id !== 0) return undefined;
  const rawId = Array.isArray(id) ? id[0] : id;
  const key = String(rawId);
  const map = produtosMap || (typeof exports.produtosMapExport !== 'undefined' ? exports.produtosMapExport : {});
  return map[key];
}

// Compatibilidade com imports antigos
export const produtosMapExport = produtosMap;
export const produtosArrayExport = getProdutosArray();

// Export default (opcional)
export default produtosMap;
