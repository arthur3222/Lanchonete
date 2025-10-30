// app/produto/[id].tsx
import React from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { produtosMap } from "../components/produtos";

export default function ProdutoDetalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Pega o ID da URL - importante para rotas dinâmicas
  const productId = Array.isArray(id) ? id[0] : id;
  const produto = produtosMap[productId];

  // Se não encontrar o produto
  if (!produto) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Produto não encontrado</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image 
          source={produto.img} 
          style={styles.imagem} 
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.nome}>{produto.nome}</Text>
          <Text style={styles.preco}>R$ {produto.preco.toFixed(2)}</Text>
          
          <View style={styles.separator} />
          
          <Text style={styles.descricaoTitle}>Descrição</Text>
          <Text style={styles.descricao}>{produto.descricao}</Text>
          
          {produto.ingredientes && (
            <>
              <Text style={styles.ingredientesTitle}>Ingredientes</Text>
              {produto.ingredientes.map((ingrediente, index) => (
                <Text key={index} style={styles.ingrediente}>
                  • {ingrediente}
                </Text>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Botão fixo na parte inferior */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => Alert.alert("Adicionado", `${produto.nome} adicionado ao carrinho!`)}
        >
          <Text style={styles.buyButtonText}>Adicionar ao Carrinho</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Espaço para o botão fixo
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    color: "#666",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#004586",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  imagem: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 20,
  },
  nome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  preco: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 16,
  },
  descricaoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  descricao: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
  ingredientesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 8,
  },
  ingrediente: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  buyButton: {
    backgroundColor: "#004586",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});