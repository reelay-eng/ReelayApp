import React, { useEffect, useState, useRef, useContext, memo, useCallback } from 'react';
import { ActivityIndicator, Dimensions, Image, Pressable, SafeAreaView, View, Text } from 'react-native';
import { Icon } from 'react-native-elements';
import Constants from 'expo-constants';

import BackButton from '../../components/utils/BackButton';
import SearchField from '../../components/create-reelay/SearchField';
import WatchlistItem from '../../components/watchlist/WatchlistItem';
import { AuthContext } from '../../context/AuthContext';

import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

import { getRuntimeString } from '../../components/utils/TitleRuntime';
import { ScrollView } from 'react-native-gesture-handler';
import { sendRecommendation } from '../../api/WatchlistApi';
import { showMessageToast } from '../../components/utils/toasts';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const ReelayIcon = require('../../assets/icons/reelay-icon.png');

const MAX_FOLLOWERS_TO_SEND = 5;

const TitleHeader = ({ navigation, watchlistItem, followersToSend }) => {
    const SendIconPressable = styled(Pressable)`
        align-items: center;
        justify-content: center;
        padding-right: 10px;
    `
    const ImageContainer = styled(View)`
        flex-direction: row;
        align-items: center;
        margin-right: 20px;
        margin-bottom: 10px;
    `
    const TitleText = styled(ReelayText.H6)`
        color: white
        font-size: 22px;
        margin-bottom: 6px;
    `
    const TitleLineContainer = styled(View)`
        flex: 1;
        justify-content: center;
        align-items: flex-start;
    `;
    const TitleHeaderPressable = styled(Pressable)`
        flex-direction: row;
        margin-left: 50px;
        margin-right: 20px;
        margin-top: 10px;
        margin-bottom: 10px;
    `
    const ActorText = styled(ReelayText.Subtitle1)`
        color: gray
        font-size: 16px;
    `
    const YearText = styled(ReelayText.Subtitle1)`
        color: gray
    `

    const { title } = watchlistItem;
    const color = (followersToSend.current.length === 0) ? 'gray' : '#497afc';
    const runtimeString = getRuntimeString(title?.runtime);

    const advanceToTitleScreen = () => {
        navigation.push('TitleDetailScreen', { titleObj: title });
    }

    const sendRecommendationsToFollowers = async () => {
        console.log("sending rec!");
        console.log('followers to send: ', followersToSend.current);
        const sendRecResults = await Promise.all(followersToSend.current.map(async (followObj) => {
            return await sendRecommendation({ 
                reqUserSub: followObj.creatorSub,
                sendToUserSub: followObj.followerSub,
                tmdbTitleID: watchlistItem.tmdbTitleID,
                titleType: watchlistItem.titleType,
            });
        }));
        showMessageToast('Recommendation sent!');
    }

    return (
        <TitleHeaderPressable onPress={advanceToTitleScreen}>
            <ImageContainer>
                { title?.posterSource && (
                    <Image
                        source={title?.posterSource}
                        style={{ height: 90, width: 60, borderRadius: 6 }}
                        PlaceholderContent={<ActivityIndicator />}
                    />
                )}
                { !title.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
            </ImageContainer>
            <TitleLineContainer>
                <TitleText>{title.display}</TitleText>
                <YearText>{`${title.releaseYear}    ${runtimeString}`}</YearText>
            </TitleLineContainer>
            <SendIconPressable onPress={sendRecommendationsToFollowers}>
                <Icon type='ionicon' name='paper-plane' size={30} color={color} />
            </SendIconPressable>
        </TitleHeaderPressable>
    )
}

const FollowerRow = ({ followObj, isMarkedToSend, markFollowerToSend, unmarkFollowerToSend }) => {
    const RowContainer = styled(View)`
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: space-between;
        padding: 6px;
        padding-left: 20px;
        padding-right: 20px;
        border-bottom-color: #505050;
        border-bottom-width: 0.3px;    
    `
    const UserInfoContainer = styled(View)`
        flex-direction: row;
    `
    const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
        color: ${(props) => (props.disabled) ? 'gray' : 'white' };
    `
    const UsernameContainer = styled(View)`
        align-items: flex-start;
        justify-content: center;
    `

    const { followerSub, followerName } = followObj;
    const photoCurrentS3Key = `profilepic-${followerSub}-current.jpg`;
    const profilePicURI = `${CLOUDFRONT_BASE_URL}/public/${photoCurrentS3Key}`;

    return (
        <RowContainer>
            <UserInfoContainer>
                <ProfilePicture profilePicURI={profilePicURI}/>
                <UsernameContainer>
                    <UsernameText>{followerName}</UsernameText>
                </UsernameContainer>
            </UserInfoContainer>
            <ToSendBox 
                followObj={followObj} 
                followerIsMarkedToSend={isMarkedToSend} 
                markFollowerToSend={markFollowerToSend} 
                unmarkFollowerToSend={unmarkFollowerToSend}
            />
        </RowContainer>
    )
}

const ToSendBox = ({ followObj, followerIsMarkedToSend, markFollowerToSend, unmarkFollowerToSend }) => {
    const MarkToSendPressable = styled(Pressable)`
        padding: 10px;
    `

    const [markedToSend, setMarkedToSend] = useState(followerIsMarkedToSend);
    const iconName = (markedToSend) ? 'checkbox-outline' : 'square-outline';

    const markBox = () => {
        if (markedToSend) {
            const isMarked = unmarkFollowerToSend(followObj);
            setMarkedToSend(isMarked);
        } else {
            const isMarked = markFollowerToSend(followObj);
            setMarkedToSend(isMarked);    
        }
    };

    return (
        <MarkToSendPressable onPress={markBox}>
            <Icon type='ionicon' name={iconName} size={30} color='white' />
        </MarkToSendPressable>
    );
}

const ProfilePicture = React.memo(({ profilePicURI }) => {
    const ProfileImage = styled(Image)`
        border-radius: 16px;
        border-width: 1px;
        border-color: white;
        height: 32px;
        width: 32px;
    `;
    const ProfilePictureContainer = styled(View)`
        margin: 10px;
    `;

    return (
        <ProfilePictureContainer>
            <ProfileImage
                style={{ zIndex: 2 }}
                source={{ uri: profilePicURI }}
            />
            <ProfileImage
                style={{ position: 'absolute', zIndex: 1 }}
                source={ReelayIcon}
            />
        </ProfilePictureContainer>
    );
});

const StatusBar = ({ navigation, headerText, subheaderText }) => {
    const BackButtonContainer = styled(View)`
        margin-right: 10px;
    `
    const HeaderText = styled(ReelayText.H6Emphasized)`
        color: white;
        margin-left: 10px;
    `
    const SubheaderText = styled(ReelayText.Body2)`
        color: white;
        margin-left: 10px;
        `
    const TopBarContainer = styled(View)`
        align-items: center;
        width: 100%;
        display: flex;
        flex-direction: row;
        margin: 10px;
    `
    return (
        <TopBarContainer>
            <BackButtonContainer>
                <BackButton navigation={navigation} />
            </BackButtonContainer>
            <HeaderText>{headerText}</HeaderText>
        </TopBarContainer>
    );
}

const FollowerSearch = () => {
    const [searchText, setSearchText] = useState('');

    return (
        <SearchField
            borderRadius={4}
            searchText={searchText}
            updateSearchText={setSearchText}
            placeholderText={`Search followers...`} />
    );
}

const FollowerList = memo(({ getFollowersToSend, markFollowerToSend, unmarkFollowerToSend }) => {
    const ScrollViewContainer = styled(ScrollView)`
        margin-bottom: 60px;
    `
    const { myFollowers } = useContext(AuthContext);
    const sortByFollowerName = (followObj0, followObj1) => {
        return followObj0.followerName > followObj1.followerName;
    };

    return (
        <React.Fragment>
            <FollowerSearch />
            <ScrollViewContainer>
                { myFollowers.sort(sortByFollowerName).map((followObj, index) => {
                    const isMarkedToSend = getFollowersToSend().find((nextFollowObj) => {
                        return (nextFollowObj.followerSub === followObj.followerSub);
                    });

                    return <FollowerRow key={index} 
                        followObj={followObj}
                        isMarkedToSend={isMarkedToSend}
                        markFollowerToSend={markFollowerToSend}
                        unmarkFollowerToSend={unmarkFollowerToSend}
                    />;
                })}
            </ScrollViewContainer>
        </React.Fragment>
    );
});

const RecScreenContainer = styled(SafeAreaView)`
    background-color: black;
    height: 100%;
    width: 100%;
`

export default SendRecScreen = ({ navigation, route }) => {
    const { watchlistItem } = route.params;
    const followersToSend = useRef([]);
    const [readyToSend, setReadyToSend] = useState(followersToSend.current > 0);

    const getFollowersToSend = useCallback(() => {
        return followersToSend.current;
    }, []);

    const markFollowerToSend = useCallback((followObj) => {
        followersToSend.current.push(followObj);
        if (!readyToSend) {
            setReadyToSend(true);
        }
        return true;
    }, []);

    const unmarkFollowerToSend = useCallback((followObj) => {
        followersToSend.current = followersToSend.current.filter((nextFollowObj) => {
            return followObj.followerSub !== nextFollowObj.followerSub;
        });
        if (!followersToSend.current.length) {
            setReadyToSend(false);
        }
        return false; // isMarked
    }, []);

    const headerText = `Send to a friend`;
    const subheaderText = `You can send up to ${MAX_FOLLOWERS_TO_SEND} recs at a time`;

    return (
		<RecScreenContainer>
            <StatusBar
                navigation={navigation} 
                headerText={headerText} 
                subheaderText={subheaderText}
            />
            <TitleHeader 
                navigation={navigation} 
                followersToSend={followersToSend}
                watchlistItem={watchlistItem}
            />
            <FollowerList 
                getFollowersToSend={getFollowersToSend}
                markFollowerToSend={markFollowerToSend}
                unmarkFollowerToSend={unmarkFollowerToSend}
            />
        </RecScreenContainer>
    );
}
