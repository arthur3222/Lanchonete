import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Alert,
  TextInput, // ADICIONADO
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "../components/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { createClient } from "@supabase/supabase-js";

const { width, height } = Dimensions.get("window");
const MENU_WIDTH = Math.min(320, width * 0.8);
const TABLE_PEDIDOS = "pedidos";
const SENAC_CART_KEY = "@carrinho_senac";
const LAST_LANCHONETE_KEY = "@last_lanchonete";

const debugLog = (...a) => {
  try {
    console.log("[carrinhoSenac]", ...a);
  } catch {}
};

let supabaseClient = null;
const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  const SUPABASE_URL = "https://mihtxdlmlntfxkclkvis.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paHR4ZGxtbG50ZnhrY2xrdmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQ4MzksImV4cCI6MjA3NDk5MDgzOX0.oqMeEOnV5463hF8BaJ916yYyNjDC2bJe73SCP2Fg1yA";
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    let AS = null;
    try { AS = require("@react-native-async-storage/async-storage").default; } catch {}
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AS || undefined,
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

const getProductImageSource = (raw) => {
  if (!raw) return null;
  const p = raw.product || raw;
  const candidates = [
    p.image,
    p.imageUrl,
    p.image_url,
    p.img,
    p.imgUrl,
    p.imagem,
    p.urlImagem,
    p.foto,
    p.fotoUrl,
    p.fotoProduto,
    p.media,
    p.asset,
  ].filter(Boolean);
  for (let c of candidates) {
    if (typeof c === "number") return c;
    if (typeof c === "string") {
      const s = c.trim();
      if (!s) continue;
      const normalized = s.startsWith("http://")
        ? s.replace("http://", "https://")
        : s;
      return { uri: normalized };
    }
    if (c && typeof c === "object") {
      if (typeof c.uri === "string") {
        const u = c.uri.startsWith("http://")
          ? c.uri.replace("http://", "https://")
          : c.uri;
        return { uri: u };
      }
      if (Array.isArray(c.assets) && c.assets[0]?.uri) {
        const u = c.assets[0].uri.startsWith("http://")
          ? c.assets[0].uri.replace("http://", "https://")
          : c.assets[0].uri;
        return { uri: u };
      }
    }
  }
  return null;
};

const fetchLanchoneteId = async (supabase, nome) => {
  try {
    const { data, error } = await supabase
      .from("lanchonete")
      .select("id")
      .eq("nome", nome)
      .single();
    if (error) return null;
    return data?.id || null;
  } catch {
    return null;
  }
};

const buildGroupedItems = (lista) => {
  const map = {};
  lista.forEach((p) => {
    const nome = (p.nome || p.name || p.titulo || p.title || "Desconhecido").trim();
    const qtd = Number(p.quantidade || p.qtd || 1);
    const preco = Number(p.preco || 0);
    const realQtd = isNaN(qtd) ? 1 : qtd;
    if (!map[nome]) map[nome] = { nome, quantidade: 0, totalPreco: 0 };
    map[nome].quantidade += realQtd;
    map[nome].totalPreco += preco * realQtd;
  });
  return Object.values(map);
};

const getAsyncStorage = () => {
  try {
    return require("@react-native-async-storage/async-storage").default;
  } catch {
    return null;
  }
};

// Tema Senac (ajuste conforme cores reais das outras páginas)
// TODO: Substituir '#1E2742' pela cor de fundo usada em homeSenac (se diferente)
const SENAC_THEME = {
  background: "#FF7700",
  menu: "#FF7700",
  accent: "#003a73",
  text: "#FFFFFF",
};

