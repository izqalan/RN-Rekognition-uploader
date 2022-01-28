import React, { useState, useEffect, useRef } from 'react';
import { AppRegistry, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'expo-camera';
import AWS from 'aws-sdk';
import config from '../lib/aws-config';
import Toast from 'react-native-toast-message';
import { Buffer } from "buffer"
import { Modal, Portal, Button, Provider } from 'react-native-paper';
import { supabase } from '../lib/initSupabase';

export default function CameraScreen({ route, navigation }) {

  const { userId } = route.params;

  AWS.config.update({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
  });
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: 'white', padding: 20, margin: 20 };

  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const takePicture = async () => {
    showModal();
    if (cameraRef) {
      const options = { quality: 1, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      const buffer = new Buffer.from(data.base64, 'base64');

      try {
        if (userId !== null || userId !== undefined) {
          const rekognition = new AWS.Rekognition();
          // index faces
          const params = {
            CollectionId: 'uniten-faces',
            DetectionAttributes: [],
            ExternalImageId: userId,
            Image: {
              Bytes: buffer,
            },
          };
          const result = await rekognition.indexFaces(params).promise().then(() => {
            supabase
              .from('users')
              .update({ imageUploaded: true })
              .eq('id', userId)
              .single().then(() => {
                Toast.show({
                  type: 'success',
                  text1: 'Successfully indexed face',
                  text2: 'Upload successful',
                  visibilityTime: 3000,
                });
              })
          });
          hideModal();
        }
      } catch (error) {
        console.log(error)
        Toast.show({
          type: 'error',
          text1: 'Uh oh!',
          text2: 'Something went wrong!',
        });
        hideModal();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.front}>
        <Toast />
        <Provider>
          <Portal>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              dismissable={false}
              contentContainerStyle={containerStyle}>
              <Text>Uploading Image...</Text>
            </Modal>
          </Portal>
        </Provider>
        <View style={styles.buttonContainer}>
          <TouchableOpacity disabled={visible} onPress={() => takePicture()} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> Capture </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );

}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});
