import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';

function loadAsyncStorage() {
  try {
    // require dinâmico para não quebrar se o pacote não estiver instalado
    // pode retornar o módulo direto ou um objeto com .default
    // (compatibilidade CommonJS / ESM)
    // eslint-disable-next-line global-require
    const mod = require('@react-native-async-storage/async-storage');
    return mod?.default ?? mod;
  } catch (err) {
    return null;
  }
}

function loadImagePicker() {
  try {
    // require dinâmico para não quebrar se o pacote não estiver instalado
    // eslint-disable-next-line global-require
    const mod = require('expo-image-picker');
    return mod?.default ?? mod;
  } catch (err) {
    return null;
  }
}

// ADICIONADO: cliente Supabase e helpers
const SUPABASE_URL = "https://mihtxdlmlntfxkclkvis.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1paHR4ZGxtbG50ZnhrY2xrdmlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTQ4MzksImV4cCI6MjA3NDk5MDgzOX0.oqMeEOnV5463hF8BaJ916yYyNjDC2bJe73SCP2Fg1yA";

let supabase = null;
function getSupabase() {
  if (supabase) return supabase;
  // tenta usar AsyncStorage se disponível para persistir sessão
  let AS = null;
  try { AS = loadAsyncStorage(); } catch {}
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AS || undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return supabase;
}

