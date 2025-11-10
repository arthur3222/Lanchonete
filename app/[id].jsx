// app/produto/[id].js
import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { getProdutoById } from "../data/produtos";
import { useCart } from "../components/CartContext";

export default function ProdutoDetalhe() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawId = params.id;
  const store = params.store || 'sesc';
  const { addToCart } = useCart();
  const produto = getProdutoById(rawId);

  const formatPrice = (value) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return "—";
    try {
      return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));
    } catch (e) {
      return Number(value).toFixed(2);
    }
  };

  const imageSource = (() => {
    if (!produto || produto.img === undefined || produto.img === null) return null;
    if (typeof produto.img === "object" && produto.img.uri) return produto.img;
    if (typeof produto.img === "string") return { uri: produto.img };
    return produto.img;
  })();

  // Função robusta de voltar: usa canGoBack se disponível, senão navega para a home
  const handleBack = () => {
    try {
      if (router && typeof router.canGoBack === 'function') {
        if (router.canGoBack()) {
          router.back();
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    // fallback
    router.push('/');
  };

  if (!produto) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"} />
        <Text style={styles.errorText}>Produto não encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backWrapper}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {imageSource ? (
          <Image source={imageSource} style={styles.imagem} resizeMode="cover" />
        ) : (
          <View style={[styles.imagem, styles.noImage]}>
            <Text style={styles.noImageText}>Sem imagem</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Text style={styles.nome}>{produto.nome || "Produto"}</Text>
            <Text style={styles.preco}>R$ {formatPrice(produto.preco)}</Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.descricaoTitle}>Descrição</Text>
          <Text style={styles.descricao}>{produto.descricao || "Sem descrição."}</Text>

          {Array.isArray(produto.ingredientes) && produto.ingredientes.length > 0 && (
            <>
              <Text style={styles.ingredientesTitle}>Ingredientes</Text>
              {produto.ingredientes.map((ingrediente, index) => (
                <Text key={index} style={styles.ingrediente}>• {ingrediente}</Text>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buyButton}
          activeOpacity={0.85}
          onPress={() => {
            addToCart(store, produto);
            Alert.alert("Adicionado", `${produto.nome || "Produto"} adicionado ao carrinho (${store})!`);
          }}
        >
          <Text style={styles.buyButtonText}>Adicionar ao Carrinho</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* Opcional: CardProduto exportado para ser usado em listas */
export function CardProduto({ img, nome, preco, produtoId, onPress }) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) return onPress();
    if (produtoId) {
      router.push(`/${produtoId}`);
    }
  };

  const priceText = preco !== undefined && preco !== null && !Number.isNaN(Number(preco))
    ? `R$ ${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(preco))}`
    : "--";

  const imageSource = (() => {
    if (!img) return null;
    if (typeof img === "object" && img.uri) return img;
    if (typeof img === "string") return { uri: img };
    return img;
  })();

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={handlePress}>
      {imageSource ? <Image source={imageSource} style={styles.cardImage} resizeMode="cover" /> : null}
      <View style={{ padding: 8, alignItems: "center" }}>
        <Text style={styles.cardNome} numberOfLines={1}>{nome}</Text>
        <Text style={styles.cardPreco}>{priceText}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { width: '100%', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', zIndex: 20, flexDirection: 'row', alignItems: 'center' },
  backWrapper: { marginRight: 12, paddingVertical: 6, paddingHorizontal: 8 },
  backText: { color: '#004586', fontSize: 16, fontWeight: '600' },
  scrollContent: { paddingBottom: 120 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: 20 },
  errorText: { color: "#666", fontSize: 18, marginBottom: 20, textAlign: "center" },
  backButton: { backgroundColor: "#004586", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: "#fff", fontWeight: "600" },
  imagem: { width: "100%", height: 320, backgroundColor: "#f6f6f6" },
  noImage: { alignItems: "center", justifyContent: "center" },
  noImageText: { color: "#999" },
  content: { padding: 20 },
  nome: { fontSize: 22, fontWeight: "700", color: "#222", marginBottom: 4 },
  preco: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  separator: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 16 },
  descricaoTitle: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 8 },
  descricao: { fontSize: 16, color: "#666", lineHeight: 22, marginBottom: 16 },
  ingredientesTitle: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8, marginTop: 8 },
  ingrediente: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 4 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", padding: 16, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  buyButton: { backgroundColor: "#004586", padding: 16, borderRadius: 8, alignItems: "center" },
  buyButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  /* estilos do card exportado */
  card: { width: "48%", backgroundColor: "#fff", borderRadius: 10, marginBottom: 12, overflow: "hidden" },
  cardImage: { width: "100%", height: 120 },
  cardNome: { marginTop: 6, fontWeight: "700", color: "#222" },
  cardPreco: { marginTop: 4, color: "#444" },
});
