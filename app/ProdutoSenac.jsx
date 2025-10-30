import React, { useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CardProduto from "../components/Produto";

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
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo rolável */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(produtos).map((categoria) => (
          <View key={categoria}>
            <Text style={styles.tituloSecao}>{categoria}</Text>
            <View style={styles.linhaCards}>
              {produtos[categoria].map((item, index) => (
                <CardProduto
                  key={index}
                  img={item.img}
                  nome={item.nome}
                  preco={item.preco}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

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
              onPress={() => navigateTo("/homeSesc")}
              style={styles.menuItem}
            >
              <Text style={styles.menuText}>home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo("/homeSesc")}
              style={styles.menuItem}
            >
              <Text style={styles.menuText}>Café Sesc</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo("/Conta")}
              style={styles.menuItem}
            >
              <Text style={styles.menuText}>Conta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigateTo("/Carrinho")}
              style={styles.menuItem}
            >
              <Text style={styles.menuText}>Carrinho</Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF7700",
  },
  topBar: {
    width: "100%",
    height: 60,
    backgroundColor: "#FF7700",
    borderBottomWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 30,
  },
  menuButton: {
    padding: 6,
    borderRadius: 6,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: "#FF7700",
  },
  tituloSecao: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
  },
  linhaCards: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 20,
  },
  sideMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    backgroundColor: "#FF7700",
    paddingTop: 40,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  closeButton: {
    marginLeft: 10,
    marginBottom: 20,
    flexDirection: "row",
    color: "white",
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
});
