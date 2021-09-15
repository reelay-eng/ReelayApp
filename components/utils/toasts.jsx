import Toast from 'react-native-root-toast';

// todo: should these be _exactly_ the same?

const TOAST_DURATION = 5000; // milliseconds

const showMessageToast = async (message, { 
    // both optional
    duration = TOAST_DURATION, 
    position = 'top' 
}) => {
    const toastPosition = (position === 'top') ? Toast.positions.TOP : Toast.positions.BOTTOM;
    const messageToast = Toast.show(message, {
        duration: Toast.durations.LONG,
        position: toastPosition,
        animation: true,
        hideOnPress: true,
        delay: 0,
    });
    setTimeout(() => Toast.hide(messageToast), duration);
}

const showErrorToast = async (message, { 
    duration = TOAST_DURATION, 
    position = 'top' 
}) => {
    const toastPosition = (position === 'top') ? Toast.positions.TOP : Toast.positions.BOTTOM;
    const errorToast = Toast.show(message, {
        duration: Toast.durations.LONG,
        position: toastPosition,
        animation: true,
        hideOnPress: true,
        delay: 0,
    });
    setTimeout(() => Toast.hide(errorToast), duration);
}

export { showMessageToast, showErrorToast };