// Tabela padrão de perfis: 'profiles' (ajuste se usar outro nome)
async function upsertProfile(payload) {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('profiles')
      .upsert(payload, { onConflict: 'email' })
      .select()
      .maybeSingle();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function getProfileByEmail(email) {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

export default function Perfil() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');

  const validarEmail = (e) => /\S+@\S+\.\S+/.test((e || '').trim());
  const onlyDigits = (s) => (s || '').replace(/\D/g, '');

  const pickImage = async () => {
    const ImagePicker = loadImagePicker();
    if (!ImagePicker) {
      Alert.alert('Imagem', 'Seleção de imagem indisponível. Cole a URL manualmente.');
      return;
    }
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync?.();
      if (perm && perm.status !== 'granted') {
        Alert.alert('Permissão negada', 'Autorize o acesso à galeria nas configurações.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync?.({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result?.canceled) return;
      const uri = result?.assets?.[0]?.uri || result?.uri;
      if (uri) setImageUrl(uri);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleSalvar = async () => {
    if (!nome.trim()) return Alert.alert('Erro', 'Informe seu nome.');
    if (!validarEmail(email)) return Alert.alert('Erro', 'Informe um email válido.');
    if ((senha || '').length < 6) return Alert.alert('Erro', 'A senha deve ter ao menos 6 caracteres.');
    if (senha !== confirmSenha) return Alert.alert('Erro', 'As senhas não coincidem.');
    if (!imageUrl) return Alert.alert('Erro', 'Selecione uma foto de perfil pela galeria.');

    const cpfDigits = onlyDigits(cpf);
    const telDigits = onlyDigits(telefone);
    if (cpf && cpfDigits.length !== 11) return Alert.alert('Erro', 'CPF deve conter 11 dígitos.');
    if (telefone && (telDigits.length < 10 || telDigits.length > 11)) {
      return Alert.alert('Erro', 'Telefone deve conter 10 ou 11 dígitos.');
    }

    const profile = {
      nome: nome.trim(),
      email: email.trim(),
      senha,
      imageUrl,
      cpf: cpfDigits || '',
      telefone: telDigits || '',
    };

    // tenta salvar no Supabase primeiro
    try {
      const { data, error } = await upsertProfile({
        email: profile.email,
        nome: profile.nome,
        senha: profile.senha,
        image_url: profile.imageUrl,
        cpf: profile.cpf,
        telefone: profile.telefone,
      });
      if (!error) {
        Keyboard.dismiss();
        Alert.alert('Sucesso', 'Dados salvos no servidor.');
        try { if (router?.canGoBack?.()) { router.back(); return; } } catch (e) {}
        router.push('/');
        return;
      }
    } catch (e) {
      // continua para fallback
    }

    // fallback para AsyncStorage
    try {
      const AsyncStorage = loadAsyncStorage();
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem('@profile', JSON.stringify(profile));
        Keyboard.dismiss();
        Alert.alert('Sucesso', 'Dados salvos localmente (fallback).');
        try { if (router?.canGoBack?.()) { router.back(); return; } } catch (e) {}
        router.push('/');
        return;
      }
    } catch (e) {
      // ignore
    }

    Alert.alert('Erro', 'Não foi possível salvar os dados no servidor nem localmente.');
    // eslint-disable-next-line no-console
    console.warn('Salvar perfil falhou em todos os backends');
  };

  const handleVoltar = () => {
    try {
      if (router?.canGoBack?.()) {
        router.back();
        return;
      }
    } catch (e) {
      // ignore
    }
    router.push('/');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // tenta carregar do Supabase por email salvo localmente
        const AsyncStorage = loadAsyncStorage();
        let localEmail = null;
        if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
          const raw = await AsyncStorage.getItem('@profile');
          if (raw) {
            try { const o = JSON.parse(raw); localEmail = o?.email; } catch (e) {}
          }
        }

        if (localEmail) {
          const { data, error } = await getProfileByEmail(localEmail);
          if (data && !error) {
            if (data.nome) setNome(data.nome);
            if (data.email) setEmail(data.email);
            if (data.senha) { setSenha(data.senha); setConfirmSenha(data.senha); }
            if (data.image_url) setImageUrl(data.image_url);
            if (data.cpf) setCpf(data.cpf);
            if (data.telefone) setTelefone(data.telefone);
            return;
          }
        }

        // fallback: carrega local
        if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
          const raw = await AsyncStorage.getItem('@profile');
          if (raw && mounted) {
            const obj = JSON.parse(raw);
            if (obj.nome) setNome(obj.nome);
            if (obj.email) setEmail(obj.email);
            if (obj.senha) { setSenha(obj.senha); setConfirmSenha(obj.senha); }
            if (obj.imageUrl) setImageUrl(obj.imageUrl);
            if (obj.cpf) setCpf(obj.cpf);
            if (obj.telefone) setTelefone(obj.telefone);
          }
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleVoltar} activeOpacity={0.7}>
            <Text style={styles.voltarText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Perfil</Text>
        </View>

        <View style={styles.avatarWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>Sem Imagem</Text>
            </View>
          )}
          <TouchableOpacity style={styles.pickButton} onPress={pickImage} activeOpacity={0.85}>
            <Text style={styles.pickText}>Selecionar foto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            placeholderTextColor="#ddd"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="seu@exemplo.com"
            placeholderTextColor="#ddd"
          />

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
            placeholder="Somente números"
            placeholderTextColor="#ddd"
            maxLength={14}
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="DDD + número"
            placeholderTextColor="#ddd"
            maxLength={15}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder="Senha"
            placeholderTextColor="#ddd"
          />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            value={confirmSenha}
            onChangeText={setConfirmSenha}
            secureTextEntry
            placeholder="Repita a senha"
            placeholderTextColor="#ddd"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar} activeOpacity={0.85}>
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#004586' },
  scroll: { paddingBottom: 40, alignItems: 'center' },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
    backgroundColor: '#004586',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 12, paddingVertical: 6, paddingHorizontal: 8 },
  voltarText: { color: '#fff', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'center' },
  avatarWrap: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff' },
  pickButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0066cc',
  },
  pickText: { color: '#fff', fontWeight: '600' },
  form: { width: '90%', maxWidth: 400, padding: 16 },
  label: { color: '#fff', marginTop: 12, marginBottom: 6, fontWeight: '600' },
  input: {
    height: 44,
    backgroundColor: 'rgba(128,128,128,0.5)',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 10,
    color: '#fff',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#FF7700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
});
