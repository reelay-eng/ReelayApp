import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { 
    Dimensions,
    FlatList,
    Keyboard, 
    Pressable, 
    SafeAreaView, 
    ScrollView,
    TextInput, 
    TouchableOpacity,
    View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';
import { FlashList } from "@shopify/flash-list";
import Constants from 'expo-constants';

import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import TopicCard from '../../components/topics/TopicCard';
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch, useSelector } from 'react-redux';

import { getTopics, getTopicsByCreator, searchTopics } from '../../api/TopicsApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import ProfilePicture from '../../components/global/ProfilePicture';

const { height, width } = Dimensions.get('window');
const canUseFlashList = (Constants.appOwnership !== 'expo');

const CloseButtonContainer = styled(TouchableOpacity)`
    width: 32px;
`
const CreateTopicButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    margin: 16px;
    margin-left: 14px;
    width: ${width - 32}px;
`
const CreateTopicText = styled(ReelayText.Subtitle2)`
    color: white;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 10px;
    margin-bottom: 16px;
`
const HeaderLeftContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const HeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-top: 4px;
`
const SearchButtonContainer = styled(TouchableOpacity)`
    margin-right: 20px;
`
const ScreenContainer = styled(SafeAreaView)`
    background-color: black;
    justify-content: space-between;
    padding: 16px;
    height: 100%;
    width: 100%;
`
const SearchInput = styled(TextInput)`
    color: white;
    flex: 1;
    flex-direction: row;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    padding: 12px;
`
const SearchIconContainer = styled(View)`
    width: 32px;
`
const SearchInputContainer = styled(View)`
    border-color: white;
    border-radius: 6px;
    border-width: 1px;
    align-items: center;
    display: flex;
    flex-direction: row;
    margin: 16px;
    margin-top: 4px;
    padding-left: 6px;
    padding-right: 6px;
    width: ${width - 32}px;
`
const Spacer = styled(View)`
    width: 8px;
`
const TopicCardContainer = styled(View)`
    margin: 16px;
    margin-bottom: 0px;
`

const SearchBar = ({ resetTopics, searchBarRef, searchTextRef, setSearching, updateSearchResults }) => {
    const onClose = () => {
        setSearching(false);
        resetTopics();
    }
    const updateSearch = (newSearchText) => {
        searchTextRef.current = newSearchText;
        updateSearchResults();
    }
    useEffect(() => searchBarRef.current.focus(), []);

    return (
        <SearchInputContainer>
            <SearchIconContainer>
                <Icon type='ionicon' name='search' color='white' size={24} />
            </SearchIconContainer>
            <SearchInput
                ref={searchBarRef}
                defaultValue={searchTextRef.current}
                placeholder={"Search for topics"}
                placeholderTextColor={'rgba(255,255,255,0.6)'}
                onChangeText={updateSearch}
                onPressOut={Keyboard.dismiss}
                returnKeyLabel="return"
                returnKeyType="default"
            />
            <CloseButtonContainer onPress={onClose}>
                <Icon type='ionicon' name='close' color='white' size={24} />
            </CloseButtonContainer>
        </SearchInputContainer>
    );
}

