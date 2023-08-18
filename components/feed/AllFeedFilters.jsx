import React, { useContext, useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ReelayColors from '../../constants/ReelayColors';
import { ScrollView } from 'react-native-gesture-handler';
import { FilterMappings } from '../utils/FilterMappings';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../context/AuthContext';

const { height, width } = Dimensions.get('window');

const AllFiltersView = styled(View)`
    align-items: center;
    background-color: black;
    margin-top: ${props => props.newDiscover ? 0:0}px;
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
    height: ${height}px;
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
    bottom: ${props => props.bottomOffset +  100}px;
    flex-direction: row;
    height: 40px;
    position: absolute;
    justify-content: center;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 90%;
`
const SearchBarPressableDi = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    flex-direction: row;
    height: 40px;
    margin-bottom:10px;
    justify-content: center;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 90%;
`
const SearchBarText = styled(ReelayText.Overline)`
    color: white;
`
const SearchBarPressable1 = styled(TouchableOpacity)`
    align-items: center;
    background-color: #fff;
    border-radius: 20px;
    border-color: ${ReelayColors.reelayBlue};
    border-width:3px;
    // bottom: ${props => props.bottomOffset + 50}px;
    flex-direction: row;
    height: 40px;
    justify-content: center;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 90%;
`
const SearchBarText1 = styled(ReelayText.Overline)`
    color: ${ReelayColors.reelayBlue};
    font-weight:bold;
`

export default AllFeedFilters = ({ closeAllFiltersList, selectedFilters, setSelectedFilters, newDiscover = false }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
    const hideCategories = isGuestUser ? ['Friends & Communities', 'Watchlist'] : [];
    const hideOptions = isGuestUser ? [
        'on_my_streaming', 
        'on_my_watchlist', 
        'on_other_streaming', 
        'in_my_clubs',
    ] : [];

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
            if (hideCategories.includes(category)) return <View />

            const renderFilter = (filter) => {
                return <FilterOption key={filter.option} filter={filter} />;
            }

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
    
            if (hideOptions.includes(option)) return <View />

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

        const SearchButtonDisc = () => {
            const applyFilters = () => {
                setSelectedFilters(allSelectedFiltersRef.current);
                closeAllFiltersList();
            }
            return (
                <SearchBarPressableDi bottomOffset={bottomOffset} onPress={applyFilters}>
                    <SearchBarText>{'Apply'}</SearchBarText>
                    
                </SearchBarPressableDi>
            );
        }

        const CancelButton = () => {
            const applyFilters = () => {
                closeAllFiltersList();
            }
            return (
                <SearchBarPressable1 bottomOffset={bottomOffset} onPress={applyFilters}>
                    <SearchBarText1>{'Cancel'}</SearchBarText1>
                </SearchBarPressable1>
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
                    colors={["#000", "#0d0d0d"]} 
                    start={{ x: -1, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                />
                { newDiscover ?
                <View style={{backgroundColor:"#000",display:"flex",position:"absolute",bottom: bottomOffset,padding:10,paddingTop:20,paddingBottom:40,alignItems:"center",right:0,left:0}}>
                <SearchButtonDisc/>
                <CancelButton />
               </View>:
               <SearchButton />
               }
            </AllFiltersView>
        );
    }

    return <FilterList />;
}