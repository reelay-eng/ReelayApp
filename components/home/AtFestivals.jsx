import React, { Fragment, useContext } from 'react';
import { Image, Pressable, View } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import ReelayThumbnail from '../global/ReelayThumbnail';
import { VenueIcon } from '../utils/VenueIcon';
import FestivalsPrompt from './FestivalsPrompt';

export default AtFestivals = ({ navigation }) => {
    const FriendsAreWatchingContainer = styled.View`
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: column;
    `
    const { reelayDBUser } = useContext(AuthContext);
    const { settingsShowFilmFestivals } = reelayDBUser;

    return (
        <FriendsAreWatchingContainer>
            { settingsShowFilmFestivals && <FestivalsPrompt navigation={navigation} /> }
            { !settingsShowFilmFestivals && <FestivalReelaysRow navigation={navigation} /> }
        </FriendsAreWatchingContainer>   
    )
}

const FestivalReelaysRow = ({ navigation }) => {
    const FriendsAreWatchingHeader = styled(ReelayText.H5Bold)`
        color: white;
        font-size: 18px
        padding-left: 15px;
        padding-top: 15px;
    `
    const FollowingRowContainer = styled.ScrollView`
        display: flex;
        padding-left: 15px;
        padding-top: 15px;
        flex-direction: row;
        width: 100%;
        padding-top: 16px;
    `
    const { myStacksAtFestivals } = useContext(AuthContext);
    return (
        <Fragment>
            <FriendsAreWatchingHeader>{'At festivals'}</FriendsAreWatchingHeader>
            <FollowingRowContainer horizontal>
                { myStacksAtFestivals.map((stack, index) =>  {
                    return (
                        <FollowingElement
                            key={index}
                            index={index}
                            navigation={navigation}
                            stack={stack}
                    />);
                })}
            </FollowingRowContainer>
        </Fragment>
    );
}

const FollowingElementContainer = styled(Pressable)`
    display: flex;
    width: 120px;
    margin-right: 12px;
`
const TitleInfoLine = styled(View)`
    flex-direction: row;
    justify-content: space-between;
`
const TitleText = styled(ReelayText.H6Emphasized)`
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
const TitleYear = styled(ReelayText.CaptionEmphasized)`
    margin-top: 8px;
    color: white;
    opacity: 0.5;
`

const FollowingElement = ({ stack, index, navigation }) => {
    const goToReelay = (index, titleObj) => {
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'festivals',
            isOnFeedTab: false
		});
		logAmplitudeEventProd('openFollowingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};

    const { reelayDBUser } = useContext(AuthContext);
    const onPress = () => goToReelay(index, stack[0].title);
    const fullTitle = stack[0].title.display;
    const displayTitle = (fullTitle?.length > 26) 
        ? fullTitle.substring(0, 23) + "..."
        : fullTitle;

    return (
        <FollowingElementContainer>
            <ReelayThumbnail 
                height={180} 
                margin={0}
                onPress={onPress} 
                reelay={stack[0]} 
                width={120} 
            />
            <TitleText>{displayTitle}</TitleText>
            <TitleVenue>
                <VenueIcon venue={stack[0]?.content?.venue} size={24} />
            </TitleVenue>
        </FollowingElementContainer>
    )
}