const TopicScroll = ({ 
    creatorOnProfile,
    initDisplayTopics,
    initNextPage,
    navigation,
    searching,
    setSearching,
    source = 'discover',
}) => {
    const authSession = useSelector(state => state.authSession);
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const [displayTopics, setDisplayTopics] = useState(initDisplayTopics);
    const [extending, setExtending] = useState(false);
    const [nextPage, setNextPage] = useState(initNextPage);
    // const itemHeights = useRef([]);
    const searchTextRef = useRef('');
    const searchCounter = useRef(0);
    const searchBarRef = useRef(null);
    
    const hasReelays = (topic) => topic?.reelays?.length > 0
    const displayTopicsWithReelays = displayTopics.filter(hasReelays);

    const extendScroll = async () => {
        if (searching || extending) return;
        try {
            setExtending(true);
            let nextTopics = [];
            if (source === 'profile') {
                nextTopics = await getTopicsByCreator({
                    creatorSub: creatorOnProfile?.sub,
                    reqUserSub: reelayDBUser?.sub,
                    page: nextPage,
                });
            } else {
                nextTopics = await getTopics({ 
                    authSession, 
                    page: nextPage, 
                    reqUserSub: reelayDBUser?.sub, 
                    source,
                });
            }

            if (nextTopics?.length === 0) return;

            const payload = { nextPage: nextPage + 1 };
            const nextDisplayTopics = [ ...displayTopics, ...nextTopics ];
            setDisplayTopics(nextDisplayTopics);
            setNextPage(nextPage + 1);
            setExtending(false);
            if (source === 'profile' || source === 'search' || searching) return;

            payload[source] = nextDisplayTopics;
            dispatch({ type: 'setTopics', payload });
        } catch (error) {
            console.log(error);
        }
    }

    const resetTopics = () => setDisplayTopics(initDisplayTopics);
    
    const renderTopic = ({ item, index }) => {
        const topic = item;
        const matchTopic = (nextTopic) => (nextTopic.id === topic.id);
        const initTopicIndex = displayTopicsWithReelays.findIndex(matchTopic);
    
        const advanceToFeed = () => {
            if (!topic.reelays?.length) return;
            const feedSource = (searching) ? 'search' : source;
            navigation.push('TopicsFeedScreen', { initTopicIndex, source: feedSource });
            
            logAmplitudeEventProd('openedTopic', {
                clubID: null,
                title: topic.title,
                username: reelayDBUser?.username,
            });
        }

        // const onLayout = ({ nativeEvent }) => {
        //     itemHeights.current[index] = nativeEvent?.layout?.height;
        // }    

        return (
            <TopicCardContainer>
                <TopicCard 
                    advanceToFeed={advanceToFeed}
                    clubID={null}
                    navigation={navigation} 
                    source={source}
                    topic={topic} 
                />
            </TopicCardContainer>
        );
    }

    const updateSearchResults = async () => {
        if (searchTextRef.current?.length === 0) {
            setDisplayTopics(initDisplayTopics);
        }
        
        const currentSearchCounter = ++searchCounter.current;
        const topicSearchResults = await searchTopics({ 
            searchText: searchTextRef.current, 
            page: 0, 
            reqUserSub: reelayDBUser?.sub,
        });

        if (currentSearchCounter === searchCounter.current) {
            setDisplayTopics(topicSearchResults);
        }
    }

    if (canUseFlashList) {
        return (
            <Fragment>
                { searching && <SearchBar 
                    resetTopics={resetTopics}
                    searchBarRef={searchBarRef}
                    searchTextRef={searchTextRef}
                    setSearching={setSearching} 
                    updateSearchResults={updateSearchResults}
                /> }
                <FlashList
                    data={displayTopics}
                    estimatedItemSize={180}
                    onEndReached={extendScroll}
                    onEndReachedThreshold={0.9}
                    renderItem={renderTopic}
                    showsVerticalScrollIndicator={false}
                />
            </Fragment>
        );
    }

    return (
        <View style={{ alignItems: 'center', height: '100%', width: '100%' }}>
            { searching && <SearchBar 
                resetTopics={resetTopics}
                searchBarRef={searchBarRef}
                searchTextRef={searchTextRef}
                setSearching={setSearching} 
                updateSearchResults={updateSearchResults}
            /> }
            <FlatList
                data={displayTopics}
                keyExtractor={topic => String(topic.id)}
                // getItemLayout={getItemLayout}
                onEndReached={extendScroll}
                onEndReachedThreshold={0.9}
                renderItem={renderTopic}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export default TopicsListScreen = ({ navigation, route }) => {
    const [searching, setSearching] = useState(false);
    const source = route.params?.source ?? 'discover';

    const creatorOnProfile = route.params?.creatorOnProfile ?? null;
    const topicsOnProfile = route.params?.topicsOnProfile ?? null;
    const dispatch = useDispatch();

    const discoverTopics = useSelector(state => state.myHomeContent?.discover?.topics);
    const followingTopics = useSelector(state => state.myHomeContent?.following?.topics);

    const discoverTopicsNextPage = useSelector(state => state.myHomeContent?.discover?.topicsNextPage) ?? 1;
    const followingTopicsNextPage = useSelector(state => state.myHomeContent?.following?.topicsNextPage) ?? 1;

    let headerText, initDisplayTopics, initNextPage;
    switch (source) {
        case 'discover':
            headerText = 'Topics';
            initDisplayTopics = discoverTopics ?? [];
            initNextPage = discoverTopicsNextPage ?? 1;
            break;    
        case 'following':
            headerText = 'Topics by friends';
            initDisplayTopics = followingTopics ?? [];
            initNextPage = followingTopicsNextPage ?? 1;
            break;
        case 'profile':
            headerText = `${creatorOnProfile?.username}'s topics`;
            initDisplayTopics = topicsOnProfile;
            initNextPage = 1;
            break;
        case 'search':
            headerText = `Search topics`;
            initDisplayTopics = searchResults;
            initNextPage = 1;
            break;
        default:
            headerText = '';
            initDisplayTopics = [];
            initNextPage = 1;
            break;
    }

    const CreateTopicButton = () => {
        const advanceToCreateTopic = () => navigation.push('CreateTopicScreen');
        return (
            <CreateTopicButtonContainer onPress={advanceToCreateTopic}>
                <CreateTopicText>
                    {'Start a new topic'}
                </CreateTopicText>
            </CreateTopicButtonContainer>
        );
    }

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderLeftContainer>
                    <BackButton navigation={navigation} />
                    { creatorOnProfile && (
                        <Fragment>
                            <ProfilePicture user={creatorOnProfile} size={30} />
                            <Spacer />
                        </Fragment>
                    )}
                    <HeaderText>{headerText}</HeaderText>
                </HeaderLeftContainer>
                <SearchTopicsButton />
            </HeaderContainer>
        );
    }

    const SearchTopicsButton = () => {
        const onPress = () => setSearching(true);
        return (
            <SearchButtonContainer onPress={onPress}>
                <Icon type='ionicon' name='search' color='white' size={24} />
            </SearchButtonContainer>
        )
    }


    useEffect(() => {
        const showTabBar = (source === 'profile');
        dispatch({ type: 'setTabBarVisible', payload: showTabBar });
    }, []);

    return (
        <ScreenContainer>
            { !searching && <Header /> }
            <TopicScroll 
                creatorOnProfile={creatorOnProfile}
                initDisplayTopics={initDisplayTopics}
                initNextPage={initNextPage}
                navigation={navigation}
                searching={searching} 
                setSearching={setSearching}
                source={source}
            />
            <CreateTopicButton />
        </ScreenContainer>
    );
}

