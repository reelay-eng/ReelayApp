import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowDown, faArrowLeft, faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FiltersSVG } from '../global/SVGs';
import ReelayColors from '../../constants/ReelayColors';
import { FilterMappings, getTopFilters } from '../utils/FilterMappings';
import AllFeedFilters from './AllFeedFilters';
import NoResults from './NoResults';
import { AuthContext } from '../../context/AuthContext';

const { height, width } = Dimensions.get('window');

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
    margin-top: 6px;
    margin-left: 12px;
`
const DiscoveryBarRightView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-end;
    padding-right: 6px;
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
const FilterBarBackdrop = styled(Pressable)`
    height: ${height}px;
    position: absolute;
    width: ${width}px;
`
const FilterBarView = styled(View)`
    background-color: black;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 12px;
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
`
const FeedHeaderView = styled(SafeAreaView)`
    position: absolute;
    width: 100%;
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
    width: 110%;
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
    hasResults = true,
    navigation, 
    sortMethod = 'mostRecent',
    setSortMethod = () => {},
    selectedFilters = [],
    setSelectedFilters = () => {},
    playGame = false,
    callFunction  = () => {}
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
    const hideForGuests = ['following', 'on_my_streaming', 'in_my_clubs'];

    const canGoBack = navigation.getState().index > 0;
    const topOffset = useSafeAreaInsets().top;

    const [showFilterBar, setShowFilterBar] = useState(false);
    const [showAllFilters, setShowAllFilters] = useState(false);
    const [showSortOptions, setShowSortOptions] = useState(false);

    const closeAllMenus = () => {
        setShowFilterBar(false);
        setShowSortOptions(false);
        setShowAllFilters(false);
    }

    const closeAllFiltersList = () => setShowAllFilters(false);
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
            case 'guessingGame': return 'guess the title';
            case 'popularTitlesDiscover': return 'popular titles';
            case 'popularTitlesFollowing': return 'popular titles';
            case 'recommendedTitles': return 'recommended';
            case 'recommendedTitlesNoFollowing': return 'recommended';
            case 'single': return 'reelay';
            case 'streaming': return 'on streaming'; 
            case 'title': return 'reelays';
            case 'topics': return 'topics';
            case 'theaters': return 'in theaters';
            case 'trending': return 'trending';
            case 'upload': return 'preview';
            case 'discovernew': return 'Discover';
            default: 
                return '';
        }
    }

    const isFilterSelected = (filter) => {
        const { category, option } = filter;
        if (option === 'reset') return noFiltersSelected;

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

        const nextSelectedFilters = (isSelecting)
            ? [...selectedFilters, filter]
            : selectedFilters.filter(removeFilter);

        setSelectedFilters(nextSelectedFilters);
    }

    const resetFilters = (category = 'all') => {
        if (category === 'all') {
            setSelectedFilters([]);
            return;
        }

        const removeCategoryFilters = (nextFilter) => (nextFilter.category !== category);
        const nextSelectedFilters = selectedFilters.filter(removeCategoryFilters);
        setSelectedFilters(nextSelectedFilters);
    }

    const BackButton = () => {
        return (
            <TouchableOpacity onPress={() => playGame? callFunction(): navigation.goBack()} hitSlop={10}>
                <FontAwesomeIcon icon={faArrowLeft} size={20} color='white' />
            </TouchableOpacity>
        );
    }

    const DiscoveryBar = () => {
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
                closeAllMenus();
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
                <DiscoveryBarView onPress={closeAllMenus} topOffset={topOffset}>
                    { !headerIsSortable && <NonSortableHeader /> }
                    { headerIsSortable && <SortableHeader /> }
                    { (feedSource === 'discover') && (
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
            return () => resetFilters('all');
        }

        return (
            <ResetFiltersPressable onPress={getAction()}>
                <ResetFiltersText>{getActionText()}</ResetFiltersText>
            </ResetFiltersPressable>
        );
    }

    const FilterBar = () => {
        const renderFilter = (filter) => {
            if (isGuestUser && hideForGuests.includes(filter.option)) return <View key={filter.option} />;
            return <FilterOption key={filter.option} filter={filter} />;
        }
        return (
            <FilterBarView topOffset={topOffset}>
                <FilterBarBackdrop onPress={closeAllMenus} />
                { getTopFilters(selectedFilters).map(renderFilter) }
            </FilterBarView>
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

    return (
        <FeedHeaderView>
            <HeaderFill topOffset={topOffset} />
            { showFilterBar && <FilterBar /> }
            { showAllFilters && (
                <AllFeedFilters 
                    closeAllFiltersList={closeAllFiltersList}
                    selectedFilters={selectedFilters} 
                    setSelectedFilters={setSelectedFilters} 
                /> 
            )}
            { !hasResults && <NoResults resetFilters={resetFilters} /> }
            <DiscoveryBar />
        </FeedHeaderView>
    );
}