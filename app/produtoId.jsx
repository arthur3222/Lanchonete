import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardProduto } from "../components/Produto";

const { width, height } = Dimensions.get("window");
const MENU_WIDTH = Math.min(320, width * 0.8);

export default function About() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const openMenu = () => {
    setOpen(true);
    Animated.timing(anim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(anim, {
      toValue: -MENU_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  const navigateTo = (path) => {
    closeMenu();
    router.push(path);
  };

  // Produtos embutidos (exemplo com ids únicos)
 const produtos = {
    Salgados: [
      { id: "1", img: require("../assets/R.jpg"), nome: "Coxinha", preco: 7.99, descricao: "Coxinha crocante." },
      { id: "2", img: require("../assets/abc.png"), nome: "Pastel", preco: 8.99, descricao: "Pastel recheado." },
      { id: "3", img: require("../assets/abc.png"), nome: "Empada", preco: 6.99, descricao: "Empada quentinha." },
    ],
    Bebidas: [
      { id: "4", img: require("../assets/abc.png"), nome: "Refrigerante", preco: 5.99, descricao: "Lata 350ml." },
      { id: "5", img: require("../assets/R.jpg"), nome: "Suco Natural", preco: 6.99, descricao: "Suco natural fresco." },
      { id: "6", img: require("../assets/abc.png"), nome: "Água", preco: 3.5, descricao: "Garrafa 500ml." },
    ],
    sobremesa: [
      { id: "7", img: require("../assets/abc.png"), nome: "Refrigerante", preco: 5.99, descricao: "Lata 350ml." },
      { id: "8", img: require("../assets/R.jpg"), nome: "Suco Natural", preco: 6.99, descricao: "Suco natural fresco." },
      { id: "9", img: require("../assets/abc.png"), nome: "Água", preco: 3.5, descricao: "Garrafa 500ml." },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal */}
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Seções de produtos */}
        {Object.keys(produtos).map((categoria) => (
          <View key={categoria} style={styles.section}>
            <Text style={styles.tituloSecao}>{categoria}</Text>

            <View style={styles.linhaCards}>
              {produtos[categoria].map((item) => (
                <View key={`${categoria}-${item.id}`} style={styles.cardWrapper}>
                  <CardProduto
                    img={item.img}
                    nome={item.nome}
                    preco={item.preco}
                    produtoId={item.id}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Overlay quando menu aberto */}
      {open && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu} />
      )}

      {/* Menu lateral */}
      {open && (
        <Animated.View
          style={[
            styles.sideMenu,
            { transform: [{ translateX: anim }], height: height }, // garante altura da tela
          ]}
        >
          <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
            <Text style={styles.Text}>Cafe Sesc</Text>
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>
          <View style={styles.menuItems}>
            <TouchableOpacity onPress={() => navigateTo("/homeSesc")} style={styles.menuItem}>
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateTo("/homeSenac")} style={styles.menuItem}>
              <Text style={styles.menuText}>Café Senac</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateTo("/Conta")} style={styles.menuItem}>
              <Text style={styles.menuText}>Conta</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateTo("/carrinhoSesc")} style={styles.menuItem}>
              <Text style={styles.menuText}>Carrinho</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#004586",
  },
  topBar: {
    width: "100%",
    height: 80,
    backgroundColor: "#004586",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  menuButton: {
    padding: 6,
    borderRadius: 6,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 900,
  },
  sideMenu: {
    position: "absolute",
    left: 0,
    top: 0,
    width: MENU_WIDTH,
    backgroundColor: "#003a73",
    paddingTop: 40,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  closeButton: {
    marginLeft: 10,
    marginBottom: 20,
    flexDirection: "row",
    color: "white",
    alignItems: "center",
  },
  menuItems: {
    paddingHorizontal: 20,
  },
  menuItem: {
    width: "100%",
    height: 44,
    backgroundColor: "#FF7700",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "black",
    borderRadius: 6,
    marginTop: 10,
  },
  Text: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 10,
    paddingEnd: 10,
    marginRight: 8,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  /* estilos novos/restaurados para seção de produtos */
  section: {
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  tituloSecao: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 10,
  },
  linhaCards: {
    flexDirection: "row",
    flexWrap: "wrap", // permite quebrar em linhas automaticamente
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 10,
    // gap não é suportado em RN estável; usamos margin no cardWrapper
  },
  cardWrapper: {
    width: (width - 48) / 2, // duas colunas com padding; ajuste conforme desejar
    marginBottom: 12,
    paddingHorizontal: 6,
  },
});
