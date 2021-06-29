import { Dimensions, StyleSheet } from 'react-native';

const WINDOW_HEIGHT = Dimensions.get("window").height;
const WINDOW_WIDTH = Dimensions.get("window").width;

const AuthStyles = StyleSheet.create({
    backButton: {
        flex: 1,
        alignSelf: 'flex-start',
    },
    submitButton: {
        alignSelf: 'center',
        marginTop: 10,
        width: '75%',
    },
    clearButton: {
        alignSelf: 'center',
        marginTop: 10,
        width: '75%',
    },
    systemText: {
        color: 'white',
        fontFamily: 'System',
    },
    systemTextForm: {
        width: '75%',
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    headerText: {
        flex: 1,
        alignSelf: 'flex-start',
        color: 'white',
        fontFamily: 'System',
    },
    headerTextCentered: {
        flex: 0.4,
        alignSelf: 'center',
        marginTop: 20,
        color: 'white',
        fontFamily: 'System',
    },
    headerView: {
        flex: 0.4, 
        flexDirection: 'row', 
        justifyContent: 'center',
        marginTop: 20,
    },
    input: {
        flex: 1, 
        color: 'white',
        fontFamily: 'System',
    }
});

export default AuthStyles;