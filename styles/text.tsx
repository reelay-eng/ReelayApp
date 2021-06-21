import { StyleSheet } from "react-native";

const TextStyles = StyleSheet.create({
    whiteText: {
        flex: 1,
        fontSize: 18,
        color: 'white',
        marginBottom: 24
    },
    darkText: {
        flex: 1,
        fontSize: 18,
        color: 'black',
        marginBottom: 24
    },
    darkTextCentered: {
        flex: 1,
        fontSize: 18,
        alignSelf: 'center',
        color: 'black',
        marginBottom: 24
    }
});

export default TextStyles;