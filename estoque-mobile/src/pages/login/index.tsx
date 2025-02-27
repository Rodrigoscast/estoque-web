import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles";
import { useNavigation } from "@react-navigation/native"; // Para redirecionamento

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigation = useNavigation();

  // ⚡ Verifica se já existe um token salvo no celular ao abrir o app
  useEffect(() => {
    async function checkLogin() {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.replace("Home"); // Redireciona direto para a Home se o usuário já estiver logado
      }
      setCheckingAuth(false);
    }
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }

      await AsyncStorage.setItem("token", data.token); // 🔥 Salva o token no celular

      navigation.replace("Home"); // Redireciona para a tela Home após o login

    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <ActivityIndicator size="large" color="#999" style={{ flex: 1, justifyContent: "center" }} />;
  }

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/icone.png")} style={styles.logo} />
      <Text style={styles.title}>Bem vindo de volta!</Text>

      <Text style={styles.label}>ENDEREÇO E-MAIL</Text>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <MaterialIcons name="email" size={20} color="#999" style={styles.icon} />
      </View>

      <Text style={styles.label}>SENHA</Text>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={senha} 
          onChangeText={setSenha} 
          secureTextEntry={secureText} 
          placeholder="Digite sua senha"
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <MaterialIcons 
            name={secureText ? "visibility-off" : "visibility"} 
            size={20} 
            color="#999" 
            style={styles.icon} 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
      </TouchableOpacity>
      
      <Text style={styles.signupText}>
        Não tem conta? <Text style={styles.signupLink}>Crie agora</Text>
      </Text>
    </View>
  );
}
