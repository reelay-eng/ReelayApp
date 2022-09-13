import React, { Fragment, useEffect, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowDown, faArrowLeft, faArrowRight, faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FiltersSVG } from '../global/SVGs';
import ReelayColors from '../../constants/ReelayColors';
import { ScrollView } from 'react-native-gesture-handler';
import { FilterMappings, getTopFilters } from '../utils/FilterMappings';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';

const { height, width } = Dimensions.get('window');

const AllFiltersView = styled(View)`
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
const DiscoveryBarView = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    position: absolute;
    top: ${props => props.topOffset}px;
    width: 100%;
`
const DiscoveryBarLeftView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-top: 12px;
    padding-left: 6px;
`
const DiscoveryBarRightView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-end;
`
const ExpandFiltersPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.showFilters ? 'black' : '#333333'};
    border-radius: 17px;
    height: 34px;
    justify-content: center;
    margin-left: 16px;
    width: 34px;
`
const ExpandSortPressable = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
`
const FilterBarView = styled(View)`
    background-color: black;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 12px;
    padding-top: 0px;
    padding-bottom: 24px;
    position: absolute;
    top: ${props => props.topOffset + 46}px;
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
    top: ${props => props.topOffset - 4}px;
`
const FilterText = styled(ReelayText.Subtitle2)`
    color: white;
`
const HeaderFill = styled(View)`
    background-color: black;
    height: ${props => props.topOffset + 46}px;
    position: absolute;
    width: 100%;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 24px;
    line-height: 24px;
`
const HeaderTextSortable = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 24px;
    line-height: 24px;
    text-align: right;
    width: 133px;
`
const FeedHeaderView = styled(SafeAreaView)`
    position: absolute;
    width: 100%;
`
const FilterListBottomSpacer = styled(View)`
    height: 180px;
`
const FilterListTopSpacer = styled(View)`
    height: 16px;
`
const ResetFiltersPressable = styled(TouchableOpacity)`
    align-items: center;
    justify-content: center;
    padding-top: 6px;
`
const ResetFiltersText = styled(ReelayText.CaptionEmphasized)`
    color: ${ReelayColors.reelayBlue};
    font-size: 16px;
    line-height: 24px;
`
const HeaderLeftSpacer = styled(View)`
    width: 10px;
`
const SearchBarPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 20px;
    bottom: ${props => props.bottomOffset + 24}px;
    flex-direction: row;
    height: 40px;
    justify-content: center;
    position: absolute;
    width: 90%;
`
const SearchBarText = styled(ReelayText.Overline)`
    color: white;
`
const SortOptionSelectedCircle = styled(View)`
    background-color: white;
    border-radius: 5px;
    height: 7px;
    position: absolute;
    top: 14px;
    right: 10px;
    width: 7px;
`
const SortOptionPressable = styled(TouchableOpacity)`
    padding-right: 30px;
    padding-top: 7px;
    padding-bottom: 7px;
`
const SortOptionText = styled(ReelayText.Body2)`
    color: ${props => props.selected ? 'white' : 'gray'};
    font-size: 17px;
    text-align: right;
`
const SortOptionsView = styled(View)`
    background-color: black;
    border-bottom-right-radius: 14px;
    padding: 4px;
    position: absolute;
    top: ${props => props.topOffset - 20}px;
    width: 183px;
`

const SORT_OPTION_TEXT = {
    mostRecent: 'most recent',
    thisWeek: 'this week',
    thisMonth: 'this month',
    allTime: 'top all time',
}

