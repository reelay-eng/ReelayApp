import React, { Fragment, useContext } from 'react';
import { Image, Pressable, ScrollView, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import ReelayThumbnail from '../global/ReelayThumbnail';
import SeeMore from '../global/SeeMore';
import YouDontFollowPrompt from './YouDontFollowPrompt';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { getMyStacksFollowingDaily } from '../../redux/reducers';

const FriendsAreWatching = ({ navigation }) => {
    const FriendsAreWatchingContainer = styled(View)`
        width: 100%;
        flex-direction: column;
        margin-bottom: 10px;
    `
    const HeaderContainer = styled(View)`
        align-items: flex-end;
        flex-direction: row;
        margin-left: 15px;
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
    const myStacksFollowing = useSelector(state => state.myHomeContent?.following?.mostRecent);
    const displayStacks = getMyStacksFollowingDaily({ myStacksFollowing });

    return (
        <FriendsAreWatchingContainer>
            { myFollowing.length === 0 && <YouDontFollowPrompt navigation={navigation} />}
            { displayStacks.length > 0 && (
                <Fragment>
                    <HeaderContainer>
                        <Icon type='ionicon' name='people' size={24} color='white' />
                        <HeaderText>{'Friends are watching'}</HeaderText>
                    </HeaderContainer>
                    <FollowingRowContainer horizontal showsHorizontalScrollIndicator={false}>
                        { displayStacks.map((stack, index) =>  {
                            return (
                                <FollowingElement
                                    key={index}
                                    index={index}
                                    navigation={navigation}
                                    stack={stack}
                                    myStacksFollowing={myStacksFollowing}
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

const FollowingElement = ({ stack, index, navigation, myStacksFollowing }) => {
    const goToReelay = (index, titleObj) => {
		navigation.push("FeedScreen", {
			initialFeedPos: index,
            initialFeedSource: 'following',
            preloadedStackList: myStacksFollowing,
		});
		logAmplitudeEventProd('openFollowingFeed', {
			username: reelayDBUser?.username,
            title: titleObj?.display
		});
	};

    const { reelayDBUser } = useContext(AuthContext);
    const onPress = () => goToReelay(index, stack[0].title);

    if (index === myStacksFollowing.length-1) {
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