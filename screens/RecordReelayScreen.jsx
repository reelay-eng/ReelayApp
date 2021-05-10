import React, { useState, useEffect } from 'react';
import { AppRegistry, StyleSheet, Text, TouchableOpacity, Platform, View  } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from 'ionicons';

import EditScreenInfo from '../components/EditScreenInfo';

function moveToBottom(component) {
  return (
    <View style={styles.bottomRow}>
      {component}
    </View>
  )
}

export default function RecordReelayScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [recording, setRecording] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} 
              type={type} 
              ref={ref => {setCameraRef(ref);}}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={styles.text}> Flip </Text>
            {/* <Ionicons name={ Platform.OS === 'ios' ? "ios-reverse-camera" : 'md-reverse-camera'} size={40} color="white" /> */}
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContainer} onPress={ async() => {
              if(!recording){
                setRecording(true);
              let video = await cameraRef.recordAsync({
                maxDuration: 15
              });
              console.log('video', video);
            } else {
                setRecording(false);
                cameraRef.stopRecording();
                console.log('recording stopped');
            }
          }}>
            <View style={styles.recordButtonOuterRing} >
              <View style={styles.recordButtonInnerRing} />
            </View>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  bottomRow: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 24
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    marginBottom: 24,
    alignItems: 'center'
  },
  flipButton: {
    flex: 0.1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  text: {
    flex: 1,
    fontSize: 18,
    color: 'white',
    marginBottom: 24
  },
  recordButtonInnerRing: {
    borderWidth: 2,
    borderRadius:25,
    borderColor: 'red',
    height: 40,
    width:40,
    backgroundColor: 'red'
  },
  recordButtonOuterRing: {
    borderWidth: 2,
    borderRadius:25,
    borderColor: 'red',
    height: 50,
    width:50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
