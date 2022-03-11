import React, { useState, useRef, useContext, memo, useCallback, useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Constants from 'expo-constants';

import BackButton from '../../components/utils/BackButton';
import SearchField from '../../components/create-reelay/SearchField';
import { ReelayedByLine } from '../../components/watchlist/RecPills';
import { AuthContext } from '../../context/AuthContext';

import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

import { getRuntimeString } from '../../components/utils/TitleRuntime';
import { ScrollView } from 'react-native-gesture-handler';
import { sendRecommendation, getSentRecommendations } from '../../api/WatchlistApi';
import { showMessageToast } from '../../components/utils/toasts';
import { notifyOnSendRec } from '../../api/WatchlistNotifications';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import ReelayColors from '../../constants/ReelayColors';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const ReelayIcon = require('../../assets/icons/reelay-icon.png');

const TitleHeader = ({ navigation, readyToSend, reelay, sendRecs, watchlistItem }) => {
    const ImageContainer = styled(View)`
        flex-direction: row;
        align-items: center;
        margin-right: 20px;
    `
    const ReelayedByLineWrapper = styled(View)`
        flex-direction: row;
        margin-left: 20px;
        margin-right: 30px;
    `
    const SendIconPressable = styled(Pressable)`
        align-items: center;
        background-color: ${readyToSend ? ReelayColors.reelayBlue : 'gray' };
        border-radius: 35px;
        justify-content: center;
        height: 70px;
        padding: 20px;
    `
    const TitleText = styled(ReelayText.Subtitle1)`
        color: white
    `
    const TitleLineContainer = styled(View)`
        flex: 1;
        justify-content: center;
        align-items: flex-start;
    `;
    const TitleHeaderPressable = styled(Pressable)`
        align-items: center;
        flex-direction: row;
        margin-left: 20px;
        margin-right: 20px;
        margin-top: 10px;
        margin-bottom: 10px;
    `
    const YearText = styled(ReelayText.Subtitle2)`
        color: gray
    `
    const { title } = watchlistItem;
    const runtimeString = getRuntimeString(title?.runtime);

    const advanceToTitleScreen = () => {
        navigation.push('TitleDetailScreen', { titleObj: title });
    }

    return (
        <React.Fragment>
            <TitleHeaderPressable onPress={advanceToTitleScreen}>
                <ImageContainer>
                    <Image
                        source={title?.posterSource}
                        style={{ height: 90, width: 60, borderRadius: 6 }}
                        PlaceholderContent={<ActivityIndicator />}
                    />
                </ImageContainer>
                <TitleLineContainer>
                    <TitleText>{title.display}</TitleText>
                    <YearText>{`${title.releaseYear}    ${runtimeString}`}</YearText>
                </TitleLineContainer>
                <SendIconPressable onPress={sendRecs}>
                    <Icon type='ionicon' name='paper-plane' size={30} color={'white'} />
                </SendIconPressable>
            </TitleHeaderPressable>
            { watchlistItem.recommendedReelaySub && 
                <ReelayedByLineWrapper>
                    <ReelayedByLine navigation={navigation} watchlistItem={watchlistItem} />
                </ReelayedByLineWrapper>        
            }
        </React.Fragment>
    )
}

const FollowerRow = ({ 
    navigation,
    followObj, 
    hasAlreadySent, 
    hasMarkedToSend, 
    markFollowToSend, 
    unmarkFollowToSend,
}) => {
    const [markedToSend, setMarkedToSend] = useState(hasMarkedToSend);
    const backgroundColor = (markedToSend) ? ReelayColors.reelayBlue : 'black';
    const iconName = (hasAlreadySent) ? 'checkmark-done' : 'checkmark';
    const iconColor = (hasAlreadySent) ? 'gray' : 'white';

    const CheckmarkIconContainer = styled(View)`
        align-items: center;
        justify-content: center;
    `
    const RowContainer = styled(Pressable)`
        display: flex;
        align-items: center;
        background-color: ${backgroundColor};
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
        color: ${() => (hasAlreadySent) ? 'gray' : 'white' };
    `
    const UsernameContainer = styled(View)`
        align-items: flex-start;
        justify-content: center;
    `

    const { followSub, followName } = followObj;
    const photoCurrentS3Key = `profilepic-${followSub}-current.jpg`;
    const profilePicURI = `${CLOUDFRONT_BASE_URL}/public/${photoCurrentS3Key}`;

    const creator = { sub: followSub, username: followName };
    const advanceToUserProfile = () => {
        navigation.push('UserProfileScreen', { creator });
    }
    
    const markRow = () => {
        if (hasAlreadySent) return;
        if (markedToSend) {
            const isMarked = unmarkFollowToSend(followObj);
            setMarkedToSend(isMarked);
        } else {
            const isMarked = markFollowToSend(followObj);
            setMarkedToSend(isMarked);    
        }
    }

    return (
        <RowContainer onPress={markRow}>
            <UserInfoContainer>
                <ProfilePicture profilePicURI={profilePicURI}/>
                <UsernameContainer>
                    <UsernameText>{followName}</UsernameText>
                </UsernameContainer>
            </UserInfoContainer>
            { (markedToSend || hasAlreadySent) && (
                <CheckmarkIconContainer>
                    <Icon type='ionicon' name={iconName} size={30} color={iconColor} />
                </CheckmarkIconContainer>                        
            )}
        </RowContainer>
    )
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

const StatusBar = ({ navigation }) => {
    const BackButtonContainer = styled(View)`
        margin-right: 10px;
    `
    const HeaderText = styled(ReelayText.H6Emphasized)`
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
            <HeaderText>{`Send to a friend`}</HeaderText>
        </TopBarContainer>
    );
}

// These need to be declared outside of the search field
// component, or else the keyboard will keep popping up and down
const SearchFieldContainer = styled(View)`
    margin-left: 10px;
`
const FollowerSearch = ({ updateSearch }) => {
    const [searchText, setSearchText] = useState('');

    const updateSearchText = (newSearchText) => {
        if (searchText !== newSearchText) {
            setSearchText(newSearchText);
            updateSearch(newSearchText);
        }
    }
    return (
        <SearchFieldContainer>
        <SearchField
            borderRadius={4}
            searchText={searchText}
            updateSearchText={updateSearchText}
            placeholderText={`Search followers and following...`} />
        </SearchFieldContainer>
    );
}

const FollowerList = memo(({ 
    navigation,
    getFollowsToSend, 
    markFollowToSend, 
    unmarkFollowToSend,
    watchlistItem,
}) => {
    const ScrollViewContainer = styled(ScrollView)`
        margin-bottom: 60px;
    `
    const { reelayDBUser, myFollowing, myFollowers } = useContext(AuthContext);
    const priorRecs = useRef([]);

    const iAmFollowing = (followObj) => (followObj.followerName === reelayDBUser?.username);
    const getFollowName = (followObj) => iAmFollowing(followObj) ? followObj.creatorName : followObj.followerName;
    const getFollowSub = (followObj) => iAmFollowing(followObj) ? followObj.creatorSub : followObj.followerSub;
    const sortByFollowName = (followObj0, followObj1) => (followObj0.followName > followObj1.followName);

    const allFollowsConcat = [...myFollowers, ...myFollowing].map((followObj) => {
        // allows us to treat the object the same whether it's a creator or a follower
        return {
            ...followObj,
            followIsCreator: iAmFollowing(followObj),
            followName: getFollowName(followObj),
            followSub: getFollowSub(followObj),
        }
    });

    const allFollowsUnique = (allFollowsConcat.filter((followObj, index) => {
        // const followUsername = getFollowName(followObj);
        const prevFollowIndex = allFollowsConcat.slice(0, index).findIndex((prevFollowObj) => {
            return (followObj.followName === prevFollowObj.followName);
        });
        return (prevFollowIndex === -1);
    })).sort(sortByFollowName);

    const [displayFollows, setDisplayFollows] = useState(allFollowsUnique);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadPriorRecs = async (watchlistItem) => {
        const fetchedPriorRecs = await getSentRecommendations({
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID: watchlistItem.tmdbTitleID,
            titleType: watchlistItem.titleType,
        });
        priorRecs.current = fetchedPriorRecs;
        setIsLoaded(true);
    }

    const updateSearch = useCallback(async (newSearchText) => {
        if (!newSearchText.length) {
            // setDisplayFollowers(allFollowersSorted);
            setDisplayFollows(allFollowsUnique);
        } else {
            const filteredFollows = allFollowsUnique.filter((followObj) => {
                const cleanedFollowName = followObj.followName.toLowerCase();
                const cleanedSearchText = newSearchText.toLowerCase();
                return cleanedFollowName.indexOf(cleanedSearchText) !== -1;
            });
            const sortedFollows = filteredFollows.sort(sortByFollowName);
            setDisplayFollows(sortedFollows);
        }
    }, []);

    useEffect(() => {
        loadPriorRecs(watchlistItem);
    }, []);
    
    return (
        <React.Fragment>
            <FollowerSearch updateSearch={updateSearch} />
            <ScrollViewContainer>
                { isLoaded && displayFollows.map((followObj, index) => {
                    const hasMarkedToSend = getFollowsToSend().find((nextFollowObj) => {
                        return (nextFollowObj.followSub === followObj.followSub);
                    });

                    const hasAlreadySent = priorRecs.current.find((sentWatchlistItem) => {
                        return sentWatchlistItem.userSub === followObj.followSub;
                    });

                    return <FollowerRow key={index} 
                        navigation={navigation}
                        followObj={followObj}
                        hasMarkedToSend={!!hasMarkedToSend}
                        hasAlreadySent={hasAlreadySent}
                        markFollowToSend={markFollowToSend}
                        unmarkFollowToSend={unmarkFollowToSend}
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
    const { reelayDBUser } = useContext(AuthContext);
    const { reelay, watchlistItem } = route.params; // note: reelay can be null
    const followsToSend = useRef([]);
    const [readyToSend, setReadyToSend] = useState(followsToSend.current > 0);

    const getFollowsToSend = useCallback(() => {
        return followsToSend.current;
    }, []);

    const markFollowToSend = useCallback((followObj) => {
        followsToSend.current.push(followObj);
        if (!readyToSend) {
            setReadyToSend(true);
        }
        return true;
    }, []);

    const unmarkFollowToSend = useCallback((followObj) => {
        followsToSend.current = followsToSend.current.filter((nextFollowObj) => {
            return followObj.followSub !== nextFollowObj.followSub;
        });
        if (!followsToSend.current.length) {
            setReadyToSend(false);
        }
        return false; // isMarked
    }, []);

    const sendRecs = async () => {
        console.log('sending rec!');
        const sendRecResults = await Promise.all(followsToSend.current.map(async (followObj) => {
            const dbResult = await sendRecommendation({ 
                reqUserSub: reelayDBUser?.sub,
                reqUsername: reelayDBUser?.username,
                sendToUserSub: followObj.followSub,
                tmdbTitleID: watchlistItem.tmdbTitleID,
                titleType: watchlistItem.titleType,
                recommendedReelaySub: reelay?.sub,
                recReelayCreatorName: reelay?.creator?.username,
            });

            const notifyResult = await notifyOnSendRec({
                reqUserSub: reelayDBUser?.sub,
                reqUsername: reelayDBUser?.username,
                sendToUserSub: followObj.followSub,
                watchlistItem,
            });

            logAmplitudeEventProd('sendWatchlistRecs', {
                recUsername: reelayDBUser?.username,
                sendToUsername: followObj.followName,
                title: watchlistItem.title.display,
                source: 'sendRecScreen',
            });

            console.log('notify results: ', notifyResult);
            return dbResult;
        }));


        // todo: advance to rec sent page
        console.log('send rec results: ', sendRecResults);
        showMessageToast('Recommendation sent!');
        navigation.goBack();
    }

    return (
		<RecScreenContainer>
            <StatusBar navigation={navigation} />
            <TitleHeader 
                navigation={navigation} 
                watchlistItem={watchlistItem}
                readyToSend={readyToSend}
                reelay={reelay}
                sendRecs={sendRecs}
            />
            <FollowerList 
                navigation={navigation}
                getFollowsToSend={getFollowsToSend}
                markFollowToSend={markFollowToSend}
                unmarkFollowToSend={unmarkFollowToSend}
                watchlistItem={watchlistItem}
            />
        </RecScreenContainer>
    );
}
