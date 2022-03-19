import React, { useContext } from 'react';
import { View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import StreamingSelector from './StreamingSelector';
import * as ReelayText from '../global/Text';
import { VenueIcon } from '../utils/VenueIcon';

import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';

const ReelayPreviewContainer = styled.Pressable`
    margin-right: 16px;
    display: flex;
    width: 120px;
`
const ReelayPreviewRowContainer = styled.ScrollView`
    display: flex;
    padding-left: 15px;
    padding-top: 15px;
    flex-direction: row;
    width: 100%;
    padding-top: 16px;
    padding-bottom: 10px;
`
const StreamingServicesContainer = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
`
const StreamingServicesHeader = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    padding-left: 15px;
    padding-top: 15px;
`
const TitlePoster = styled.Image`
    width: 120px;
    height: 180px;
    border-radius: 8px;
`
const TitleReleaseYear = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`
const TitleText = styled(ReelayText.H6)`
    font-size: 16px;
    margin-top: 10px;
    color: white;
    opacity: 1;
`
const TitleVenue = styled(View)`
    position: absolute;
    top: 4px;
    right: 4px;
`

export default OnStreaming = ({ navigation }) => {
    const { 
        myStacksOnStreaming,
        myStreamingSubscriptions, 
        reelayDBUser, 
    } = useContext(AuthContext);

    const goToReelay = (index, titleObj) => {
		if (!myStacksOnStreaming?.length) return;

		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'streaming',
            isOnFeedTab: false
		});

		logAmplitudeEventProd('openStreamingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};

    if (!myStreamingSubscriptions?.length) return (
        <StreamingSelector />
    );

    const StreamingRow = () => {
        return (
            <ReelayPreviewRowContainer horizontal>
            { myStacksOnStreaming.map((stack, index) => {
                const onPress = () => goToReelay(index, stack[0]?.title);
                return <StreamingServicesElement key={index} onPress={onPress} stack={stack}/>;
            })}
            </ReelayPreviewRowContainer>
        );
    }
    
    return (
        <StreamingServicesContainer>
            <StreamingServicesHeader>{'On streaming'}</StreamingServicesHeader>
            { myStacksOnStreaming.length > 0 && <StreamingRow /> }
        </StreamingServicesContainer>
    )
};

const StreamingServicesElement = ({ onPress, stack }) => {
    const reelayCount = stack?.length;
    const venue = stack[0]?.content?.venue;
    return (
        <ReelayPreviewContainer onPress={onPress}>
            <TitlePoster source={ stack[0]?.title?.posterSource } />
            <TitleReleaseYear>{stack[0]?.title?.releaseYear}</TitleReleaseYear>
            <TitleText>{stack[0]?.title?.display}</TitleText>
            <TitleVenue>
                <VenueIcon venue={venue} size={24} />
            </TitleVenue>
        </ReelayPreviewContainer>
    )
}
