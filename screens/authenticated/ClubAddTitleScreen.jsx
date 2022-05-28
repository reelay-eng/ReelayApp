import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Keyboard, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../../components/global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import ClubBanner from '../../components/clubs/ClubBanner';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

import SearchField from "../../components/create-reelay/SearchField";
import { ToggleSelector } from '../../components/global/Buttons';
import { searchTitles } from "../../api/ReelayDBApi";
import TitlePoster from '../../components/global/TitlePoster';
import { getRuntimeString } from '../../components/utils/TitleRuntime';
import { addTitleToClub } from '../../api/ClubsApi';
import { showErrorToast, showMessageToast } from '../../components/utils/toasts';
import { notifyClubOnTitleAdded } from '../../api/ClubNotifications';

const { height, width } = Dimensions.get('window');

const AddTitleButtonContainer = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    justify-content: center;
    height: 40px;
    padding: 6px;
    width: ${width - 32}px;
`
const AddTitleButtonOuterContainer = styled(View)`
    align-items: center;
    bottom: ${(props) => props.bottomOffset ?? 0}px;
    position: absolute;
    width: 100%;
`
const AddTitleButtonText = styled(ReelayText.Subtitle2)`
    color: white;
    display: flex;
    margin-left: 4px;
`
const SelectorBarContainer = styled(View)`
    width: 90%;
    height: 40px;
    margin-bottom: 16px;
`
const SearchBarContainer = styled(View)`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`
const SearchResultsOuterContainer = styled(View)`
    width: 100%;
`
const SearchResultsList = styled(FlatList)`
    margin-bottom: 180px;
`
const SearchScreenContainer = styled(View)`
    align-items: center;
    background-color: black;
    top: ${(props) => props.topOffset}px;
    height: ${(props) => height - props.topOffset}px;
    width: 100%;
`
const TitleResultRow = styled(Pressable)`
    align-items: center;
    background-color: ${(props) => (props.selected) ? ReelayColors.reelayBlue : 'black'};
    flex-direction: row;
    padding: 16px;
    padding-top: 6px;
    padding-bottom: 6px;
`
const TitleText = styled(ReelayText.Subtitle1Emphasized)`
    color: white
`
const TitleLineContainer = styled(View)`
    align-items: flex-start;
    flex: 1;
    justify-content: center;
    margin-left: 16px;
`;
const ActorText = styled(ReelayText.Subtitle2)`
    color: ${(props) => (props.selected) ? 'white' : 'gray'};
`
const YearText = styled(ReelayText.Subtitle2)`
    color: ${(props) => (props.selected) ? 'white' : 'gray'};
