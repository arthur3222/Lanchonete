import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HamburgerMenu({
  menuItems = [], // [{ label: 'Início', path: '/' }, ...]
  headerTitle = null,
  initialOpen = false,
  widthRatio = 0.75, // percentual da largura da tela para o menu
}) {
  const router = useRouter();
  const windowWidth = Dimensions.get("window").width;
  const MENU_WIDTH = Math.min(320, windowWidth * widthRatio);

  const [open, setOpen] = useState(initialOpen);
  const anim = useRef(new Animated.Value(initialOpen ? 0 : -MENU_WIDTH)).current;

  // Atualiza o valor inicial caso o tamanho do menu mude (ex.: rotação de tela)
  useEffect(() => {
    anim.setValue(open ? 0 : -MENU_WIDTH);
  }, [MENU_WIDTH]);

  const openMenu = () => {
    setOpen(true);
    Animated.timing(anim, {
      toValue: 0,
      duration: 240,
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
    if (!path) return;
    // useRouter aceita rotas do expo-router
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu} style={styles.menuButton} accessibilityLabel="Abrir menu">
          <Ionicons name="menu" size={36} color="#fff" />
        </TouchableOpacity>

        {headerTitle ? <Text style={styles.headerTitle}>{headerTitle}</Text> : null}
      </View>

      {open && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Animated.View
            style={[
              styles.sideMenu,
              { width: MENU_WIDTH, transform: [{ translateX: anim }] },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={closeMenu} style={styles.closeBtn} accessibilityLabel="Fechar menu">
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>

            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={`${item.label}-${idx}`}
                style={styles.menuItem}
                onPress={() => (item.onPress ? (item.onPress(closeMenu)) : navigateTo(item.path))}
              >
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: "100%",
    position: "relative",
    zIndex: 1000,
    flex: 1,
  },
  header: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  menuButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  overlay: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sideMenu: {
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
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
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  menuTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 6,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  menuItemText: {
    color: "#fff",
    fontSize: 18,
  },
});