import React, { useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_PAGE_KEY = "@last_page";

export default function About() {
  const router = useRouter();

  // Redirecionar para última página visitada ao montar
  useEffect(() => {
    (async () => {
      try {
        const lastPage = await AsyncStorage.getItem(LAST_PAGE_KEY);
        // Se houver uma página salva e não for o index, redireciona
        if (lastPage && lastPage !== "/" && lastPage !== "/index") {
          router.replace(lastPage);
        }
      } catch (e) {
        // Ignora erros e permanece no index
        console.log("Erro ao carregar última página:", e);
      }
    })();
  }, []);

  return (
    <ImageBackground 
      source={require("../assets/abc.png")} // ajuste o caminho da imagem
      style={styles.container}
    >
      
      <View style={styles.box1}></View>
      <View style={styles.titulo}>
        <Text style={styles.textoTitulo}>Seja Bem vindo</Text>
      </View>
      
      <View style={styles.box}>
        <Link href="/sesc">
          <View style={styles.button}>
            <Text style={styles.text}>SESC</Text>
          </View>
        </Link>

        <Link href="/senac">
          <View style={styles.button}>
            <Text style={styles.text}>SENAC</Text>
          </View>
        </Link>
      </View>
      <View style={styles.box2}></View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 200,
    height: 200,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    marginVertical: 24,
  },
  text: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  box: {
    width: "100%",
    height: "70%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  box1: {
    width: "100%",
    height: "30%",
  },

    box2: {
    width: "100%",
    height: "20%",
  },

    titulo: {
    width: 300,
    height: 100,
    backgroundColor: "blue",
    justifyContent: "space-around",
    alignItems: "center",
  },
      textoTitulo: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "bold",
  },
});