`

export default ClubAddTitleScreen = ({ navigation, route }) => {
    const { club } = route.params;
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);

    const topOffset = useSafeAreaInsets().top + 80;
    const bottomOffset = useSafeAreaInsets().bottom;
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [selectedTitle, setSelectedTitle] = useState(null);
    const [selectedType, setSelectedType] = useState("Film");

    const updateCounter = useRef(0);

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: false });
    });

    const AddTitleButton = () => {
        const [uploading, setUploading] = useState(false);

        const addSelectedTitleToClub = async () => {
            if (uploading) return;
            if (!selectedTitle) return;

            try {
                setUploading(true);
                const addTitleResult = await addTitleToClub({ 
                    authSession,
                    addedByUserSub: reelayDBUser?.sub, 
                    addedByUsername: reelayDBUser?.username,
                    clubID: club.id, 
                    titleType: selectedTitle.titleType,
                    tmdbTitleID: selectedTitle.id,
                });

                notifyClubOnTitleAdded({
                    club,
                    clubTitle: addTitleResult,
                    addedByUser: reelayDBUser,
                });

                club.titles = [addTitleResult, ...club.titles];
                dispatch({ type: 'setUpdatedClub', payload: club });            
                showMessageToast(`Added to ${club.name}`);
                setUploading(false);

                logAmplitudeEventProd('addedNewTitleToClub', {
                    addedBy: reelayDBUser?.username,
                    clubID: club.id,
                    clubName: club.name,
                    title: selectedTitle?.display, 
                });

                navigation.pop();
            } catch (error) {
                console.log(error);
                showErrorToast('Ruh ruh! Couldn\'t add title. Try again?');
                setUploading(false);
            }
        }

        return (
            <AddTitleButtonOuterContainer bottomOffset={bottomOffset}>
                <AddTitleButtonContainer onPress={addSelectedTitleToClub}>
                    { uploading && <ActivityIndicator /> }
                    { !uploading && (
                        <React.Fragment>
                            <Icon type='ionicon' name='add-circle-outline' size={20} color='white' />
                            <AddTitleButtonText numberOfLines={1}>{`Add to ${club.name}`}</AddTitleButtonText>
                        </React.Fragment>
                    )}
                </AddTitleButtonContainer>
            </AddTitleButtonOuterContainer>
        );
    }

    const SelectorBar = () => {
        return (
            <SelectorBarContainer>
                <ToggleSelector
                    displayOptions={["Film", "TV"]}
                    options={["Film", "TV"]}
                    selectedOption={selectedType}
                    onSelect={(type) => {
                        setSelectedType(type);
                        if (searchText.length) setLoading(true);
                    }}
                />
            </SelectorBarContainer>
        );
    }

    const SearchResults = () => {
        return (
            <SearchResultsOuterContainer>
                { loading && <ActivityIndicator /> }
                { !loading && (
                    <SearchResultsList
                        data={searchResults}
                        renderItem={({ item }) => <SearchedTitle titleObj={item} />}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SearchResultsOuterContainer>
        )
    }

    const SearchedTitle = ({ titleObj }) => {
        const isSelected = (selectedTitle && selectedTitle?.id === titleObj.id);
        const [selected, setSelected] = useState(isSelected);

        const title = titleObj?.display;
        const actors = titleObj?.displayActors?.map(actor => actor.name)
                .filter((actor) => actor !== undefined)
                .join(", ") 
            ?? [];
        const releaseYear = (titleObj?.releaseDate && titleObj?.releaseDate.length >= 4) 
            ? titleObj.releaseDate.slice(0,4) : '';
        const runtimeString = getRuntimeString(titleObj?.runtime);

        const onPress = () => {
            if (selected) {
                setSelected(false);
                Keyboard.dismiss();
                setSelectedTitle(null);
            } else {
                setSelected(true);
                Keyboard.dismiss();
                setSelectedTitle(titleObj);
            }
        }
    
        return (
            <TitleResultRow key={titleObj?.id} onPress={onPress} selected={selected}>
                <TitlePoster title={titleObj} onPress={() => {}} />
                <TitleLineContainer>
                    <TitleText>{title}</TitleText>
                    <YearText selected={selected}>{`${releaseYear}    ${runtimeString}`}</YearText>
                    <ActorText selected={selected}>{actors}</ActorText>
                </TitleLineContainer>
            </TitleResultRow>
        );
    }

    const updateSearch = async (newSearchText, searchType, counter) => {
        try {
            if (!newSearchText || newSearchText === '') {            
                setSearchResults([]);
                return;
            }    
            if (updateCounter.current === counter) {
                setLoading(true);
                const annotatedResults = await searchTitles(newSearchText, searchType === 'TV');
                setSearchResults(annotatedResults);
                logAmplitudeEventProd('search', {
                    username: reelayDBUser?.sub,
                    searchText: newSearchText,
                    searchType: searchType,
                    source: 'search',
                });    
            }
        } catch (error) {
            console.log(error);
        }
    };

    const updateSearchDeferred = (newSearchText) => {
        updateCounter.current += 1;
        const nextUpdateCounter = updateCounter.current;
        setSelectedTitle(null);
        setTimeout(() => {
            updateSearch(newSearchText, selectedType, nextUpdateCounter);
        }, 200);
    }

    const updateSearchText = async (newSearchText) => {
        if (newSearchText !== searchText.current) {
            setSearchText(newSearchText);
            updateSearchDeferred(newSearchText);
        };
    }

    useEffect(() => {
        updateSearchDeferred(searchText);
    }, [selectedType]);

    useEffect(() => {
        setLoading(false);
    }, [searchResults]);

    const placeholderText = `Search for ${(selectedType === "Film") ? "films" : "TV shows"}`;

    return (
        <React.Fragment>
        <ClubBanner club={club} navigation={navigation} />
        <SearchScreenContainer topOffset={topOffset}>
            <SelectorBar />
            <SearchBarContainer>
				<SearchField
					searchText={searchText}
					updateSearchText={updateSearchText}
					borderRadius={4}
					placeholderText={placeholderText}
				/>
			</SearchBarContainer>
            <SearchResults />
            { selectedTitle && <AddTitleButton /> }
        </SearchScreenContainer>
        </React.Fragment>
    );
}
