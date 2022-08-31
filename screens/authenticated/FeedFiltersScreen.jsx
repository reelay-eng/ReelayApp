import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components/native';

import { LinearGradient } from "expo-linear-gradient";
import ReelayFeedHeader from "../../components/feed/ReelayFeedHeader";
import ReelayColors from "../../constants/ReelayColors";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";

const FILTER_MAPPINGS = {
    'Type': [
        { option: 'unselect_all', display: 'all' },
        { option: 'film', display: 'movie' },
        { option: 'tv', display: 'TV' },
    ],
    'Duration': [
        { option: 'lt_30', display: '<30min' },
        { option: 'lt_60', display: '<60min' },
        { option: 'lt_90', display: '<90min' },
        { option: 'lt_120', display: '<120min' },
        { option: 'lt_150', display: '<150min' },
        { option: 'epic', display: 'epics' },
    ],
    'Venue': [
        { option: 'on_my_streaming', display: 'on my streaming' },
        { option: 'theaters', display: 'in theaters' },
        { option: 'festivals', display: 'at festivals' },
        { option: 'on_other_streaming', display: 'on other streaming platforms' },
    ],
    'Watchlist': [
        { option: 'on_my_watchlist', display: 'on my watchlist' },
        { option: 'on_friends_watchlists', display: "on my friends' watchlists'" },
        { option: 'marked_seen', display: 'marked as seen' },
        { option: 'marked_unseen', display: 'marked as unseen' },
    ],
    'Friends & Communities': [
        { option: 'following', display: 'my friends' },
        { option: 'in_my_clubs', display: 'my clubs' },
    ],
    'Popularity & Rating': [
        { option: 'popular', display: 'popular' },
        { option: 'deep_cut', display: 'deep cut' },
        { option: 'hidden_gem', display: 'hidden grem' },
        { option: 'highly_rated', display: 'highly rated' },
        { option: 'poorly_rated', display: 'poorly rated' },
        { option: 'controversial', display: 'controversial' },

    ],
    'Decade': [
        { option: 'unselect_all', display: 'all' },
        { option: 'in_2020s', display: '2020s' },
        { option: 'in_2010s', display: '2010s' },
        { option: 'in_2000s', display: '2000s' },
        { option: 'in_1990s', display: '1990s' },
        { option: 'in_1980s', display: '1980s' },
        { option: 'in_1970s', display: '1970s' },
        { option: 'in_1960s', display: '1960s' },
        { option: 'in_1950s', display: '1950s' },
        { option: 'in_1940s', display: '1940s' },
        { option: 'in_1930s', display: '1930s' },
        { option: 'in_1920s', display: '1920s' },
    ],
    'Language': [
        { option: 'unselect_all', display: 'all' },
        { option: 'english', display: 'english' },
        { option: 'non_english', display: 'non-english' },
        { option: 'french', display: 'french' },
        { option: 'spanish', display: 'spanish' },
        { option: 'korean', display: 'korean' },
        { option: 'japanese', display: 'japanese' },
        { option: 'italian', display: 'italian' },
        { option: 'german', display: 'german' },
        { option: 'mandarin', display: 'mandarin' },
        { option: 'cantonese', display: 'cantonese' },
        { option: 'other', display: 'other' },
    ],
    'Genre': [
        { option: 'unselect_all', display: 'all' },
        { option: 'Action', display: 'Action' },
        { option: 'Action & Adventure', display: 'Action & Adventure' },
        { option: 'Adventure', display: 'Adventure' },
        { option: 'Animation', display: 'Animation' },
        { option: 'Comedy', display: 'Comedy' },
        { option: 'Crime', display: 'Crime' },
        { option: 'Documentary', display: 'Documentary' },
        { option: 'Drama', display: 'Drama' },
        { option: 'Family', display: 'Family' },
        { option: 'Fantasy', display: 'Fantasy' },
        { option: 'History', display: 'History' },
        { option: 'Horror', display: 'Horror' },
        { option: 'Kids', display: 'Kids' },
        { option: 'Music', display: 'Music' },
        { option: 'Mystery', display: 'Mystery' },
        { option: 'Reality', display: 'Reality' },
        { option: 'Romance', display: 'Romance' },
        { option: 'Science Fiction', display: 'Science Fiction' },
        { option: 'Sci-Fi & Fantasy', display: 'Sci-Fi & Fantasy' },
        { option: 'Soap', display: 'Soap' },
        { option: 'Talk', display: 'Talk' },
        { option: 'Thriller', display: 'Thriller' },
        { option: 'TV Movie', display: 'TV Movie' },
        { option: 'War', display: 'War' },
        { option: 'War & Politics', display: 'War & Politics' },
        { option: 'Western', display: 'Western' },
    ],
}

