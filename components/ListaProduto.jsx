import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CardProduto } from "./Produto";

export default function ListaProdutos({ categoria, itens }) {
  return (
    <View style={styles.container}>
      <Text style={styles.tituloSecao}>{categoria}</Text>
      <View style={styles.linhaCards}>
        {itens.map((item, index) => (
          <CardProduto
            key={index}
            img={item.img}
            nome={item.nome}
            preco={item.preco}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  tituloSecao: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginVertical: 10,
    marginLeft: 20,
  },
  linhaCards: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
});
