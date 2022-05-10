import React from 'react';
import { Dimensions, Image, SafeAreaView, View } from 'react-native';
import DogWithGlasses from '../../assets/images/dog-with-glasses.png';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

const { height } = Dimensions.get('window');

export default NoTitlesYetPrompt = () => {
    const DogWithGlassesImage = styled(Image)`
        height: 100px;
        width: 100px;
    `
    const DogWithGlassesContainer = styled(View)`
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        width: 100%;
    `
    const ExplainText = styled(ReelayText.Body2)`
        color: white;
        margin-top: 8px;
        margin-bottom: 20px;
        text-align: center;
        width: 75%;
    `
    const HeaderText = styled(ReelayText.H6Emphasized)`
        color: white;
        text-align: center;
    `
    const NoTitlesYetContainer = styled(SafeAreaView)`
        align-items: center;
        justify-content: center;
        height: 100%;
        margin: 10px;
        margin-top: 60px;
    `

    return (
        <NoTitlesYetContainer>
            <DogWithGlassesContainer>
                <DogWithGlassesImage source={DogWithGlasses} />
            </DogWithGlassesContainer>
            <HeaderText>{'Nothing here yet'}</HeaderText>
            <ExplainText>
                {'Add the first title!'}
            </ExplainText>
        </NoTitlesYetContainer>
    );
}