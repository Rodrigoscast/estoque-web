import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const Stack = createStackNavigator();

const fetchProjects = async () => {
    try {
      console.log("Buscando projetos...");
  
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("Token não encontrado!");
        return [];
      }
  
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/projetos?concluidos=false`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log("Dados recebidos:", data);
  
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} - ${data.message || "Erro desconhecido"}`);
      }
  
      return data;
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      return [];
    }
};
  

const ProjectCard = ({ project, onPress }) => {
    const imageUrl = project.imagem && project.imagem !== ""
      ? `${process.env.EXPO_PUBLIC_API_URL}/uploads/${project.imagem}`
      : null;
  
    return (
      <TouchableOpacity style={styles.card} onPress={() => onPress(project)}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.projectImage} />
        ) : (
          <MaterialIcons name="computer" size={80} color="#ccc" />
        )}
        <Text style={styles.cardTitle}>{project.nome}</Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(project.pecas_atuais / project.pecas_totais) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {project.pecas_atuais} / {project.pecas_totais}
        </Text>
      </TouchableOpacity>
    );
};

function HomeScreen() {
    const navigation = useNavigation();
    const [projects, setProjects] = useState([]);
  
    useEffect(() => {
      const loadProjects = async () => {
        const data = await fetchProjects();
        setProjects(data);
      };
      loadProjects();
    }, []);
  
    const handleProjectPress = (project) => {
      alert(`Projeto selecionado: ${project.nome}`);
    };
  
    return (
      <View style={styles.container}>
        <FlatList
          data={projects}
          keyExtractor={(item) => item.cod_projeto.toString()}
          renderItem={({ item }) => (
            <ProjectCard project={item} onPress={handleProjectPress} />
          )}
        />
      </View>
    );
}

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem("token");
              navigation.replace("Login");
            }}
            style={{ marginRight: 15 }}
          >
            <MaterialIcons name="logout" size={24} color="red" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen name="Projetos" component={HomeScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  projectImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  progressBarContainer: {
    width: "100%",
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginTop: 10,
  },
  progressBar: {
    height: 5,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
});