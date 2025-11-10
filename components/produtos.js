// Re-export do módulo de dados para compatibilidade com imports antigos
// Importa de data/produtos e reexporta as named/default
import * as dados from "../data/produtos";

const map = dados.produtosMapExport || dados.default || dados.getProdutosMap?.() || {};
const grouped = dados.produtos || (typeof dados.getProdutosArray === 'function' ? (function(){
  // tenta agrupar automaticamente
  const arr = dados.getProdutosArray();
  const g = { Salgados: [], Bebidas: [], Sobremesas: [] };
  (arr || []).forEach(p => {
    const c = (p.categoria||'').toLowerCase();
    if (c.includes('salg')) g.Salgados.push(p);
    else if (c.includes('beb')) g.Bebidas.push(p);
    else if (c.includes('sob')) g.Sobremesas.push(p);
    else g.Sobremesas.push(p);
  });
  return g;
})() : {});

export const produtos = grouped;
export const produtosMap = map;
export const getProdutosMap = dados.getProdutosMap;
export const getProdutosArray = dados.getProdutosArray;

export default produtos;
