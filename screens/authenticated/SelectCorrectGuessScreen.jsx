import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
    ActivityIndicator, 
    FlatList, 
    Keyboard, 
    TouchableOpacity, 
    TouchableWithoutFeedback, 
    View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useDispatch, useSelector } from "react-redux";

import { HeaderWithBackButton } from '../../components/global/Headers';
import * as ReelayText from '../../components/global/Text';
import SearchField from '../../components/create-reelay/SearchField';
import TitleSearchResults from '../../components/search/TitleSearchResults';
import { ToggleSelector } from '../../components/global/Buttons';

import styled from 'styled-components/native';
import { searchTitles } from '../../api/ReelayDBApi';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import JustShowMeSignupPage from '../../components/global/JustShowMeSignupPage';
import { useFocusEffect } from '@react-navigation/native';
import { getMyDraftGuessingGames } from '../../api/GuessingGameApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

const DraftGameRowView = styled(TouchableOpacity)`
    align-items: center;
    background-color: #121212;
    border-color: rgba(255,255,255,0.5);
    border-radius: 12px;
    border-width: 1px;
    flex-direction: row;
    height: 60px;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 12px;
    width: 100%;
`
const DraftGameTitleText = styled(ReelayText.Body1)`
    color: white;
    line-height: 20px;
`
const DraftGuessingGamesAltText = styled(ReelayText.Overline)`
    color: white;
    font-size: 14px;
    margin-bottom: 12px;
    text-align: center;
    width: 100%;   
`
const DraftGuessingGamesView = styled(View)`
    padding: 12px;
    width: 100%;
`
const HeaderSubText = styled(ReelayText.Body1)`
    color: white;
    line-height: 24px;
    font-size: 16px;
    margin-top: 8px;
    margin-bottom: -12px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 20px;
    margin-bottom: 4px;
    text-align: left;
    width: 100%;
`
const HeaderView = styled(View)`
    margin-bottom: 16px;
    padding: 12px;
    width: 100%;
`
const ScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const SearchBarContainer = styled(View)`
	align-items: center;
	justify-content: center;
    padding-left: 3px;
    padding-right: 3px;
    width: 100%;
`
const SelectorBarContainer = styled(View)`
	height: 40px;
    margin-bottom: 8px;
    padding-left: 12px;
    padding-right: 12px;
    width: 100%;
`
const Spacer = styled(View)`
    height: 16px;
`
const TopBarContainer = styled(View)`
    margin-top: ${props => props.topOffset}px;
    margin-bottom: 12px;
    padding-right: 12px;
	width: 100%;
`

export default SelectCorrectGuessScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [draftGuessingGames, setDraftGuessingGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('Film');
    const searchTextEmpty = (!searchText || searchText === undefined || searchText === '');
    const topOffset = useSafeAreaInsets().top;

    /**
     * Topic obj requires two elements only: { id, title }
     */

    const clubID = route?.params?.clubID;
    const hasDraftGuessingGames = (draftGuessingGames.length > 0);
    const showDraftGuessingGames = !!(!loading && searchTextEmpty && hasDraftGuessingGames);
    const updateCounter = useRef(0);

	const dispatch = useDispatch();

    if (reelayDBUser?.username === 'be_our_guest') {
        return <JustShowMeSignupPage navigation={navigation} headerText={'Make a Reelay'} />
    }

    const loadDraftGuessingGames = async () => {
        const draftGuessingGames = await getMyDraftGuessingGames({
            authSession,
            reqUserSub: reelayDBUser?.sub,
        });
        if (!draftGuessingGames?.error) {
            setDraftGuessingGames(draftGuessingGames);
        }
    }

    const updateSearch = async (newSearchText, searchType, counter) => {
        if (!newSearchText || newSearchText === undefined || newSearchText === '') {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            if (searchType === 'Film') {
                const annotatedResults = await searchTitles(newSearchText, false);
                if (counter === updateCounter.current) {
                    setSearchResults(annotatedResults);
                }
            } else {
                const annotatedResults = await searchTitles(newSearchText, true);
                if (counter === updateCounter.current) {
                    setSearchResults(annotatedResults);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false }); 
    })

    useEffect(() => {
        updateCounter.current += 1;
        const nextUpdateCounter = updateCounter.current;
        setTimeout(() => {
            updateSearch(searchText, searchType, nextUpdateCounter);
        }, 200);
    }, [searchText, searchType]);

    useEffect(() => {
        setLoading(false);
    }, [searchResults]);

    useEffect(() => {
        loadDraftGuessingGames();
    }, []);

    const DraftGuessingGames = () => {
        const gamesPlural = (draftGuessingGames.length > 1) ? 's' : '';
        const headerText = `You have ${draftGuessingGames.length} draft guessing game${gamesPlural}`;
        const DraftGameRow = ({ item }) => {
            const game = item;
            const advanceToClueBuilderScreen = () => {
                navigation.push('CreateGuessingGameCluesScreen', { game });
            }
            return (
                <DraftGameRowView onPress={advanceToClueBuilderScreen}>
                    <DraftGameTitleText>{game.title}</DraftGameTitleText>
                    <FontAwesomeIcon icon={faChevronRight} size={24} color='white' />
                </DraftGameRowView>
            );
        }

        if (!showDraftGuessingGames) return <View />;
        return (
            <DraftGuessingGamesView>
                <DraftGuessingGamesAltText>{'or'}</DraftGuessingGamesAltText>
                <HeaderText>{headerText}</HeaderText>
                <Spacer />
                <FlatList
                    contentContainerStyle={{ paddingBottom: 200 }}
                    data={draftGuessingGames}
                    keyExtractor={item => item?.id}
                    renderItem={({ item }) => <DraftGameRow item={item} /> }
                    showsVerticalScrollIndicator={false}
                />
                {/* { draftGuessingGames.map(game => <DraftGameRow key={game.id} game={game} /> )} */}
            </DraftGuessingGamesView>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScreenView>
                <TopBarContainer topOffset={topOffset}>
                <HeaderWithBackButton navigation={navigation} text={"guessing game"} />
                </TopBarContainer>
                <HeaderView>
                    <HeaderText>{'How it works'}</HeaderText>
                    <HeaderSubText>{'Leave up to 6 reelays as clues for players to guess the right title.'}</HeaderSubText>
                    <Spacer />
                    <HeaderSubText>{'Select the correct answer below:'}</HeaderSubText>
                </HeaderView>
                <SelectorBarContainer>
                    <ToggleSelector
                        options={["Film", "TV"]}
                        selectedOption={searchType}
                        onSelect={(type) => {
                            setSearchType(type);
                        }}
                    />
                </SelectorBarContainer>
                <SearchBarContainer>
                    <SearchField
                        searchText={searchText}
                        updateSearchText={setSearchText}
                        borderRadius={4}
                        placeholderText={(searchType === 'TV') ? "Search TV shows..." : "Search films..."}
                    />
                </SearchBarContainer>
                { loading && <ActivityIndicator /> }
                { !loading && !searchTextEmpty && (
                    <TitleSearchResults
                        navigation={navigation}
                        searchResults={searchResults}
                        searchText={searchText}
                        isSeries={(searchType === 'TV')}
                        source={"createGuessingGame"}
                        clubID={clubID ?? null}
                    />
                )}
                <DraftGuessingGames />
            </ScreenView>
        </TouchableWithoutFeedback>
	);
};