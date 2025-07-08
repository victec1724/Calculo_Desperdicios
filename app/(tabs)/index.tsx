import * as ImagePicker from "expo-image-picker";

import { MaterialIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ImageRecord = {
  id: string;
  uri: string;
  date: string;
  details?: string;
  annotatedImageId?: string;
  detections?: Detection[];
  counts?: Count[];
  weightByType?: WeightByType[];
  totalWeight?: number;
  weightUnit?: string;
};

type Detection = {
  label: string;
  confidence: number;
  bbox: number[];
};

type Count = {
  label: string;
  count: number;
};

type WeightByType = {
  label: string;
  count: number;
  averageWeight: number;
  totalWeight: number;
};

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<ImageRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ImageRecord | null>(
    null
  );

  // Cambia aquí a tu IP local y puerto con protocolo http://
const BACKEND_URL = "http://192.168.100.9:3000/api/detect";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 segundos
    return () => clearTimeout(timer);
  }, []);

  // Guardar registro y devolver el nuevo ID para asociar detalles
  const saveRecord = (uri: string): string => {
    const newRecord: ImageRecord = {
      id: Date.now().toString(),
      uri,
      date: new Date().toLocaleString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord.id;
  };

  // Enviar imagen al backend y guardar detalles en el registro correspondiente
  const sendImageToBackend = async (imageUri: string, recordId: string) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
      // 👇 No pongas 'Content-Type', deja que lo haga automáticamente React Native
    });

    const responseText = await response.text();
    console.log("Código de respuesta:", response.status);
    console.log("Texto devuelto:", responseText);

    if (!response.ok) throw new Error("Error al enviar imagen");

    const data = JSON.parse(responseText); // parseamos ahora manualmente

    console.log("Respuesta del backend (JSON):", data);

    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              details: data.message || "Procesado",
              annotatedImageId: data.annotatedImageId,
              detections: data.detections,
              counts: data.counts,
              weightByType: data.weightByType,
              totalWeight: data.totalWeight,
              weightUnit: data.weightUnit,
            }
          : rec
      )
    );
  } catch (error) {
    console.error("Error en la solicitud:", error);
    alert(`Error al procesar imagen: ${error}`);
  }
};


  // Seleccionar imagen desde galería
  const pickImageFromGallery = async () => {
    setIsLoading(true);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Se requiere acceso a tus fotos");
      setIsLoading(false);
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      const newId = saveRecord(uri);
      await sendImageToBackend(uri, newId);
    }
    setIsLoading(false);
  };

  // Tomar foto con cámara
  const takePhotoWithCamera = async () => {
    setIsLoading(true);
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== "granted") {
      alert("Se requiere acceso a la cámara");
      setIsLoading(false);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      //aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      const newId = saveRecord(uri);
      await sendImageToBackend(uri, newId);
    }
    setIsLoading(false);
  };

  // Abrir modal y mostrar detalles guardados
  const openDetails = (record: ImageRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // Render para cada registro en la lista
  const renderRecord = ({ item }: { item: ImageRecord }) => (
    <View style={styles.recordItem}>
      <Image source={{ uri: item.uri }} style={styles.recordThumbnail} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text numberOfLines={1} style={styles.recordDate}>
          {item.date}
        </Text>
        <Text numberOfLines={1} style={styles.recordUri}>
          {item.uri}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.btnViewDetails}
        onPress={() => openDetails(item)}
      >
        <Text style={styles.btnViewDetailsText}>Ver detalles</Text>
      </TouchableOpacity>
    </View>
  );

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <MaterialIcons name="restaurant" size={64} color="#37474F" />
        <Text style={styles.splashTitle}>Desperdicio de Alimentos</Text>
        <Text style={styles.splashSubtitle}>Cargando aplicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons
          name="restaurant"
          size={28}
          color="white"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.headerTitle}>Desperdicio de Alimentos</Text>
      </View>

      <TouchableOpacity
        style={styles.buttonGallery}
        onPress={pickImageFromGallery}
      >
        <MaterialIcons
          name="folder"
          size={24}
          color="white"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.buttonText}>Seleccionar Foto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonCamera}
        onPress={takePhotoWithCamera}
      >
        <MaterialIcons
          name="photo-camera"
          size={24}
          color="white"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.buttonText}>Tomar Foto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonClear}
        onPress={() => setImage(null)}
      >
        <MaterialIcons
          name="delete"
          size={24}
          color="white"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.buttonClearText}>Quitar Imagen</Text>
      </TouchableOpacity>

      {!image && !isLoading && (
        <Text style={styles.placeholderText}>
          No se ha seleccionado ninguna imagen.
        </Text>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando imagen...</Text>
        </View>
      )}

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Text style={[styles.title, { marginTop: 20 }]}>
        Historial de Imágenes
      </Text>
      {records.length === 0 ? (
        <Text style={styles.placeholderText}>No hay registros guardados.</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderRecord}
          style={{ width: "100%" }}
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            {selectedRecord && (
              <>
                <Image
                  source={{ uri: selectedRecord.uri }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalDate}>
                  Fecha: {selectedRecord.date}
                </Text>

                {selectedRecord.details && (
                  <>
                    <Text style={styles.modalDetails}>
                      {selectedRecord.details}
                    </Text>



                    <Text style={[styles.modalDetails, { fontWeight: "bold" }]}>
                      Peso total: {selectedRecord.totalWeight}{" "}
                      {selectedRecord.weightUnit}
                    </Text>
                  </>
                )}

                <TouchableOpacity
                  style={styles.btnCloseModal}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
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
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  buttonGallery: {
    backgroundColor: "#2E7D32", // Verde profesional
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#37474F", // Gris profesional
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 4,
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonCamera: {
    backgroundColor: "#1565C0", // Azul profesional
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonClear: {
    backgroundColor: "#D32F2F", // Rojo profesional
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonClearText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeholderText: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: "cover",
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 1,
  },
  recordThumbnail: {
    width: 70,
    height: 50,
    borderRadius: 5,
  },
  recordDate: {
    fontWeight: "bold",
    fontSize: 14,
  },
  recordUri: {
    fontSize: 12,
    color: "#555",
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: "contain",
  },
  modalDate: {
    fontSize: 16,
    marginBottom: 15,
  },
  btnCloseModal: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnViewDetails: {
    backgroundColor: "#FF9800",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "center",
    marginLeft: 10,
  },
  btnViewDetailsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalDetails: {
    fontSize: 14,
    color: "#444",
    marginBottom: 15,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#37474F", // Mismo gris del header
    marginTop: 20,
  },
  splashSubtitle: {
    fontSize: 16,
    color: "#777",
    marginTop: 10,
  },
});
