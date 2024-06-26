import { Dimensions, StyleSheet } from 'react-native';

const WINDOW_HEIGHT = Dimensions.get("window").height;
const WINDOW_WIDTH = Dimensions.get("window").width;

const CameraStyles = StyleSheet.create({
    camera: {
      flex: 1,
      height: WINDOW_HEIGHT,
      width: WINDOW_WIDTH,
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
    },
    overlay: {
      ...StyleSheet.absoluteFillObject
    }
  });

  export default CameraStyles;