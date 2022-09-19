import React, { useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ReelayColors from '../../constants/ReelayColors';
import { ScrollView } from 'react-native-gesture-handler';
import { FilterMappings } from '../utils/FilterMappings';
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('window');

const AllFiltersView = styled(SafeAreaView)`
    align-items: center;
    background-color: black;
    width: ${width}px;
`
const BottomGradient = styled(LinearGradient)`
    position: absolute;
    bottom: -100px;
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
const FilterScrollView = styled(ScrollView)`
    background-color: black;
    height: ${height-80}px;
`
const FilterText = styled(ReelayText.Subtitle2)`
    color: white;
`
const FilterListBottomSpacer = styled(View)`
    height: 180px;
`
const FilterListTopSpacer = styled(View)`
    height: 16px;
`
const SearchBarPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    bottom: ${props => props.bottomOffset + 100}px;
    flex-direction: row;
    height: 40px;
    justify-content: center;
    position: absolute;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 90%;
`
const SearchBarText = styled(ReelayText.Overline)`
    color: white;
`

export default AllFeedFilters = ({ closeAllFiltersList, selectedFilters, setSelectedFilters }) => {
    const allSelectedFiltersRef = useRef(selectedFilters);
    const bottomOffset = useSafeAreaInsets().bottom;
    const topOffset = useSafeAreaInsets().top;

    const AllFilterCategories = () => {
        const filterCategories = Object.keys(FilterMappings);
        const [allSelectedFilters, setAllSelectedFilters] = useState(selectedFilters);
    
        const isFilterSelected = (filter) => {
            const { category, option } = filter;
            if (option === 'reset') {
                for (const nextFilter of allSelectedFilters) {
                    if (nextFilter.category === category) return false;
                }
                return true;
            }
    
            const matchFilter = (nextFilter) => (
                nextFilter.category === filter.category && 
                nextFilter.option === filter.option
            );
    
            return allSelectedFilters.find(matchFilter);
        }
    
        const onSelectOrUnselectFilter = (filter) => {
            const { category, option } = filter;
            const isSelecting = !isFilterSelected(filter);
            const isResetOption = (option === 'reset');
    
            const removeFilter = (nextFilter) => (
                nextFilter.category !== category || 
                nextFilter.option !== option
            );
    
            if (isResetOption) {
                resetFilters(category);
                return;
            }
    
            const nextSelectedFilters = (isSelecting)
                ? [...allSelectedFilters, filter]
                : allSelectedFilters.filter(removeFilter);
    
            allSelectedFiltersRef.current = nextSelectedFilters;
            setAllSelectedFilters(nextSelectedFilters);
        }
    
        const resetFilters = (category) => {
            const removeCategoryFilters = (nextFilter) => (nextFilter.category !== category);
            const nextSelectedFilters = allSelectedFilters.filter(removeCategoryFilters);
            allSelectedFiltersRef.current = nextSelectedFilters;
            setAllSelectedFilters(nextSelectedFilters);
        }
    
        const FilterCategory = ({ category }) => {
            const filterOptions = FilterMappings[category];
            const renderFilter = (filter) => <FilterOption key={filter.option} filter={filter} />;
    
            return (
                <CategoryView>
                    <CategoryHeader>{category}</CategoryHeader>
                    <CategoryOptionsView>
                        { filterOptions.map(renderFilter)}
                    </CategoryOptionsView>
                </CategoryView>
            );
        }    

        const FilterOption = ({ filter }) => {
            const { category, option, display } = filter;
            const isSelected = isFilterSelected(filter);
            const onPress = () => onSelectOrUnselectFilter(filter);
    
            return (
                <FilterPressable selected={isSelected} onPress={onPress}>
                    <FilterText>{display}</FilterText>
                </FilterPressable>
            )
        }
    
        return (
            <View>
                { filterCategories.map(category => {
                    return <FilterCategory key={category} category={category} /> 
                })}
            </View>
        );
    }


    const FilterList = () => {

        const SearchButton = () => {
            const applyFilters = () => {
                setSelectedFilters(allSelectedFiltersRef.current);
                closeAllFiltersList();
            }
            return (
                <SearchBarPressable bottomOffset={bottomOffset} onPress={applyFilters}>
                    <SearchBarText>{'Apply'}</SearchBarText>
                </SearchBarPressable>
            );
        }

        return (
            <AllFiltersView>
                <FilterScrollView showsVerticalScrollIndicator={false} topOffset={topOffset}>
                    <FilterListTopSpacer />
                    <AllFilterCategories />
                    <FilterListBottomSpacer />
                </FilterScrollView>
                <BottomGradient 
                    colors={["transparent", "#0d0d0d"]} 
                    start={{ x: -1, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                />
                <SearchButton />
            </AllFiltersView>
        );
    }

    return <FilterList />;
}