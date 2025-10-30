// app/data/produtos.ts
export interface Produto {
  id: string;
  img: any;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  ingredientes?: string[];
}

// Dados de exemplo - você pode usar imagens locais ou URLs
export const produtosMap: { [key: string]: Produto } = {
  "1": {
    id: "1",
    nome: "Hambúrguer Artesanal",
    preco: 24.90,
    descricao: "Hambúrguer 200g com queijo, alface e molho especial da casa",
    categoria: "salgado",
    ingredientes: ["Pão brioche", "Carne 200g", "Queijo cheddar", "Alface", "Tomate", "Molho especial"],
    img: require("../../assets/images/hamburguer.jpg") // Ajuste o caminho conforme sua estrutura
  },
  "2": {
    id: "2",
    nome: "Coca-Cola Lata",
    preco: 6.50,
    descricao: "Refrigerante Coca-Cola lata 350ml gelado",
    categoria: "bebida",
    img: require("../../assets/images/coca-lata.jpg")
  },
  "3": {
    id: "3",
    nome: "Brownie de Chocolate",
    preco: 12.90,
    descricao: "Brownie artesanal com cobertura de chocolate e nozes",
    categoria: "sobremesa",
    ingredientes: ["Chocolate amargo", "Manteiga", "Açúcar", "Farinha", "Nozes"],
    img: require("../../assets/images/brownie.jpg")
  },
  "4": {
    id: "4",
    nome: "Pizza Margherita",
    preco: 38.90,
    descricao: "Pizza tradicional com molho de tomate, muçarela e manjericão",
    categoria: "salgado",
    ingredientes: ["Massa fina", "Molho de tomate", "Mussarela", "Manjericão fresco", "Azeite"],
    img: require("../../assets/images/pizza.jpg")
  }
};

export const produtosArray = Object.values(produtosMap);