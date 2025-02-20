import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://192.168.56.1:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Login realizado!", `Bem-vindo`);
      } else {
        Alert.alert("Erro", data.message || "Credenciais inválidas");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha na conexão com o servidor");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#121212" }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 20, color: "white" }}>
        Login
      </Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
          borderColor: "gray",
          color: "white",
        }}
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="gray"
        value={senha}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
          borderColor: "gray",
          color: "white",
        }}
      />
      <Button title="Entrar" onPress={handleLogin} color="#1E88E5" />
    </View>
  );
}
