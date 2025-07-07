import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Index() {
  const [image, setImage] = useState<string | null>(null);

  // Función para seleccionar foto de la galería
  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se requiere acceso a tus fotos');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Función para tomar una foto con la cámara
  const takePhotoWithCamera = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      alert('Se requiere acceso a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora de Desperdicio de Alimentos</Text>

      {/* Botones */}
      <TouchableOpacity style={styles.buttonGallery} onPress={pickImageFromGallery}>
        <Text style={styles.buttonText}>Seleccionar Foto de Galería</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonCamera} onPress={takePhotoWithCamera}>
        <Text style={styles.buttonText}>Tomar Foto con la Cámara</Text>
      </TouchableOpacity>

      {/* Imagen seleccionada o capturada */}
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* Resultado del análisis */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          Resultado del análisis aparecerá aquí.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGallery: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonCamera: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  resultContainer: {
    padding: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    width: '100%',
  },
  resultText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
});