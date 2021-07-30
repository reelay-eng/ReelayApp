import React, { useContext, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Text } from 'react-native-elements';

import { AuthStyles } from '../../styles';
import Poster from '../view-reelay/Poster';
import { VisibilityContext} from '../../context/VisibilityContext';
import styled from 'styled-components/native';

export default TitleOverlay = ({ navigation }) => {

    const { height, width } = Dimensions.get('window');

    const HeaderRowContainer = styled(View)`
        width: 70%;
        padding: 20px;
    `

    const TitleOverlayContainer = styled(View)`
        position: absolute;
        flex-direction: row;
        width: 100%;
        height: 100%;
    `

    const PosterContainer = styled(View)`
        position: absolute;
        left: ${width * 0.7}px;
        margin-top: 15px;
        width: 30%;
        align-items: flex-end;
    ` 
    const TitleText = styled(Text)`
        font-size: 24px;
        font-family: System;
        color: white;
    `
    const TaglineText = styled(Text)`
        font-size: 15px;
        font-family: System;
        font-weight: 300;
        color: white;
    `

    const visibilityContext = useContext(VisibilityContext);
    const titleObject = visibilityContext.overlayData?.titleObject;

    return (
        <TitleOverlayContainer>
            <HeaderRowContainer>
                <TitleText>{titleObject.title}{titleObject.year}</TitleText>
                <TaglineText>{titleObject.tagline}</TaglineText>
            </HeaderRowContainer>
            <PosterContainer>
                <Poster titleObject={titleObject} showTitle={false} />
            </PosterContainer>
        </TitleOverlayContainer>
    )
};