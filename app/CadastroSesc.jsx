import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function About() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Espaço superior */}
      <View style={styles.box1}></View>

      {/* Título circular */}
      <View style={styles.titulo}>
        <Text style={styles.textoTitulo}>Seja Bem-vindo</Text>
      </View>

      {/* Inputs funcionais */}
      <View style={styles.box}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#fff"
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#fff"
          secureTextEntry={true}
          style={styles.input}
        />

        <TextInput
          placeholder="Nome Completo"
          placeholderTextColor="#fff"
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#fff"
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#fff"
          secureTextEntry={true}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/LoginSesc")}
        >
          <Text style={styles.text}>Registrar</Text>
        </TouchableOpacity>

        <Link href="/sesc">
                <Text style={styles.text}>Voltar</Text>
        </Link>
      </View>

      {/* Espaço inferior */}
      <View style={styles.box2}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#004586",
    alignItems: "center",
  },
  box1: {
    flex: 1,
  },
  box2: {
    flex: 1,
  },
  titulo: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    backgroundColor: "#FF7700",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  textoTitulo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  box: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginVertical: 20,
  },
  input: {
    width: 300,
    height: 40,
    backgroundColor: "rgba(128,128,128,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 6,
    paddingHorizontal: 10,
    color: "#fff",
  },
  button: {
    width: 300,
    height: 40,
    backgroundColor: "#FF7700",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    marginTop: 10,
  },
  text: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
