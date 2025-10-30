import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
          <Ionicons name="menu" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.box2}>
        <Text style={styles.text}>Seja bem-vindo</Text>
        <View style={styles.circulo} />
      </View>

      <View style={styles.box3}>
        <Link href="/ProdutoSenac" style={styles.link}>
          <View style={styles.Botao}>
            <Text style={styles.text}>Fazer Pedido</Text>
          </View>
        </Link>
      </View>

      {/* Overlay e menu lateral */}
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
                   <Text style={styles.menuText}>home</Text>
                 </TouchableOpacity>
     
                 <TouchableOpacity
                   onPress={() => navigateTo("/homeSesc")}
                   style={styles.menuItem}
                 >
                   <Text style={styles.menuText}>Café sesc</Text>
                 </TouchableOpacity>
     
                 <TouchableOpacity
                   onPress={() => navigateTo("/Conta")}
                   style={styles.menuItem}
                 >
                   <Text style={styles.menuText}>Conta</Text>
                 </TouchableOpacity>
     
                 <TouchableOpacity
                   onPress={() => navigateTo("/carrinhoSenac")}
                   style={styles.menuItem}
                 >
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
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  menuTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  closeButton: {
    marginLeft: 10,
    marginBottom: 20,
    flexDirection: "row",
    color: "white",
  },
   menuItem: {
    width: 250,
    height: 40,
    backgroundColor: "#004586",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
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
