import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
    Dimensions,
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

import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { searchTopics } from '../../api/TopicsApi';

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
    margin-left: 20px;
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
const TopicCardContainer = styled(View)`
    margin-bottom: 18px;
`
const TopicScrollContainer = styled(ScrollView)`
    display: flex;
    flex-direction: row;
    padding-left: 15px;
    width: 100%;
`

export default TopicsListScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const fetchedTopics = useSelector(state => state.globalTopics);
    const searchBarRef = useRef(null);

    const [displayTopics, setDisplayTopics] = useState(fetchedTopics);
    const [searching, setSearching] = useState(false);

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
                    <HeaderText>{'Topics'}</HeaderText>
                </HeaderLeftContainer>
                <SearchTopicsButton />
            </HeaderContainer>
        );
    }

    const SearchTopicsButton = () => {
        const onPress = () => {
            setSearching(true);
        }
        return (
            <SearchButtonContainer onPress={onPress}>
                <Icon type='ionicon' name='search' color='white' size={24} />
            </SearchButtonContainer>
        )
    }

    const TopicScroll = () => {
        const renderTopic = (topic, index) => {
            const onPress = () => console.log('pressed on topic');
            return (
                <TopicCardContainer key={topic.id} >
                    <TopicCard 
                        navigation={navigation} 
                        onPress={onPress} 
                        topic={topic} 
                    />
                </TopicCardContainer>
            );
        }

        return (
            <TopicScrollContainer 
                showsVerticalScrollIndicator={false}
                onEndReached={() => console.log('end reached')}
            >
                { displayTopics.map(renderTopic) }
            </TopicScrollContainer>
        )
    }

    const resetTopics = () => setDisplayTopics(fetchedTopics);
    const updateSearchResults = async (searchText) => {
        const topicSearchResults = await searchTopics({ searchText, page: 0 });
        setDisplayTopics(topicSearchResults);
    }

    useEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
            dispatch({ type: 'setTabBarVisible', payload: true });
        }
    });

    return (
        <ScreenContainer>
            { !searching && <Header /> }
            { searching && <SearchBar 
                resetTopics={resetTopics}
                searchBarRef={searchBarRef}
                setSearching={setSearching} 
                updateSearchResults={updateSearchResults}
            /> }
            <TopicScroll />
            <CreateTopicButton />
        </ScreenContainer>
    );
}

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