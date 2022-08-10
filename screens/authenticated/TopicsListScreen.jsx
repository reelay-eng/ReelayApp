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

import { AuthContext } from '../../context/AuthContext';
import BackButton from '../../components/utils/BackButton';
import * as ReelayText from '../../components/global/Text';
import TopicCard from '../../components/topics/TopicCard';
import ReelayColors from '../../constants/ReelayColors';
import { useDispatch, useSelector } from 'react-redux';

import { getTopics, getTopicsByCreator, searchTopics } from '../../api/TopicsApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import moment from 'moment';
import { HeaderWithBackButton } from '../../components/global/Headers';
import ProfilePicture from '../../components/global/ProfilePicture';

const { height, width } = Dimensions.get('window');

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
    margin-bottom: 18px;
`
const TopicScrollContainer = styled(ScrollView)`
    padding-left: 15px;
    padding-bottom: 80px;
    width: 100%;
`

const SearchBar = ({ resetTopics, searchBarRef, setSearching, updateSearchResults }) => {
    const searchTextRef = useRef('');
    const onClose = () => {
        setSearching(false);
        resetTopics();
    }
    const updateSearch = (newSearchText) => {
        searchTextRef.current = newSearchText;
        updateSearchResults(newSearchText);
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
    navigation,
    searching,
    setSearching,
    source = 'discover',
}) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const searchBarRef = useRef(null);

    const discoverTopics = useSelector(state => state.myHomeContent?.discover?.topics);
    const followingTopics = useSelector(state => state.myHomeContent?.following?.topics);

    const discoverTopicsNextPage = useSelector(state => state.myHomeContent?.discover?.topicsNextPage) ?? 1;
    const followingTopicsNextPage = useSelector(state => state.myHomeContent?.following?.topicsNextPage) ?? 1;

    let initDisplayTopics, nextPage;
    switch (source) {
        case 'discover':
            initDisplayTopics = discoverTopics ?? [];
            nextPage = discoverTopicsNextPage ?? 1;
            break;    
        case 'following':
            initDisplayTopics = followingTopics ?? [];
            nextPage = followingTopicsNextPage ?? 1;
            break;
        case 'profile':
            initDisplayTopics = topicsOnProfile;
            nextPage = 1;
            break;
        case 'search':
            initDisplayTopics = searchResults;
            nextPage = 1;
            break;
        default:
            initDisplayTopics = [];
            nextPage = 1;
            break;
    }
    
    const [displayTopics, setDisplayTopics] = useState(initDisplayTopics);
    const hasReelays = (topic) => topic?.reelays?.length > 0
    const displayTopicsWithReelays = displayTopics.filter(hasReelays);
    const itemHeights = useRef([]);

    const extendScroll = async () => {
        if (source === 'search') return; // todo

        try {
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

            console.log('next topic ids: ', nextTopics.map(topic => topic.id));

            const payload = { nextPage: nextPage + 1 };
            const nextDisplayTopics = [ ...displayTopics, ...nextTopics ];
            setDisplayTopics(nextDisplayTopics);
            if (source === 'profile') return;

            payload[source] = nextDisplayTopics;
            dispatch({ type: 'setTopics', payload });
        } catch (error) {
            console.log(error);
        }
    }

    const getItemLayout = (item, index) => {
        const length = itemHeights.current[index] ?? 0;
        const accumulate = (sum, next) => sum + next;
        const offset = itemHeights.current.slice(0, index).reduce(accumulate, 0);
        return { length, offset, index };
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

        const onLayout = ({ nativeEvent }) => {
            itemHeights.current[index] = nativeEvent?.layout?.height;
        }    

        return (
            <TopicCardContainer key={topic.id} onLayout={onLayout}>
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

    const topicScrollStyle = {
        paddingLeft: 15,
        paddingBottom: 80,
        width: '100%',    
    }

    const updateSearchResults = async () => {
        const topicSearchResults = await searchTopics({ 
            searchText, 
            page, 
            reqUserSub: reelayDBUser?.sub,
        });
        setDisplayTopics(topicSearchResults);
    }

    return (
        <View>
            { searching && <SearchBar 
                resetTopics={resetTopics}
                searchBarRef={searchBarRef}
                setSearching={setSearching} 
                updateSearchResults={updateSearchResults}
            /> }
            <FlatList
                contentContainerStyle={topicScrollStyle}
                data={displayTopics}
                getItemLayout={getItemLayout}
                onEndReached={extendScroll}
                onEndReachedThreshold={0.9}
                renderItem={renderTopic}
            />
        </View>
    )
}

export default TopicsListScreen = ({ navigation, route }) => {
    const [searching, setSearching] = useState(false);
    const source = route.params?.source ?? 'discover';

    const creatorOnProfile = route.params?.creatorOnProfile ?? null;
    const dispatch = useDispatch();

    let headerText;
    switch (source) {
        case 'discover':
            headerText = 'Topics';
            break;    
        case 'following':
            headerText = 'Topics by friends';
            break;
        case 'profile':
            headerText = `${creatorOnProfile?.username}'s topics`;
            break;
        case 'search':
            headerText = `Search topics: ${searchText}`;
            break;
        default:
            headerText = '';
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
        dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
            dispatch({ type: 'setTabBarVisible', payload: true });
        }
    }, []);

    return (
        <ScreenContainer>
            { !searching && <Header /> }
            <TopicScroll 
                creatorOnProfile={creatorOnProfile}
                navigation={navigation}
                searching={searching} 
                setSearching={setSearching}
                source={source}
            />
            <CreateTopicButton />
        </ScreenContainer>
    );
}

