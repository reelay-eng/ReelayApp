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
        position: absolute;
        left: 30px;
        top: 80px;
    `

    const TitleOverlayContainer = styled(View)`
        position: absolute;
        width: 100%;
        height: 100%;
    `

    const PosterContainer = styled(View)`
        position: absolute;
        left: ${width - 130}px;
        top: 80px;
    `  

    const visibilityContext = useContext(VisibilityContext);
    const titleObject = visibilityContext.overlayData?.titleObject;

    return (
        // <View style={{
        //     width: width,
        //     height: height,
        //     position: 'absolute',
        //     justifyContent: 'space-between',
        // }}>
        <TitleOverlayContainer>
            <HeaderRowContainer>
                <Text h3 style={AuthStyles.headerText}>{titleObject.title}{titleObject.year}</Text>
            </HeaderRowContainer>
            <PosterContainer>
                <Poster titleObject={titleObject} showTitle={false} />
            </PosterContainer>
        </TitleOverlayContainer>
        // </View>
    )
};