import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity } from "react-native";
import { useRouter, Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Config do Supabase (REST)
const SUPABASE_URL = "https://mihtxdlmlntfxkclkvis.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paHR4ZGxtbG50ZnhrY2xrdmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQ4MzksImV4cCI6MjA3NDk5MDgzOX0.oqMeEOnV5463hF8BaJ916yYyNjDC2bJe73SCP2Fg1yA";

const { width } = Dimensions.get("window");

export default function About() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const sb = await AsyncStorage.getItem("sb.session");
        if (sb) { router.replace("/homeSesc"); return; }
        const saved = await AsyncStorage.getItem("authUser");
        if (saved) { router.replace("/homeSesc"); }
      } catch {}
    })();
  }, []);

  const handleLogin = async () => {
    setError("");
    const normEmail = email.trim().toLowerCase();
    if (!normEmail || !password) { setError("Preencha email e senha."); return; }
    if (!/^\S+@\S+\.\S+$/.test(normEmail)) { setError("Email inválido."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ email: normEmail, password }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = body?.error_description || body?.msg || body?.message || "Erro ao autenticar.";
        if (/confirm/i.test(msg)) setError("Confirme seu email antes de entrar.");
        else if (/invalid/i.test(msg)) setError("Email ou senha incorretos.");
        else setError(msg);
        return;
      }

      await AsyncStorage.setItem("sb.session", JSON.stringify(body));
      await AsyncStorage.setItem("authUser", JSON.stringify({ email: body?.user?.email || normEmail }));
      router.replace("/homeSesc");
    } catch {
      setError("Erro ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#fff"
          secureTextEntry={true}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {!!error && <Text style={{ color: "#fff" }}>{error}</Text>}
        <TouchableOpacity
          style={[styles.button, (loading || !email || !password) && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading || !email || !password}
        >
          <Text style={styles.text}>{loading ? "Entrando..." : "Entrar"}</Text>
        </TouchableOpacity>

        <Link href={"/sesc"} >
          <Text style={styles.text}>Voltar</Text>
        </Link >
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
