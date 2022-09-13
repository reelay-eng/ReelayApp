import React, { Fragment, useContext } from 'react';
import { Image, Pressable, ScrollView, View, Text } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import ReelayThumbnail from '../global/ReelayThumbnail';
import SeeMore from '../global/SeeMore';
import YouDontFollowPrompt from './YouDontFollowPrompt';
import { useSelector } from 'react-redux';

const FriendsAreWatching = ({ navigation }) => {
    const FriendsAreWatchingContainer = styled(View)`
        width: 100%;
        flex-direction: column;
        margin-bottom: 10px;
    `
    const HeaderContainer = styled(View)`
        align-items: flex-end;
        flex-direction: row;
        margin-top: 5px;
    `
    const HeaderText = styled(ReelayText.H5Bold)`
        color: white;
        font-size: 18px;
        margin-left: 12px;
    `
    const FollowingRowContainer = styled(ScrollView)`
        display: flex;
        padding-left: 15px;
        flex-direction: row;
        width: 100%;
        padding-top: 16px;
    `

    const myFollowing = useSelector(state => state.myFollowing);
    const homeFollowingFeed = useSelector(state => state.homeFollowingFeed?.content);

    return (
        <FriendsAreWatchingContainer>
            { myFollowing.length === 0 && <YouDontFollowPrompt navigation={navigation} />}
            { homeFollowingFeed.length > 0 && (
                <Fragment>
                    <HeaderContainer>
                        <HeaderText>{'Following'}</HeaderText>
                    </HeaderContainer>
                    <FollowingRowContainer horizontal showsHorizontalScrollIndicator={false}>
                        { homeFollowingFeed.map((stack, index) =>  {
                            return (
                                <FollowingElement
                                    key={index}
                                    index={index}
                                    navigation={navigation}
                                    stack={stack}
                                    homeFollowingFeed={homeFollowingFeed}
                            />);
                        })}
                    </FollowingRowContainer>
                </Fragment>
            )}
        </FriendsAreWatchingContainer>   
    )
}

const FollowingElementContainer = styled(Pressable)`
    width: 120px;
    margin-right: 12px;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    font-size: 16px;
    margin-top: 10px;
    color: white;
    opacity: 1;
`

const FollowingElement = ({ stack, index, navigation, homeFollowingFeed }) => {
    const goToReelay = (index, titleObj) => {
		navigation.push("FeedScreen", {
            feedSource: 'following',
			initialFeedPos: index,
            preloadedStackList: homeFollowingFeed,
		});
		logAmplitudeEventProd('openFollowingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};

    const { reelayDBUser } = useContext(AuthContext);
    const onPress = () => goToReelay(index, stack[0].title);

    if (index === homeFollowingFeed.length-1) {
        return (
            <FollowingElementContainer>
                <SeeMore 
                    height={180} 
                    onPress={onPress} 
                    reelay={stack[0]} 
                    width={115} 
                />
            </FollowingElementContainer>
        )
    }
    return (
        <FollowingElementContainer>
            <ReelayThumbnail 
                height={180} 
                margin={0}
                onPress={onPress} 
                reelay={stack[0]} 
                width={120} 
            />
            <TitleText numberOfLines={2}>{stack[0].title.display}</TitleText>
        </FollowingElementContainer>
    )
}

export default FriendsAreWatching;