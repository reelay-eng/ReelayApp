import Toast from 'react-native-root-toast';

// todo: should these be _exactly_ the same?

const showMessageToast = async (message, position = 'top') => {
    const toastPosition = (position === 'top') ? Toast.positions.TOP : Toast.positions.BOTTOM;
    const messageToast = Toast.show(message, {
        duration: Toast.durations.LONG,
        position: toastPosition,
        animation: true,
        hideOnPress: true,
        delay: 0,
    });
    setTimeout(() => Toast.hide(messageToast), 5000);
}

const showErrorToast = async (message, position = 'top') => {
    const toastPosition = (position === 'top') ? Toast.positions.TOP : Toast.positions.BOTTOM;
    const errorToast = Toast.show(message, {
        duration: Toast.durations.LONG,
        position: toastPosition,
        animation: true,
        hideOnPress: true,
        delay: 0,
    });
    setTimeout(() => Toast.hide(errorToast), 5000);
}

export { showMessageToast, showErrorToast };