import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/global';

/**
  * ScanReceiptScreen
 * Three states, driven by two pieces of local state:
 *   1. Permission not granted  -> ask for camera access
 *   2. capturedUri === null    -> show live camera + guide frame
 *   3. capturedUri set         -> show review (retake / use photo)
 */

export default function ScanReceiptScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleGrantAccess = async () => {
  console.log('Before request:', permission);
  const result = await requestPermission();
  console.log('After request:', result);
};
  // Permission status hasn't resolved yet (first render).
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Loading camera…</Text>
      </View>
    );
  }

  // User hasn't granted camera access (or denied it previously).
  if (!permission.granted) {
  return (
    <View style={styles.center}>
      <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.permissionText}>
        We need camera access to scan receipts.
      </Text>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={() => {
          if (permission.canAskAgain) {
            requestPermission();
          } else {
            // OS won't show the prompt again — only the Settings app can change it now.
            Linking.openSettings();
          }
        }}
      >
        <Text style={styles.permissionButtonText}>
          {permission.canAskAgain ? 'Grant Camera Access' : 'Open Settings'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo) setCapturedUri(photo.uri);
  };


  // Covers "I have an existing photo of this old receipt already in my camera roll" — directly serves the "receipts issued before the app existed" without requiring a re-shoot.
  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCapturedUri(result.assets[0].uri);
    }
  };

  const handleRetake = () => setCapturedUri(null);

  const handleUsePhoto = () => {
    // Hand the captured image off to create-receipt as a route param.
    router.push({ pathname: '/create-receipt', params: { photoUri: capturedUri } });
  };

  // ---- Review step ----
  if (capturedUri) {
    return (
      <View style={styles.container}>
        <View style={styles.reviewHeader}>
          <TouchableOpacity onPress={handleRetake} style={styles.backRow}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
            <Text style={styles.backText}>Retake</Text>
          </TouchableOpacity>
        </View>
        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="contain" />
        <View style={styles.reviewActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleUsePhoto}>
            <Text style={styles.primaryButtonText}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---- Camera step ----
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
            <Text style={styles.backTextLight}>Back Home</Text>
          </TouchableOpacity>
        </View>

    
        <View style={styles.guideFrame} pointerEvents="none" />

        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePickFromGallery} style={styles.sideButton}>
            <Ionicons name="images-outline" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCapture} style={styles.shutterOuter}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View style={styles.sideButton} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: colors.backgroundLight,
  },
  permissionText: { textAlign: 'center', color: colors.textSecondary, fontSize: 15 },
  permissionButton: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: { color: '#fff', fontWeight: '600' },
  cameraHeader: {
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  reviewHeader: {
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 16, color: colors.text },
  backTextLight: { fontSize: 16, color: '#fff' },
  guideFrame: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    right: '10%',
    bottom: '22%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  sideButton: { width: 26, alignItems: 'center' },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  preview: { flex: 1, backgroundColor: '#000' },
  reviewActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: colors.background,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
  },
  secondaryButtonText: { color: colors.text, fontWeight: '600' },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderColor: colors.text,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
});