const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: 0px;
    opacity: 0.8;
    height: 172px;
    width: 100%;
`

const CategoryHeader = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    line-height: 24px;
    margin-left: 12px;
`
const CategoryView = styled(View)`

`
const CategoryOptionsView = styled(View)`
    background-color: black;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 12px;
    width: 100%;
`
const FilterPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.selected 
        ? ReelayColors.reelayBlue 
        : '#333333' 
    };
    border-color: #79747E;
    border-radius: 8px;
    border-width: ${props => props.allFilters ? 1.4 : 0}px;
    height: 28px;
    justify-content: center;
    margin-right: 8px;
    margin-top: 6px;
    margin-bottom: 6px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 2px;
`
const FilterText = styled(ReelayText.Subtitle2)`
    color: white;
`
const FilterScrollView = styled(ScrollView)`
    top: ${props => props.topOffset}px;
`
const ScreenView = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    width: 100%;
`
const SearchBarPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    bottom: ${props => props.bottomOffset}px;
    flex-direction: row;
    height: 40px;
    justify-content: center;
    position: absolute;
    width: 90%;
`
const SearchBarText = styled(ReelayText.Overline)`
    color: white;
`

export default FeedFiltersScreen = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const feedSource = route?.params?.feedSource;
    const filterCategories = Object.keys(FILTER_MAPPINGS);
    const topOffset = useSafeAreaInsets().top + 60;
    const bottomOffset = useSafeAreaInsets().bottom + 54;

    useFocusEffect(() => {
        dispatch({ type: 'setTabBarVisible', payload: true });
    });

    const FilterCategory = ({ category }) => {
        const filterOptions = FILTER_MAPPINGS[category];
        return (
            <CategoryView>
                <CategoryHeader>{category}</CategoryHeader>
                <CategoryOptionsView>
                    { filterOptions.map(filter => <FilterOption filter={filter} /> )}
                </CategoryOptionsView>
            </CategoryView>
        );
    }

    const FilterOption = ({ filter }) => {
        const onPress = () => {}
        const selected = false;
        return (
            <FilterPressable onPress={onPress} selected={selected}>
                <FilterText>{filter.display}</FilterText>
            </FilterPressable>
        );
    }

    const FilterList = () => {
        return (
            <FilterScrollView 
                contentContainerStyle={{ paddingBottom: 240 }}
                showsVerticalScrollIndicator={false} 
                topOffset={topOffset}
            >
                { filterCategories.map(category => {
                    return <FilterCategory key={category} category={category} /> 
                })}
            </FilterScrollView>
        );
    }

    const SearchButton = () => {
        const applyFilters = () => {}
        return (
            <SearchBarPressable bottomOffset={bottomOffset} onPress={applyFilters}>
                <SearchBarText>{'Apply'}</SearchBarText>
            </SearchBarPressable>
        );
    }

    return (
        <ScreenView>
            <ReelayFeedHeader
                feedSource={feedSource} 
                navigation={navigation}
                isFullScreen={true}
            />
            <FilterList />
            <BottomGradient colors={["transparent", "#0d0d0d"]} locations={[0.08, 1]} />
            <SearchButton />
        </ScreenView>
    )
}