import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity } from "react-native";
import { useRouter, Link } from "expo-router";

// Config do Supabase (REST)
const SUPABASE_URL = "https://mihtxdlmlntfxkclkvis.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paHR4ZGxtbG50ZnhrY2xrdmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQ4MzksImV4cCI6MjA3NDk5MDgzOX0.oqMeEOnV5463hF8BaJ916yYyNjDC2bJe73SCP2Fg1yA";

const { width } = Dimensions.get("window");

export default function About() {
  const router = useRouter();
  const handleBack = () => {
    try { if (router?.canGoBack?.()) { router.back(); return; } } catch (e) {}
    router.push('/');
  };

  // Estado do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleRegister = async () => {
    setMsg("");
    const normEmail = email.trim().toLowerCase();
    if (!name || !normEmail || !password || !confirm) {
      setMsg("Preencha todos os campos."); return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normEmail)) { setMsg("Email inválido."); return; }
    if (password.length < 6) { setMsg("A senha deve ter ao menos 6 caracteres."); return; }
    if (password !== confirm) { setMsg("As senhas não conferem."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: normEmail,
          password,
          data: { name, org: "SESC" },
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(body?.msg || body?.error_description || body?.message || "Erro ao cadastrar.");
        return;
      }
      setMsg("Cadastro criado! Verifique seu email para confirmar.");
      setTimeout(() => router.replace("/LoginSesc"), 1200);
    } catch (e) {
      setMsg("Falha inesperada. Tente novamente.");
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
        {/* Removidos inputs duplicados e não controlados */}
        <TextInput
          placeholder="Nome Completo"
          placeholderTextColor="#fff"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
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
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder="Confirmar Senha"
          placeholderTextColor="#fff"
          secureTextEntry
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
        />

        {!!msg && <Text style={{ color: "#fff" }}>{msg}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.text}>{loading ? "Cadastrando..." : "Registrar"}</Text>
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
