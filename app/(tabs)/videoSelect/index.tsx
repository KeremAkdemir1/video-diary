import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function Crop() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
    player.currentTime = 0;
  });
  const moveToPermanentStorage = async (uri: any) => {
    try {
      const fileName = uri.split('/').pop();  
      const newUri = FileSystem.documentDirectory + fileName;

      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });

      console.log(`Dosya başarıyla kopyalandı: ${newUri}`);
      return newUri;
    } catch (error) {
      console.error('Dosya kopyalama hatası:', error);
      return null;
    }
  };
  useEffect(() => {
    (async () => {
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(mediaStatus.status === 'granted');
    })();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      setVideoUri('')
      setRecording(false)
    }, [])
  );


  const startRecording = async () => {
    if (cameraRef) {
      setRecording(true);
      const video = await cameraRef.recordAsync();
      setVideoUri(video.uri);
    }
  };

  const stopRecording = () => {
    if (cameraRef) {
      cameraRef.stopRecording();
      setRecording(false);
    }
  };

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled) {
      const permanentUri = await moveToPermanentStorage(result.assets[0].uri);
      if (permanentUri) {
        setVideoUri(permanentUri);
      }
    }
  };

  if (hasMediaPermission === null) {
    return <Text>Loading...</Text>;
  }
  if (hasMediaPermission === false) {
    return <Text>No access to camera or media library</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {videoUri ? (
          <View style={styles.videoContainer}>
            <VideoView style={styles.video} player={player} nativeControls={true} />
          </View>
        ) : (
          <View style={styles.videoContainer}>
            <Ionicons name="image" size={70} color={'#a6a6a6'} />
            <Text style={{ marginTop: 30 }}>Add a Video From Device</Text>
          </View>
        )}

      </View>

      <View style={styles.grid}>
        <Pressable style={styles.button} onPress={pickVideo}>
          <Text style={styles.flipButtonText}>Select Video</Text>
        </Pressable>
        {/* {recording ? (
          <Pressable style={styles.stopButton} onPress={stopRecording}>
            <Text style={styles.nextButtonText}>Stop Recording</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.startButton} onPress={startRecording}>
            <Text style={styles.nextButtonText}>Start Recording</Text>
          </Pressable>
        )}

        <Pressable style={styles.flipButton} onPress={() => setType(type === 'back' ? 'front' : 'back')}>
          <Text style={styles.flipButtonText}>Flip Camera</Text>
        </Pressable> */}
        <Pressable disabled={videoUri == '' || videoUri == null ? true : false} style={styles.nextButton} onPress={() => {

        }}>
          <Text style={styles.nextButtonText} onPress={() => {
            router.push({
              pathname: '/cropVideo',
              params: {
                uri: encodeURIComponent(videoUri!),
              },
            });
          }}>Crop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dotted',
    width: '90%',
    height: '50%',
    borderColor: '#a6a6a6',
  },
  camera: {
    flex: 1
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  video: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    margin: 20
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#FECB10',
    marginTop: 30,
    margin: 10,
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#67C5B5',
    marginTop: 30,
    margin: 10,
  },
  nextButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#67C5B5',
    marginTop: 30,
    margin: 10,
  },
  stopButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#FF0606',
    marginTop: 30,
    margin: 10,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
  },
  flipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#FF9900',
    marginTop: 30,
    margin: 10,
  },
  flipButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});
