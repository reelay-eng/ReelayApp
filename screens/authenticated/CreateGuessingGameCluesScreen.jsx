import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from 'styled-components/native';
import { HeaderWithBackButton } from "../../components/global/Headers";

const ScreenView = styled(View)`
    top: ${props => props.topOffset}px;
`

export default CreateGuessingGameCluesScreen = ({ navigation, route }) => {
    const topOffset = useSafeAreaInsets().top;
    const bottomOffset = useSafeAreaInsets().bottom;
    return (
        <ScreenView topOffset={topOffset}>
            <HeaderWithBackButton navigation={navigation} text={'create guessing game'} />
        </ScreenView>
    )
}