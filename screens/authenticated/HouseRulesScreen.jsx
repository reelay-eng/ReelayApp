import React from 'react';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import HouseRules from '../../components/global/HouseRules';
import BackButton from '../../components/utils/BackButton';

const { width } = Dimensions.get('window');

const BackButtonContainer = styled(View)`
    left: 10px;
    position: absolute;
`
const ScreenView = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    margin-top: ${props => props.topOffset}px;
    padding-left: 20px;
    padding-right: 20px;
    width: 100%;
`
const Spacer = styled(View)`
    height: 50px;
`

export default HouseRulesScreen = ({ navigation, route }) => {
    const topOffset = useSafeAreaInsets().top;
    return (
        <ScreenView topOffset={topOffset}>
            <BackButtonContainer topOffset={topOffset}>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
            <Spacer />
            <HouseRules />
        </ScreenView>
    )
}