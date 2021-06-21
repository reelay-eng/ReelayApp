import { StyleSheet } from 'react-native';

const ContainerStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fillContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',    
    },
    searchPageContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'white',
    },
});

export default ContainerStyles;