export default function CarrinhoSenac() {
  const router = useRouter();
  const { carts, removeFromCart, clearCart, addToCart, setCartItems } = useCart();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);   // ADICIONADO
  const [tempQty, setTempQty] = useState("1");          // ADICIONADO
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
    })
      .start(() => setOpen(false));
  };
  const navigateTo = async (path) => {
    closeMenu();
    try {
      const AS = getAsyncStorage();
      if (path.toLowerCase().includes("senac")) {
        await AS?.setItem(LAST_LANCHONETE_KEY, "senac");
      } else if (path.toLowerCase().includes("sesc")) {
        await AS?.setItem(LAST_LANCHONETE_KEY, "sesc");
      }
    } catch {}
    router.push(path);
  };

  // Substituir cálculo do total:
  const totalNumber = (carts.senac || []).reduce((acc, p) => {
    const qty = Number(p?.quantidade || p?.qtd || 1);
    const price = Number(p?.preco || 0);
    return acc + price * (isNaN(qty) ? 1 : qty);
  }, 0);
  const total = totalNumber.toFixed(2);

  const confirmOrder = async () => {
    if (saving) return;
    if (!(carts.senac || []).length) {
      Alert.alert("Carrinho", "Seu carrinho está vazio.");
      return;
    }
    setSaving(true);
    const supabase = getSupabase();
    const grouped = buildGroupedItems(carts.senac || []);
    let rows = [];
    try {
      if (!supabase) throw new Error("Supabase não inicializado.");
      const lanchoneteId = await fetchLanchoneteId(supabase, "senac");
      if (!lanchoneteId) throw new Error("Lanchonete 'senac' não encontrada.");
      // Pedido único
      rows = [{
        lanchonete_id: lanchoneteId,
        origem: "senac",
        itens: grouped.map(g => ({ nome: g.nome, quantidade: g.quantidade })),
        total: totalNumber,
        status: "pendente",
        created_at: new Date().toISOString(),
      }];
      const { error } = await supabase.from(TABLE_PEDIDOS).insert(rows);
      if (error) throw error;
      Alert.alert("Pedido", "Pedido confirmado!");
      clearCart("senac");
      const AS = getAsyncStorage();
      AS?.removeItem(SENAC_CART_KEY).catch(() => {});
      try { await AS?.setItem(LAST_LANCHONETE_KEY, "senac"); } catch {}
      router.push("/homeSenac");
    } catch (e) {
      const msg = e?.message || "Erro desconhecido";
      try {
        const AS = getAsyncStorage() || require("@react-native-async-storage/async-storage").default;
        const localKey = "@pedidos_offline";
        const raw = await AS.getItem(localKey);
        const lista = raw ? JSON.parse(raw) : [];
        const fallbackRows = rows.length ? rows : [{
          origem: "senac",
          itens: grouped.map(g => ({ nome: g.nome, quantidade: g.quantidade })),
          total: totalNumber,
          status: "pendente",
          created_at: new Date().toISOString(),
        }];
        fallbackRows.forEach(r => lista.push({ ...r, tabelaDestino: TABLE_PEDIDOS, erroSync: msg }));
        await AS.setItem(localKey, JSON.stringify(lista));
        Alert.alert("Offline", "Servidor indisponível. Pedido salvo localmente.\n" + msg);
      } catch {
        Alert.alert("Erro", "Falha ao confirmar.\n" + msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // Restaurar carrinho
  useEffect(() => {
    (async () => {
      try {
        const AS = getAsyncStorage();
        if (!AS) return;
        const raw = await AS.getItem(SENAC_CART_KEY);
        if (!raw) return;
        const salvos = JSON.parse(raw);
        if (!Array.isArray(salvos) || !salvos.length) return;
        if (carts.senac?.length) return;
        if (setCartItems) setCartItems("senac", salvos);
        else if (addToCart) salvos.forEach((it) => addToCart("senac", it));
      } catch {}
    })();
  }, []);

  // Persistir carrinho
  useEffect(() => {
    (async () => {
      try {
        const AS = getAsyncStorage();
        if (!AS) return;
        const atual = Array.isArray(carts.senac) ? carts.senac : [];
        await AS.setItem(SENAC_CART_KEY, JSON.stringify(atual));
      } catch {}
    })();
  }, [carts.senac]);

  // NOVO: garantir restauração/persistência da sessão de auth
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let sub;
    (async () => {
      try { await sb.auth.getSession(); } catch {}
      try {
        sub = sb.auth.onAuthStateChange((_event, session) => {
          debugLog("auth change", _event, !!session);
        }).data?.subscription;
      } catch {}
    })();
    return () => { try { sub?.unsubscribe?.(); } catch {} };
  }, []);

  // Marca lanchonete atual ao montar
  useEffect(() => {
    try {
      const AS = getAsyncStorage();
      AS?.setItem(LAST_LANCHONETE_KEY, "senac");
    } catch {}
  }, []);

  const handleClearCart = () => {
    clearCart("senac");
    const AS = getAsyncStorage();
    AS?.removeItem(SENAC_CART_KEY).catch(() => {});
  };

  const changeQty = (idx, delta) => {
    try {
      const list = Array.isArray(carts.senac) ? [...carts.senac] : [];
      if (!list[idx]) return;
      const item = { ...list[idx] };
      const curr = Number(item.quantidade || item.qtd || 1);
      const next = Math.max(1, Math.min(99, curr + delta));
      item.quantidade = next; delete item.qtd;
      list[idx] = item;
      if (setCartItems) setCartItems("senac", list);
      else if (addToCart) { clearCart?.("senac"); list.forEach(it => addToCart("senac", it)); }
    } catch {}
  };
  const setQty = (idx, qty) => {
    try {
      const list = Array.isArray(carts.senac) ? [...carts.senac] : [];
      if (!list[idx]) return;
      const item = { ...list[idx] };
      const next = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
      item.quantidade = next; delete item.qtd;
      list[idx] = item;
      if (setCartItems) setCartItems("senac", list);
      else if (addToCart) { clearCart?.("senac"); list.forEach(it => addToCart("senac", it)); }
    } catch {}
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
        <Text style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>
          Carrinho Senac
        </Text>
        {(!(carts.senac || []).length) ? (
          <Text style={{ color: "#fff" }}>Carrinho vazio</Text>
        ) : (
          (carts.senac || []).map((p, i) => {
            const src = getProductImageSource(p);
            const qty = Number(p?.quantidade || p?.qtd || 1);
            const price = Number(p?.preco || 0);
            const subtotal = (price * qty).toFixed(2);
            return (
              <View key={i} style={styles.productRow}>
                {src ? (
                  <Image source={src} style={styles.productImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.productImage, styles.productImagePlaceholder]}>
                    <Text style={{ color: "#fff", fontSize: 10 }}>Sem foto</Text>
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {p.nome} — R$ {price.toFixed(2)} x {qty} = R$ {subtotal}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <TouchableOpacity
                      onPress={() => changeQty(i, -1)}
                      style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#eee", borderRadius: 6 }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "800" }}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ minWidth: 28, textAlign: "center", color: "#fff" }}>{qty}</Text>
                    <TouchableOpacity
                      onPress={() => changeQty(i, +1)}
                      style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#eee", borderRadius: 6 }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "800" }}>+</Text>
                    </TouchableOpacity>

                    {/* Botão Definir */}
                    <TouchableOpacity
                      onPress={() => { setEditingIdx(i); setTempQty(String(qty)); }}
                      style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "#FF7700", borderRadius: 6, marginLeft: 8 }}
                      activeOpacity={0.85}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Definir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => removeFromCart("senac", i)}>
                      <Text style={{ color: "#fff", textDecorationLine: "underline", marginLeft: 12 }}>
                        Remover
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Inline editor de quantidade */}
                  {editingIdx === i && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <TextInput
                        value={tempQty}
                        onChangeText={setTempQty}
                        keyboardType="number-pad"
                        placeholder="Qtd"
                        placeholderTextColor="#bbb"
                        style={{ width: 70, height: 40, backgroundColor: "#f3f3f3", borderRadius: 6, paddingHorizontal: 8, color: "#333" }}
                      />
                      <TouchableOpacity
                        onPress={() => { setQty(i, tempQty); setEditingIdx(null); }}
                        style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#28a745", borderRadius: 6 }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>Salvar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setEditingIdx(null)}
                        style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#ccc", borderRadius: 6 }}
                      >
                        <Text style={{ color: "#333", fontWeight: "700" }}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ marginTop: 12, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>
            Total: R$ {total}
          </Text>
          <TouchableOpacity
            onPress={handleClearCart}
            style={{ marginBottom: 8 }}
            disabled={saving}
          >
            <Text style={{ color: "#fff", textDecorationLine: "underline" }}>
              Limpar carrinho
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              saving && { opacity: 0.55 },
            ]}
            onPress={confirmOrder}
            disabled={saving}
            activeOpacity={0.75}
          >
            <Text style={styles.confirmText}>
              {saving ? "Enviando..." : "Confirmar pedido"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay e menu lateral */}
      {open && (
        <Animated.View
          style={[
            styles.sideMenu,
            { transform: [{ translateX: anim }], height },
          ]}
        >
          <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
            <Text style={styles.Text}>Café Senac</Text>
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
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SENAC_THEME.background,
  },
  topBar: {
    width: "100%",
    height: 80,
    backgroundColor: SENAC_THEME.background,
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
    backgroundColor: SENAC_THEME.background,
    borderTopWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  productRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "#222",
  },
  productImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: SENAC_THEME.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  confirmText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  sideMenu: {
    position: "absolute",
    left: 0,
    top: 0,
    width: MENU_WIDTH,
    backgroundColor: SENAC_THEME.menu,
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
  },
  menuItem: {
    width: 250,
    height: 40,
    backgroundColor: SENAC_THEME.accent,
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
  menuItems: {},
});
