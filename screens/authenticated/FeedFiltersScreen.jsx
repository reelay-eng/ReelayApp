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
        { category: 'titleType', option: 'reset', display: 'all' },
        { category: 'titleType', option: 'film', display: 'movie' },
        { category: 'titleType', option: 'tv', display: 'TV' },
    ],
    'Runtime': [
        { category: 'runtime', option: 'reset', display: 'all' },
        { category: 'runtime', option: 'lt_30', display: '<30min' },
        { category: 'runtime', option: 'lt_60', display: '<60min' },
        { category: 'runtime', option: 'lt_90', display: '<90min' },
        { category: 'runtime', option: 'lt_120', display: '<120min' },
        { category: 'runtime', option: 'lt_150', display: '<150min' },
        { category: 'runtime', option: 'epic', display: 'epics' },
    ],
    'Venue': [
        { category: 'venue', option: 'reset', display: 'all' },
        { category: 'venue', option: 'on_my_streaming', display: 'on my streaming' },
        { category: 'venue', option: 'theaters', display: 'in theaters' },
        { category: 'venue', option: 'festivals', display: 'at festivals' },
        { category: 'venue', option: 'on_other_streaming', display: 'on other streaming platforms' },
    ],
    'Watchlist': [
        { category: 'watchlist', option: 'reset', display: 'all' },
        { category: 'watchlist', option: 'on_my_watchlist', display: 'on my watchlist' },
        { category: 'watchlist', option: 'on_friends_watchlists', display: "on my friends' watchlists" },
        { category: 'watchlist', option: 'marked_seen', display: 'marked as seen' },
        { category: 'watchlist', option: 'marked_unseen', display: 'marked as unseen' },
    ],
    'Friends & Communities': [
        { category: 'community', option: 'reset', display: 'all' },
        { category: 'community', option: 'following', display: 'my friends' },
        { category: 'community', option: 'in_my_clubs', display: 'my clubs' },
    ],
    'Popularity & Rating': [
        { category: 'popularityAndRating', option: 'reset', display: 'all' },
        { category: 'popularityAndRating', option: 'popular', display: 'popular' },
        { category: 'popularityAndRating', option: 'deep_cut', display: 'deep cut' },
        { category: 'popularityAndRating', option: 'hidden_gem', display: 'hidden gem' },
        { category: 'popularityAndRating', option: 'highly_rated', display: 'highly rated' },
        { category: 'popularityAndRating', option: 'poorly_rated', display: 'poorly rated' },
        { category: 'popularityAndRating', option: 'controversial', display: 'controversial' },

    ],
    'Decade': [
        { category: 'decade', option: 'reset', display: 'all' },
        { category: 'decade', option: 'in_2020s', display: '2020s' },
        { category: 'decade', option: 'in_2010s', display: '2010s' },
        { category: 'decade', option: 'in_2000s', display: '2000s' },
        { category: 'decade', option: 'in_1990s', display: '1990s' },
        { category: 'decade', option: 'in_1980s', display: '1980s' },
        { category: 'decade', option: 'in_1970s', display: '1970s' },
        { category: 'decade', option: 'in_1960s', display: '1960s' },
        { category: 'decade', option: 'in_1950s', display: '1950s' },
        { category: 'decade', option: 'in_1940s', display: '1940s' },
        { category: 'decade', option: 'in_1930s', display: '1930s' },
        { category: 'decade', option: 'in_1920s', display: '1920s' },
    ],
    'Language': [
        { category: 'language', option: 'reset', display: 'all' },
        { category: 'language', option: 'english', display: 'english' },
        { category: 'language', option: 'non_english', display: 'non-english' },
        { category: 'language', option: 'french', display: 'french' },
        { category: 'language', option: 'spanish', display: 'spanish' },
        { category: 'language', option: 'korean', display: 'korean' },
        { category: 'language', option: 'japanese', display: 'japanese' },
        { category: 'language', option: 'italian', display: 'italian' },
        { category: 'language', option: 'german', display: 'german' },
        { category: 'language', option: 'mandarin', display: 'mandarin' },
        { category: 'language', option: 'cantonese', display: 'cantonese' },
        { category: 'language', option: 'other', display: 'other' },
    ],
    'Genre': [
        { category: 'keywords', option: 'reset', display: 'all' },
        { category: 'keywords', option: 'Action', display: 'Action' },
        { category: 'keywords', option: 'Action & Adventure', display: 'Action & Adventure' },
        { category: 'keywords', option: 'Adventure', display: 'Adventure' },
        { category: 'keywords', option: 'Animation', display: 'Animation' },
        { category: 'keywords', option: 'Comedy', display: 'Comedy' },
        { category: 'keywords', option: 'Crime', display: 'Crime' },
        { category: 'keywords', option: 'Documentary', display: 'Documentary' },
        { category: 'keywords', option: 'Drama', display: 'Drama' },
        { category: 'keywords', option: 'Family', display: 'Family' },
        { category: 'keywords', option: 'Fantasy', display: 'Fantasy' },
        { category: 'keywords', option: 'History', display: 'History' },
        { category: 'keywords', option: 'Horror', display: 'Horror' },
        { category: 'keywords', option: 'Kids', display: 'Kids' },
        { category: 'keywords', option: 'Music', display: 'Music' },
        { category: 'keywords', option: 'Mystery', display: 'Mystery' },
        { category: 'keywords', option: 'Reality', display: 'Reality' },
        { category: 'keywords', option: 'Romance', display: 'Romance' },
        { category: 'keywords', option: 'Science Fiction', display: 'Science Fiction' },
        { category: 'keywords', option: 'Sci-Fi & Fantasy', display: 'Sci-Fi & Fantasy' },
        { category: 'keywords', option: 'Soap', display: 'Soap' },
        { category: 'keywords', option: 'Talk', display: 'Talk' },
        { category: 'keywords', option: 'Thriller', display: 'Thriller' },
        { category: 'keywords', option: 'TV Movie', display: 'TV Movie' },
        { category: 'keywords', option: 'War', display: 'War' },
        { category: 'keywords', option: 'War & Politics', display: 'War & Politics' },
        { category: 'keywords', option: 'Western', display: 'Western' },
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
                    { filterOptions.map(filter => <FilterOption key={filter.option} filter={filter} /> )}
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