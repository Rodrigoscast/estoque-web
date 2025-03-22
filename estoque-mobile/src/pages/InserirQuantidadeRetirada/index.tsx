// InserirQuantidadeScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store"; 
import { useNavigation, useRoute } from "@react-navigation/native";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function InserirQuantidadeRetirada() {
    const navigation = useNavigation();
    const route = useRoute();
    const { cod_projeto, pecasSelecionadas } = route.params;
    const [quantidades, setQuantidades] = useState({});
    const [userCode, setUserCode] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUser() {
          try {
            const token = await SecureStore.getItemAsync("accessToken");
            if (!token) {
              console.error("Nenhum token encontrado!");
            }
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/usuarios/me`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
            });
    
            const responseText = await response.text();
            const data = JSON.parse(responseText);

            if (!response.ok) throw new Error(data.error || "Erro desconhecido");
            setUserCode(data.cod_user);
          } catch (error: any) {
            console.error("Erro ao buscar usuário:", error.message);
            // logout()
          }
        }
        fetchUser();
      }, []);

      async function handleConfirmar() {
        if (loading) return;
        setLoading(true);

        try {
            const token = await SecureStore.getItemAsync("accessToken");

            // Verifica se há peças com quantidade inválida
            const podeRetirar = pecasSelecionadas.filter(retirada => {
                const quantidade = Number(quantidades[retirada.cod_peca] || 0);
                return quantidade <= 0;
            });

            if (podeRetirar.length > 0) {
                const nomesPecas = podeRetirar.map(peca => peca.nome || `Peça ${peca.cod_peca}`).join(", ");
                Alert.alert("Erro", `Insira as quantidades para as peças: ${nomesPecas}`);
                return;
            }

            const dataPegou = new Date();
            const dataFormatada = new Date(dataPegou.getTime() - dataPegou.getTimezoneOffset() * 60000)
                .toISOString();


            const retiradas = pecasSelecionadas.map(peca => {
                const quantidade = Number(quantidades[peca.cod_peca] || 0);
                return {
                    cod_projeto,
                    cod_peca: Number(peca.cod_peca),
                    cod_user: Number(userCode),
                    quantidade: quantidade,
                    data_pegou: dataFormatada
                };
            }).filter(retirada => retirada.quantidade > 0);


            await Promise.all(retiradas.map(async (retirada) => {
                await fetch(`${process.env.EXPO_PUBLIC_API_URL}/pegou_peca/retirada`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
                    },
                    body: JSON.stringify(retirada),
                });
            }));

            Alert.alert("Sucesso", "Peças retiradas!");
            navigation.replace("Projetos");
        } catch (error) {
            console.error("Erro ao retirar peça:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
    <FlatList
        data={pecasSelecionadas}
        keyExtractor={(item) => item.cod_peca.toString()}
        renderItem={({ item }) => (
            <View style={styles.pecaCard}>
                <Text>{item.nome}</Text>
                <Text>Disponível: {item.quantidade_disponivel}</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Quantidade"
                    onChangeText={(text) => {
                        const valor = Number(text) || 0;

                        if (valor > item.quantidade_disponivel) {
                            Alert.alert(
                                "Quantidade acima do permitido.",
                                `Máximo disponível para esse projeto: ${item.quantidade_disponivel}`
                            );
                        } else {
                            setQuantidades({ ...quantidades, [item.cod_peca]: valor.toString() });
                        }
                    }}
                    value={quantidades[item.cod_peca] || ""}
                />
            </View>
        )}
    />

    <TouchableOpacity
        style={[styles.botao, loading && styles.botaoDesabilitado]}
        onPress={handleConfirmar}
        disabled={loading} // Desativa o botão enquanto carrega
    >
        {loading ? (
            <Text style={styles.botaoTexto}> 
                Aguarde...              
            </Text>
        ) : (
            <Text style={styles.botaoTextoCar}> 
                Retirar Peças
            </Text>
        )}        
    </TouchableOpacity>
</View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    pecaCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selecionada: {
        backgroundColor: "#cce5ff",
    },
    pecaNome: {
        fontSize: 16,
        fontWeight: "bold",
    },
    botao: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    botaoTexto: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    botaoTextoCar: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    botaoDesabilitado: {
        backgroundColor: "#ccc", // Cor mais clara para indicar desativado
    }
});
