import React, { useContext } from 'react';
import { UploadContext } from '../../context/UploadContext';
import { getPosterURI } from '../../api/TMDbApi';

import { Dimensions, View, Text, StyleSheet } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';
// import VenueIcon from '../utils/VenueIcon';

const { height, width } = Dimensions.get('window');

const OverlayContainer = styled(View)`
    position: absolute;
    height: 75%;
    width: 75%;
    z-index: 2;
`
export default ReelayPreviewOverlay = () => {

    const uploadContext = useContext(UploadContext);
    const titleObject = uploadContext.uploadTitleObject;
    const posterURI = getPosterURI(titleObject.poster_path);
    // const venue = uploadContext.venueSelected;

    const PreviewPoster = () => {
        const PreviewPosterContainer = styled(View)`
            position: absolute;    
            top: 10px;
            left: ${0.75 * width - 100}px;
        `
        return (
            <PreviewPosterContainer>
                <Image source={{uri: posterURI}} style={{
                    height: 135,
                    width: 90,
                    borderRadius: 6,
                }} />
            </PreviewPosterContainer>
        );
    }

    // const VenueLabel = () => {
    //     const VenueContainer = styled(View)`
    //         flex-direction: row;
    //         justify-content: center;
    //         left: ${0.75 * width - 100}px;
    //         position: absolute;    
    //         top: 155px;
    //         width: 90px;
    //     `
    //     const VenueText = styled(Text)`
    //         font-size: 12px;
    //         font-family: System;
    //         color: white;
    //     `
    //     const textToDisplay = 'Seen on ';
    //     return (
    //         <VenueContainer>
    //             <VenueText>{textToDisplay}</VenueText>
    //             <VenueIcon venue={venue} size={16} />
    //         </VenueContainer>
    //     );
    // }

    return (
        <OverlayContainer>
            <PreviewPoster />
            {/* <VenueLabel /> */}
        </OverlayContainer>
    );
}