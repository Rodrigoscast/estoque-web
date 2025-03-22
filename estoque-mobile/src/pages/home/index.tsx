import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Modal, Alert } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store"; 

const Stack = createStackNavigator();

const fetchProjects = async (navigation) => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    if (!token) {
      console.error("Token não encontrado!");
      navigation.replace("Login");
      return [];
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/projetos?concluidos=false`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await SecureStore.deleteItemAsync("accessToken");
      navigation.replace("Login");
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return [];
  }
};

const fetchSubProjects = async (projectId) => {
  try {
    const token = await SecureStore.getItemAsync("accessToken");
    if (!token) {
      console.error("Token não encontrado!");
      return [];
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/projetos/${projectId}/pecas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar subprojetos:", error);
    return [];
  }
};

const ProjectCard = ({ project, onPress, onLongPress }) => {
  const imageUrl = project.imagem ? `${process.env.EXPO_PUBLIC_API_URL}/uploads/${project.imagem}` : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(project)}
      onLongPress={() => {
        onLongPress(project);
      }}
      delayLongPress={500}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.projectImage} />
      ) : (
        <MaterialIcons name="computer" size={80} color="#ccc" />
      )}
      <Text style={styles.cardTitle}>{project.nome}</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(project.pecas_atuais / project.pecas_totais) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{project.pecas_atuais} / {project.pecas_totais}</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [subProjects, setSubProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const loadProjects = async () => {
        const data = await fetchProjects(navigation);
        setProjects(data);
      };
      loadProjects();
    }, [navigation])
  );

  const handleProjectPress = (project) => {
    navigation.navigate("Escolher Peças Para Produção", { cod_projeto: project.cod_projeto });
  };

  const handleProjectLongPress = async (project) => {
    setSelectedProject(project);
    const subProjectsData = await fetchSubProjects(project.cod_projeto);
    setSubProjects(subProjectsData);
    setModalVisible(true);
  };

  const handleSubProjectPress = (subProject) => {
    setModalVisible(false);
    navigation.navigate("Escolher Peças Para Produção", { cod_projeto: subProject.cod_projeto });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.cod_projeto.toString()}
        renderItem={({ item }) => <ProjectCard project={item} onPress={handleProjectPress} onLongPress={handleProjectLongPress} />}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha um Subprojeto</Text>
            <FlatList
              data={subProjects}
              keyExtractor={(item) => item.cod_projeto.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSubProjectPress(item)}>
                  <Text>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "white", borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalItem: { padding: 10, borderBottomWidth: 1, width: "100%", alignItems: "center" },
  closeButton: { marginTop: 10, padding: 10, backgroundColor: "#ccc", borderRadius: 5 },
});
