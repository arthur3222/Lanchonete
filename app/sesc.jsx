import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Link } from "expo-router";

const { width } = Dimensions.get("window");

export default function About() {
  const router = useRouter(); // hook para navegação programática
  const handleBack = () => {
    try {
      if (router?.canGoBack?.()) { router.back(); return; }
    } catch (e) {}
    router.push('/');
  };

  return (
    <View style={styles.container}>
      {/* Espaço superior */}
      <View style={styles.box1}></View>

      {/* Título circular */}
      <View style={styles.titulo}>
        <Text style={styles.textoTitulo}>Seja Bem-vindo</Text>
      </View>

      {/* Botões */}
      <View style={styles.box}>
        {/* Botão Voltar */}

        <Link href="/LoginSesc">
          <View style={styles.button}>
            <Text style={styles.text}>Entrar</Text>
          </View>
        </Link>

        <Link href="/CadastroSesc">
          <View style={styles.button}>
            <Text style={styles.text}>Registrar</Text>
          </View>
        </Link>
      </View>

      <TouchableOpacity onPress={handleBack}>
        <Text style={styles.text}>Voltar</Text>
      </TouchableOpacity>

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
    gap: 20,
    marginVertical: 20,
  },
  button: {
    width: 250,
    height: 80,
    backgroundColor: "rgba(128,128,128,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 12,
  },
  back: {
    width: 100,
    height: 40,
    backgroundColor: "#FF7700",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  text: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
