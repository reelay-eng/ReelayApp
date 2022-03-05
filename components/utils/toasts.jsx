import Toast from "react-native-toast-message";

const showMessageToast = async (message, position = 'top') => {
    Toast.show({
        type: 'info',
        text1: message,
        visibilityTime: 5000,
        position: position,
        bottomOffset: 80, // should eventually change with tabbarvisible?
        topOffset: 70, // should eventually change with tabbarvisible?
    });
}

const showErrorToast = async (message, position = 'top') => {
    Toast.show({
        type: "error",
        text1: message,
        visibilityTime: 5000,
        position: position,
        bottomOffset: 80, 
        topOffset: 70,
    });
}

export { showMessageToast, showErrorToast };