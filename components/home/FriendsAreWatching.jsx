import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import { getFeed } from '../../api/ReelayDBApi';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreenCardStackImage from '../../assets/images/home/home-screen-cardstack.png';
import { ActionButton } from '../global/Buttons';
import { ReelayThumbnail } from '../titlePage/PopularReelaysRow';
import { VenueIcon } from '../utils/VenueIcon';

const FriendsAreWatching = ({ navigation }) => {
    const FriendsAreWatchingContainer = styled.View`
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
    `
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
        padding-bottom: 10px;
    `
    const { reelayDBUser } = useContext(AuthContext);
    const [followingStacks, setFollowingStacks] = useState([]);
    const [loadedFollowingStacks, setLoadedFollowingStacks] = useState(false);

    useEffect(() => {
        (async () => {
            let nextFollowingStacks = await getFeed({ reqUserSub: reelayDBUser?.sub, feedSource: "following", page: 0 });
            setFollowingStacks(nextFollowingStacks);
            setLoadedFollowingStacks(true);
        })();
    }, []);

    const goToReelay = (index, titleObj) => {
		if (followingStacks.length === 0) return;
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'following',
            isOnFeedTab: false
		});
		logAmplitudeEventProd('openFollowingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};


    return (
        <FriendsAreWatchingContainer>
            <FriendsAreWatchingHeader>{'Friends are watching'}</FriendsAreWatchingHeader>
            {followingStacks.length === 0 && loadedFollowingStacks && <YouDontFollowAnyUsers navigation={navigation} />}
            {followingStacks.length > 0 && (
                <FollowingRowContainer horizontal>
                    { followingStacks.map((stack, index) => <FollowingElement stack={stack} index={index} />)}
                </FollowingRowContainer>
            )}
        </FriendsAreWatchingContainer>
        
    )
}

const FollowingElement = ({ stack, index }) => {
    const TitleText = styled(ReelayText.Caption)`
        color: white;
        font-size: 12px;
        margin-left: 6px;
        text-align: center;
    `
    const TitleRow = styled(View)`
        flex-direction: row;
        justify-content: center;
        width: 100%;
    `
    const FollowingElementContainer = styled(Pressable)`
        margin: 6px;
        display: flex;
        width: 120px;
    `
    const onPress = () => goToReelay(index, stack[0].title);
    const fullTitle = stack[0].title.display;
    const displayTitle = (fullTitle?.length > 13) 
        ? fullTitle.substring(0, 10) + "..."
        : fullTitle;

    console.log('REELAY: ', stack[0]);

    return (
        <FollowingElementContainer key={index}>
            <ReelayThumbnail reelay={stack[0]} onPress={onPress} />
            <TitleRow>
                { stack[0]?.content?.venue &&  <VenueIcon venue={stack[0]?.content?.venue} size={14} /> }
                <TitleText>{displayTitle}</TitleText>
            </TitleRow>
        </FollowingElementContainer>
    )
}

const YouDontFollowContainer = styled.View`
    width: 100%;
    height: auto;
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const YouDontFollowPosters= styled.Image`
    width: 162px;
    height: 156px;
    margin-bottom: -105px;
    margin-left: 15px;
    z-index: 2;
`
const YouDontFollowGradientContainer = styled.View`
    width: 90%;
    height: 273px;
    border-radius: 11px;
    display: flex;
    flex-direction: column;
    align-items: center;
`
const YouDontFollowGradientContentBox = styled.View`
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: auto;
`
const YouDontFollowHeadline = styled(ReelayText.H5Bold)`
    color: white;
    text-align: center;
    margin-bottom: 5px;
`
const YouDontFollowBody = styled(ReelayText.Body1)`
    color: white;
    text-align: center;
    margin-bottom: 30px;
`
const YouDontFollowButtonBox = styled.View`
    width: 95%;
    height: 40px;
    margin-bottom: 15px;
`

const YouDontFollowAnyUsers = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const goToReelayFeed = () => {
        navigation.push("FeedScreen", {
            initialRouteName: 'global',
            initialFeedPos: 0,
            isOnFeedTab: false,
        })
        logAmplitudeEventProd('openGlobalFeedFromHomeScreenPrompt', {
			username: reelayDBUser?.username
		});
    }
    return (
        <YouDontFollowContainer>
            <YouDontFollowPosters source={HomeScreenCardStackImage}/>
            <YouDontFollowGradientContainer>
                <LinearGradient
                    colors={["#272525", "#19242E"]}
                    style={{
                        flex: 1,
                        opacity: 1,
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        borderRadius: `11px`,
                    }}
                /> 
                <YouDontFollowGradientContentBox>
                    <YouDontFollowHeadline>You don't follow any users.</YouDontFollowHeadline>
                    <YouDontFollowBody>Explore the global feed and find other reelayers to follow.</YouDontFollowBody>
                    <YouDontFollowButtonBox>
                        <ActionButton
                            text="Reelay Feed"
                            onPress={goToReelayFeed}
                        />
                    </YouDontFollowButtonBox>
                </YouDontFollowGradientContentBox>
            </YouDontFollowGradientContainer>
        </YouDontFollowContainer>
    )
}

export default FriendsAreWatching;