export default ReelayFeedHeader = ({ 
    displayText, 
    feedSource = 'discover', 
    isFullScreen = false,
    navigation, 
    sortMethod = 'mostRecent',
    setSortMethod = () => {},
    selectedFilters = [],
    setSelectedFilters = () => {},
}) => {
    // const dispatch = useDispatch();
    const canGoBack = navigation.getState().index > 0;
    const filterCategories = Object.keys(FilterMappings);
    const topOffset = useSafeAreaInsets().top;
    const bottomOffset = useSafeAreaInsets().bottom;

    const [showFilterBar, setShowFilterBar] = useState(false);
    const [showAllFilters, setShowAllFilters] = useState(false);
    const [showSortOptions, setShowSortOptions] = useState(false);

    const closeAllFilters = () => {
        setShowFilterBar(false);
        setShowSortOptions(false);
        setShowAllFilters(false);
    }

    const noFiltersSelected = (selectedFilters.length === 0);
    const showFilterActionButton = (!noFiltersSelected || !showFilterBar);

    // todo: these will certainly change with the new home screen
    const sortableFeedSources = [ 'discover' ];
    const headerIsSortable = sortableFeedSources.includes(feedSource);

    const getDisplayText = () => {
        if (displayText) return displayText;
        switch (feedSource) {
            case 'club': return 'club';
            case 'camera': return 'record';
            case 'festivals': return 'at festivals';
            case 'following': return 'following';
            case 'discover': return SORT_OPTION_TEXT[sortMethod];
            case 'popularTitlesDiscover': return 'popular titles';
            case 'popularTitlesFollowing': return 'popular titles';
            case 'single': return 'reelay';
            case 'streaming': return 'on streaming'; 
            case 'title': return 'top reelays';
            case 'topics': return 'topics';
            case 'theaters': return 'in theaters';
            case 'trending': return 'top of the week';
            case 'upload': return 'preview';
            default: 
                return '';
        }
    }

    const isFilterSelected = (filter) => {
        const { category, option } = filter;
        if (option === 'reset') {
            if (category === 'all') return noFiltersSelected;
            for (const nextFilter of selectedFilters) {
                if (nextFilter.category === category) return false;
            }
            return true;
        }

        const matchFilter = (nextFilter) => (
            nextFilter.category === filter.category && 
            nextFilter.option === filter.option
        );
        return selectedFilters.find(matchFilter);
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

        if (isSelecting) {
            const nextSelectedFilters = [...selectedFilters, filter];
            setSelectedFilters(nextSelectedFilters);
        } else {
            const nextSelectedFilters = selectedFilters.filter(removeFilter);
            setSelectedFilters(nextSelectedFilters);
        }
    }

    const resetFilters = (category) => {
        if (category === 'all') {
            setSelectedFilters([]);
            return;
        }

        const removeCategoryFilters = (nextFilter) => (nextFilter.category !== category);
        setSelectedFilters(selectedFilters.filter(removeCategoryFilters));
    }

    const BackButton = () => {
        return (
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <FontAwesomeIcon icon={faArrowLeft} size={20} color='white' />
            </TouchableOpacity>
        );
    }

    // todo: single, title, profile

    const DiscoveryBar = () => {
        const FullScreenHeader = () => {
            return (
                <DiscoveryBarLeftView>
                    <BackButton />
                    <HeaderLeftSpacer />
                    <HeaderText>{'apply filters'}</HeaderText>
                </DiscoveryBarLeftView>
            );
        }

        const NonSortableHeader = () => {
            return (
                <DiscoveryBarLeftView>
                    <BackButton />
                    <HeaderLeftSpacer />
                    <HeaderText>{getDisplayText()}</HeaderText>
                </DiscoveryBarLeftView>
            )
        }

        const SortOption = ({ option, optionDisplay }) => {
            const displayText = SORT_OPTION_TEXT[option];
            const isSelected = (sortMethod === option);
            const setSortFilter = () => {
                setSortMethod(option);
                closeAllFilters();
            }
            return (
                <SortOptionPressable onPress={setSortFilter}>
                    <SortOptionText selected={isSelected}>{displayText}</SortOptionText>
                    { isSelected && <SortOptionSelectedCircle /> }
                </SortOptionPressable>
            );
        }

        const SortOptions = () => {
            if (!showSortOptions) {
                return <View />
            }

            return (
                <SortOptionsView topOffset={topOffset}>
                    <SortOption option='mostRecent' optionDisplay={'most recent'} />
                    <SortOption option='thisWeek' optionDisplay={'this week'} />
                    <SortOption option='thisMonth' optionDisplay={'this month'} />
                    <SortOption option='allTime' optionDisplay={'all time'} />
                </SortOptionsView>
            );
        }

        const SortableHeader = () => {
            return (
                <DiscoveryBarLeftView>
                    { canGoBack && <BackButton /> }
                    <ExpandSortPressable onPress={() => setShowSortOptions(!showSortOptions)}>
                        <HeaderLeftSpacer />
                        <HeaderTextSortable>{getDisplayText()}</HeaderTextSortable>
                        <HeaderLeftSpacer />
                        <FontAwesomeIcon icon={faChevronDown} color='white' size={14} />
                    </ExpandSortPressable>
                    <SortOptions />
                </DiscoveryBarLeftView>
            );
        }
    
        return (
            <Fragment>
                <DiscoveryBarView onPress={closeAllFilters} topOffset={topOffset}>
                    { isFullScreen && <FullScreenHeader /> }
                    { !isFullScreen && !headerIsSortable && <NonSortableHeader /> }
                    { !isFullScreen && headerIsSortable && <SortableHeader /> }
                    { !isFullScreen && (feedSource === 'discover') && (
                        <DiscoveryBarRightView>
                            { showFilterActionButton && <FilterActionButton /> }
                            <ExpandFiltersButton />
                        </DiscoveryBarRightView>                    
                    )}
                </DiscoveryBarView>
            </Fragment>
        )
    }

    const ExpandFiltersButton = () => {
        return (
            <ExpandFiltersPressable onPress={() => {
                if (showAllFilters) {
                    setShowAllFilters(false);
                } else {
                    setShowFilterBar(!showFilterBar);
                }
            }} showFilters={showFilterBar || showAllFilters}>
                { !showFilterBar && !showAllFilters && <FiltersSVG /> }
                { (showFilterBar || showAllFilters) && <FontAwesomeIcon icon={faXmark} color='white' size={24} /> }
            </ExpandFiltersPressable>
        );
    }

    const FilterBar = () => {
        const renderFilter = (filter) => <FilterOption key={filter.option} filter={filter} />;
        return (
            <FilterBarView topOffset={topOffset}>
                { getTopFilters(selectedFilters).map(renderFilter) }
            </FilterBarView>
        );
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

    const FilterList = () => {
        return (
            <AllFiltersView>
                <FilterScrollView showsVerticalScrollIndicator={false} topOffset={topOffset}>
                    <FilterListTopSpacer />
                    { filterCategories.map(category => {
                        return <FilterCategory key={category} category={category} /> 
                    })}
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

    const FilterOption = ({ filter }) => {
        const { category, option, display } = filter;
        const isSelected = isFilterSelected(filter);
        const isAllFiltersOption = (option === 'see_all_filters');

        const onPress = () => {
            if (isAllFiltersOption) {
                setShowFilterBar(false);
                setShowAllFilters(true);
                // advanceToAllFiltersScreen();
            } else {
                onSelectOrUnselectFilter(filter);
            }
        }

        return (
            <FilterPressable selected={isSelected} allFilters={isAllFiltersOption} onPress={onPress}>
                <FilterText>{display}</FilterText>
                { isAllFiltersOption && <FontAwesomeIcon icon={faArrowDown} size={14} color='white' /> }
            </FilterPressable>
        )
    }

    const FilterActionButton = () => {
        const filterCount = selectedFilters.length;

        const getActionText = () => {
            if (noFiltersSelected) return 'all';
            if (!showFilterBar) return `${filterCount}x`;
            return 'reset';
        }

        const getAction = () => {
            if (!showFilterBar) return () => setShowFilterBar(!showFilterBar);
            if (noFiltersSelected) return () => {};
            return resetFilters;
        }

        return (
            <ResetFiltersPressable onPress={getAction()}>
                <ResetFiltersText>{getActionText()}</ResetFiltersText>
            </ResetFiltersPressable>
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
        <FeedHeaderView>
            <HeaderFill topOffset={topOffset} />
            { showFilterBar && <FilterBar /> }
            { showAllFilters && <FilterList /> }
            <DiscoveryBar />
        </FeedHeaderView>
    );
}