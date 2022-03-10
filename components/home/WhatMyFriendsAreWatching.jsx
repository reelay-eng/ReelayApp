import React, { memo, useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native'
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { getFeed } from '../../api/ReelayDBApi';
import { LinearGradient } from 'expo-linear-gradient';
import HomeScreenCardStackImage from '../../assets/images/home/home-screen-cardstack.png';
import { ActionButton } from '../global/Buttons';
import { ReelayThumbnail } from '../titlePage/PopularReelaysRow';

const WhatMyFriendsContainer = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
`
const WhatMyFriendsHeader = styled(ReelayText.H5Bold)`
    padding-left: 15px;
    padding-top: 15px;
    color: white;
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

const WhatMyFriendsAreWatching = ({ navigation }) => {
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
        <WhatMyFriendsContainer>
            <WhatMyFriendsHeader>What my friends are watching</WhatMyFriendsHeader>
            {followingStacks.length === 0 && loadedFollowingStacks && <YouDontFollowAnyUsers navigation={navigation} />}
            {followingStacks.length > 0 && (
                <FollowingRowContainer horizontal>
                    { followingStacks.map((stack, index) => {
                        return (
                            <FollowingElement key={index} onPress={() => goToReelay(index, stack[0].title)} stack={stack}/>
                        )
                    })}
                </FollowingRowContainer>
            )}
        </WhatMyFriendsContainer>
        
    )
}

const FollowingElementContainer = styled.Pressable`
    margin-right: 12px;
    display: flex;
    width: 105px;
`

const FollowingElement = ({ stack, onPress }) => {

    return (
        <FollowingElementContainer onPress={onPress}>
            <ReelayThumbnail reelay={stack[0]} onPress={onPress} />
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

export default WhatMyFriendsAreWatching;