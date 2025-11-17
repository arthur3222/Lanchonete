import React, { useRef, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image, // adicionado
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { createClient } from "@supabase/supabase-js"; // adicionado

// Paleta de cores para SENAC (mantida)
const PALETTE = {
  background: "#FF7700",
  circleBg: "#000000",
  buttonBg: "#000000",
  sideMenuBg: "#FF7700",
  menuItemBg: "#004586",
  textColor: "#ffffff",
};

const { width, height } = Dimensions.get("window");
const MENU_WIDTH = Math.min(320, width * 0.8);

// Config do Supabase (REST)
const SUPABASE_URL = "https://mihtxdlmlntfxkclkvis.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paHR4ZGxtbG50ZnhrY2xrdmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQ4MzksImV4cCI6MjA3NDk5MDgzOX0.oqMeEOnV5463hF8BaJ916yYyNjDC2bJe73SCP2Fg1yA";

const LAST_LANCHONETE_KEY = "@last_lanchonete"; // adicionado

// cliente Supabase com sessão persistente
let supabaseClient = null;
const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    return supabaseClient;
  } catch {
    return null;
  }
};

export default function About() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState(""); // adicionado

  useEffect(() => {
    (async () => {
      try {
        const sb = getSupabase();
        const { data } = (await sb?.auth.getSession()) || {};
        const emailSessao =
          data?.session?.user?.email || data?.session?.user?.user_metadata?.email;
        if (emailSessao) {
          setUserEmail(emailSessao);
          // carrega foto local do perfil
          const raw = await AsyncStorage.getItem("@profile");
          if (raw) {
            try { const p = JSON.parse(raw); if (p?.imageUrl) setUserPhoto(p.imageUrl); } catch {}
          }
          // redireciona conforme última lanchonete
          const last = await AsyncStorage.getItem(LAST_LANCHONETE_KEY);
          if (last === "sesc") {
            router.replace("/homeSesc");
            return;
          }
          await AsyncStorage.setItem(LAST_LANCHONETE_KEY, "senac");
          return;
        }
        // fallback legado
        const saved = await AsyncStorage.getItem("authUser");
        if (!saved) {
          router.replace("/LoginSenac");
          return;
        }
        const savedObj = JSON.parse(saved);
        setUserEmail(savedObj?.email || "");
        const raw = await AsyncStorage.getItem("@profile");
        if (raw) {
          try { const p = JSON.parse(raw); if (p?.imageUrl) setUserPhoto(p.imageUrl); } catch {}
        }
        const last = await AsyncStorage.getItem(LAST_LANCHONETE_KEY);
        if (last === "sesc") {
          router.replace("/homeSesc");
          return;
        }
        await AsyncStorage.setItem(LAST_LANCHONETE_KEY, "senac");
      } catch {
        router.replace("/LoginSenac");
      }
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
      if (path.toLowerCase().includes("senac")) {
        await AsyncStorage.setItem(LAST_LANCHONETE_KEY, "senac");
      } else if (path.toLowerCase().includes("sesc")) {
        await AsyncStorage.setItem(LAST_LANCHONETE_KEY, "sesc");
      }
    } catch {}
    router.push(path);
  };

  const logout = async () => {
    try {
      const sb = getSupabase();
      await sb?.auth.signOut();
      await AsyncStorage.removeItem("authUser");
      await AsyncStorage.removeItem("sb.session");
    } catch {}
    closeMenu();
    router.replace("/LoginSenac");
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
        <Link href="/Perfil">
          <View style={styles.circulo}>
            {userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.profileThumb} />
            ) : (
              <Text style={styles.circleText}>Ir para o Perfil</Text>
            )}
          </View>
        </Link>
      </View>

      <View style={styles.box3}>
        <Link href="/ProdutoSenac">
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
            <Text style={styles.Text}>Café Senac</Text>
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>

          {!!userEmail && (
            <Text style={{ color: "white", marginLeft: 10, marginBottom: 8 }}>
              {userEmail}
            </Text>
          )}

          <View className="menuItems" style={styles.menuItems}>
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
              onPress={() => navigateTo("/carrinhoSenac")}
              style={styles.menuItem}
            >
              <Text style={styles.menuText}>Carrinho</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={styles.menuItem}>
              <Text style={styles.menuText}>Sair</Text>
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
    backgroundColor: PALETTE.background,
  },
  topBar: {
    width: "100%",
    height: 80,
    backgroundColor: PALETTE.background,
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
    backgroundColor: PALETTE.background,
    borderTopWidth: 2,
    borderColor: PALETTE.textColor,
    justifyContent: "center",
    alignItems: "center",
  },
  box3: {
    width: "100%",
    height: "44%",
    backgroundColor: PALETTE.background,
    borderTopWidth: 2,
    borderColor: PALETTE.textColor,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: PALETTE.textColor,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  circulo: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: PALETTE.circleBg,
    borderWidth: 2,
    borderColor: PALETTE.textColor,
    justifyContent: "center",
    alignItems: "center",
  },
  profileThumb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: PALETTE.textColor,
  },
  circleText: {
    color: PALETTE.textColor,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  Botao: {
    width: 250,
    height: 250,
    backgroundColor: PALETTE.buttonBg,
    borderWidth: 2,
    borderColor: PALETTE.textColor,
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
    backgroundColor: PALETTE.sideMenuBg,
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
    backgroundColor: PALETTE.menuItemBg,
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
    color: PALETTE.textColor,
    paddingHorizontal: 10,
    paddingEnd: 10,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "bold",
    color: PALETTE.textColor,
  },
});
