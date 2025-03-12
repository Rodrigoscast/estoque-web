import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Modal, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store"; // 🔥 Usar SecureStore para armazenar tokens com segurança
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";

// Função para salvar e obter tokens com SecureStore
const storeToken = async (token) => await SecureStore.setItemAsync("accessToken", token);
const getToken = async () => await SecureStore.getItemAsync("accessToken");
const removeToken = async () => await SecureStore.deleteItemAsync("accessToken");

// Função para renovar o token
const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token-app`, {
      method: "POST",
      credentials: "include", // Permite o envio do cookie HTTP-Only
    });

    const data = await response.json();
    if (!response.ok) throw new Error("Erro ao renovar o token");

    await storeToken(data.token);
    return data.token;
  } catch (error) {
    console.log("Erro ao renovar token:", error);
    return null;
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigation = useNavigation();
  const [forgotEmail, setForgotEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // ⚡ Verifica se há um token válido ao abrir o app
  useEffect(() => {
    async function checkLogin() {
      const token = await getToken();
      if (token) {
        const newToken = await refreshAccessToken(); // 🔄 Tenta renovar o token
        if (newToken) {
          navigation.replace("Projetos"); // Redireciona direto para a Home
          return;
        }
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
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login/app`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
        credentials: "include", // Envia e recebe o refresh token no cookie
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao fazer login");
      }

      await storeToken(data.token); // 🔥 Salva o token de forma segura

      navigation.replace("Projetos"); // Redireciona para a Home

    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      Alert.alert("Erro", "Digite seu e-mail!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/esqueciSenha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao enviar e-mail");

      Alert.alert("Sucesso", "E-mail enviado com sucesso!");
      setModalVisible(false);
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
      {/* Modal de Esqueci minha senha */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recuperar Senha</Text>
            <TextInput
              style={styles.inputMail}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.botoesBot}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.buttonMail} onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.buttonTextMail}>{loading ? "Enviando..." : "Enviar"}</Text>
              </TouchableOpacity>              
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.top}>
        <Image source={require("../../../assets/icon.png")} style={styles.logo} />
        <Text style={styles.title}>Bem vindo de volta!</Text>
      </View>

      <View style={styles.mid}>
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
      </View>

      <View style={styles.bot}>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
        </TouchableOpacity>
        
        <Text style={styles.signupText}>
          Esqueceu sua senha?{" "}
          <Text style={styles.signupLink} onPress={() => setModalVisible(true)}>
            Clique aqui
          </Text>
        </Text>
      </View>
    </View>
  );
}
