import React, { useContext, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { getHomeFilters } from '../utils/FilterMappings';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { AuthContext } from '../../context/AuthContext';

const CategoryHeader = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    line-height: 24px;
    text-align: left;
    width: 100%;
`
const CategoryView = styled(View)`
    align-items: center;
    padding: 12px;
    margin-top: 12px;
`
const CategoryOptionsView = styled(View)`
    background-color: black;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 12px;
    margin-bottom: 18px;
    width: 100%;
`
const FilterPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.selected 
        ? ReelayColors.reelayBlue 
        : '#333333' 
    };
    border-radius: 8px;
    flex-direction: row;
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
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
    margin-bottom: 4px;
    text-align: left;
    width: 100%;
`
const SearchBarPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.fade 
        ? 'black' 
        : ReelayColors.reelayBlue
    };
    border-color: ${props => props.fade 
        ? 'white' 
        : ReelayColors.reelayBlue
    };
    border-width: ${props => props.fade ? 1 : 0}px;
    border-radius: 20px;
    flex-direction: row;
    height: 40px;
    justify-content: center;
    width: 100%;
`
const SearchBarText = styled(ReelayText.Overline)`
    color: white;
`

export default DiscoverSearch = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
    const hideForGuests = ['on_my_streaming', 'in_my_clubs'];

    const [selectedFilters, setSelectedFilters] = useState([]);
    const filterOptions = getHomeFilters();
    const renderFilter = (filter) => <FilterOption key={filter.option} filter={filter} />;

    const isFilterSelected = (filter) => {
        const matchFilter = (nextFilter) => (
            nextFilter.category === filter.category && 
            nextFilter.option === filter.option
        );
        return selectedFilters.find(matchFilter);
    }

    const onSelectOrUnselectFilter = (filter) => {
        const { category, option } = filter;
        const isSelecting = !isFilterSelected(filter);

        const removeFilter = (nextFilter) => (
            nextFilter.category !== category || 
            nextFilter.option !== option
        );

        const nextSelectedFilters = (isSelecting)
            ? [...selectedFilters, filter]
            : selectedFilters.filter(removeFilter);

        setSelectedFilters(nextSelectedFilters);
    }

    const FilterOption = ({ filter }) => {
        const { category, option, display } = filter;
        const isSelected = isFilterSelected(filter);
        const onPress = () => onSelectOrUnselectFilter(filter);

        if (isGuestUser && hideForGuests.includes(option)) return <View />;

        return (
            <FilterPressable selected={isSelected} onPress={onPress}>
                <FilterText>{display}</FilterText>
            </FilterPressable>
        )
    }

    const SearchButton = () => {
        const applyFilters = () => {
            navigation.push('FeedScreen', {
                feedSource: 'discover',
                initialFeedFilters: selectedFilters,
            })
        }

        return (
            <SearchBarPressable fade={selectedFilters.length === 0} onPress={applyFilters}>
                <SearchBarText>{'Browse Reelays'}</SearchBarText>
            </SearchBarPressable>
        );
    }
    
    return (
        <CategoryView>
            <CategoryHeader>{'Discover'}</CategoryHeader>
            <HeaderSubText>{'Find something that’s just right'}</HeaderSubText>
            <CategoryOptionsView>
                { filterOptions.map(renderFilter)}
            </CategoryOptionsView>
            <SearchButton />
        </CategoryView>
    );
}