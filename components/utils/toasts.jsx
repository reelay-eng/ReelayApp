import Toast from 'react-native-root-toast';

// todo: should these be _exactly_ the same?

const showMessageToast = async (message) => {
    const errorToast = Toast.show(message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        animation: true,
        hideOnPress: true,
        delay: 0,
    });
    setTimeout(() => Toast.hide(errorToast), 5000);
}

const showErrorToast = async (message) => {
    const errorToast = Toast.show(message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        animation: true,
        hideOnPress: true,
        delay: 0,
    });
    setTimeout(() => Toast.hide(errorToast), 5000);
}

export { showMessageToast, showErrorToast };