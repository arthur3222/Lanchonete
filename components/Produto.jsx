// File: app/produto/[id].js
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
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { produtosMap as produtosMapExported, getProdutoById } from "../data/produtos"; // ajuste o caminho se sua estrutura for diferente
import { useCart } from "./CartContext";

export default function ProdutoDetalhe() {
  const router = useRouter();
  const { id, store } = useLocalSearchParams();
  const productId = Array.isArray(id) ? id[0] : id;

  // preferir função de lookup (mais resiliente que acessar o mapa diretamente)
  const produto = productId ? getProdutoById(productId) : undefined;
  const { addToCart } = useCart();
  const [qtd, setQtd] = React.useState(1);
  const [showQtyInput, setShowQtyInput] = React.useState(false);
  const [tempQty, setTempQty] = React.useState(String(qtd));

  if (!produto) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"} />
        <Text style={styles.errorText}>Produto não encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const imageSource = (() => {
    if (!produto.img) return null;
    if (typeof produto.img === "object" && produto.img.uri) return produto.img;
    if (typeof produto.img === "string") return { uri: produto.img };
    return produto.img;
  })();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {imageSource ? (
          <Image source={imageSource} style={styles.imagem} resizeMode="contain" />
        ) : (
          <View style={[styles.imagem, styles.noImage]}> 
            <Text style={styles.noImageText}>Sem imagem</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.rowBetween}>
            <Text style={styles.nome}>{produto.nome || "Produto"}</Text>
            <Text style={styles.preco}>R$ {Number(produto.preco).toFixed(2)}</Text>
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
        <View style={styles.footerRow}>
          {!showQtyInput ? (
            <TouchableOpacity
              onPress={() => {
                setTempQty(String(qtd));
                setShowQtyInput(true);
              }}
              style={styles.qtyButton}
              activeOpacity={0.85}
            >
              <Text style={styles.qtyButtonText}>Definir quantidade</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyRow}>
              <TextInput
                value={tempQty}
                onChangeText={setTempQty}
                keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
                placeholder="Qtd"
                placeholderTextColor="#777"
                style={styles.qtyInput}
                maxLength={2}
              />

              <TouchableOpacity
                onPress={() => {
                  const n = Math.max(1, Math.min(99, parseInt(tempQty, 10) || 1));
                  setQtd(n);
                  setShowQtyInput(false);
                }}
                style={styles.qtyOk}
              >
                <Text style={styles.qtyOkText}>OK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowQtyInput(false)}
                style={styles.qtyCancel}
              >
                <Text style={styles.qtyCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.buyButton, { flex: 1 }]}
            activeOpacity={0.85}
            onPress={() => {
              try {
                const loja = (typeof store === "string" && (store === "sesc" || store === "senac")) ? store : "sesc";
                addToCart?.(loja, { ...produto, quantidade: qtd });
                Alert.alert("Adicionado", `${produto.nome || "Produto"} x${qtd} adicionado ao carrinho!`);
              } catch (err) {
                console.warn(err);
                Alert.alert("Erro", "Não foi possível adicionar ao carrinho.");
              }
            }}
          >
            <Text style={styles.buyButtonText}>Adicionar ao Carrinho</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function CardProduto({ img, nome, preco, produtoId, onPress, store }) {
  const router = useRouter();
  const handlePress = () => {
    if (onPress) return onPress();
    if (produtoId) {
      const q = store ? `?store=${store}` : '';
      // rota ajustada para arquivo existente [id].jsx na raiz do app
      router.push(`/${produtoId}${q}`);
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
  scrollContent: { paddingBottom: 140 },
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
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  buyButton: { backgroundColor: "#004586", padding: 16, borderRadius: 8, alignItems: "center", marginLeft: 12 },
  buyButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  qtyButton: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#ff5252", borderRadius: 8 },
  qtyButtonText: { fontWeight: "700", color: "#fff" },
  qtyRow: { flexDirection: "row", alignItems: "center" },
  qtyInput: { width: 64, height: 40, backgroundColor: "#f3f3f3", borderRadius: 6, paddingHorizontal: 8, color: "#333" },
  qtyOk: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#28a745", borderRadius: 8, marginLeft: 8 },
  qtyOkText: { color: "#fff", fontWeight: "700" },
  qtyCancel: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#ccc", borderRadius: 8, marginLeft: 8 },
  qtyCancelText: { color: "#333", fontWeight: "700" },

  /* estilos do card exportado */
  card: { width: "48%", backgroundColor: "#fff", borderRadius: 10, marginBottom: 12, overflow: "hidden" },
  cardImage: { width: "100%", height: 120 },
  cardNome: { marginTop: 6, fontWeight: "700", color: "#222" },
  cardPreco: { marginTop: 4, color: "#444" },
});
