import React, { useRef, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardProduto } from "../components/Produto";
import { produtos } from "../data/produtos";

const { width, height } = Dimensions.get("window");
const MENU_WIDTH = Math.min(320, width * 0.8);
const LAST_PAGE_KEY = "@last_page";
const LAST_LANCHONETE_KEY = "@last_lanchonete";

export default function About() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  // Salvar última página ao montar
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(LAST_PAGE_KEY, "/ProdutoSenac");
        await AsyncStorage.setItem(LAST_LANCHONETE_KEY, "senac");
      } catch {}
    })();
  }, []);

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

  const navigateTo = async (path) => {
    closeMenu();
    try {
      await AsyncStorage.setItem(LAST_PAGE_KEY, path);
      if (path.toLowerCase().includes("senac")) {
        await AsyncStorage.setItem(LAST_LANCHONETE_KEY, "senac");
      } else if (path.toLowerCase().includes("sesc")) {
        await AsyncStorage.setItem(LAST_LANCHONETE_KEY, "sesc");
      }
    } catch {}
    router.push(path);
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
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Seções de produtos */}
        {Object.keys(produtos).map((categoria) => (
          <View key={categoria} style={styles.section}>
            <Text style={styles.tituloSecao}>{categoria}</Text>

            <View style={styles.linhaCards}>
              {produtos[categoria].map((item) => (
                <CardProduto
                  key={item.id}
                  img={item.img}
                  nome={item.nome}
                  preco={item.preco}
                  produtoId={item.id}
                  store="senac"
                />
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
            { transform: [{ translateX: anim }], height: height },
          ]}
        >
          <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
            <Text style={styles.Text}>Cafe Sesc</Text>
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>
          <View style={styles.menuItems}>
                      <TouchableOpacity
                        onPress={() => navigateTo("/homeSenac")}
                        style={styles.menuItem}
                      >
                        <Text style={styles.menuText}>Home</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigateTo("/homeSenac")}
                        style={styles.menuItem}
                      >
                        <Text style={styles.menuText}>Café Senac</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigateTo("/homeSesc")}
                        style={styles.menuItem}
                      >
                        <Text style={styles.menuText}>Café Sesc</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigateTo("/carrinhoSenac")}
                        style={styles.menuItem}
                      >
                        <Text style={styles.menuText}>Carrinho</Text>
                      </TouchableOpacity>
          
                     
          
                      <TouchableOpacity
                        onPress={() => navigateTo("/ProdutoSenac")}
                        style={styles.menuItem}
                      >
                        <Text style={styles.menuText}>Lanchonete</Text>
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
    backgroundColor: "#FF7700",
  },
  topBar: {
    width: "100%",
    height: 80,
    backgroundColor: "#FF7700",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  menuButton: {
    padding: 6,
    borderRadius: 6,
  },
  box2: {
    width: "100%",
    height: "44%",
    backgroundColor: "#FF7700",
    borderTopWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  box3: {
    width: "100%",
    height: "44%",
    backgroundColor: "#FF7700",
    borderTopWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  circulo: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "white",
  },
  Botao: {
    width: 250,
    height: 250,
    backgroundColor: "black",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#FF7700",
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
    width: 250,
    height: 40,
    backgroundColor: "#004586",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "black",
    borderRadius: 6,
    marginTop: 10,
  },
  Text: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    paddingHorizontal: 10,
    paddingEnd: 10,
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
  },
});
