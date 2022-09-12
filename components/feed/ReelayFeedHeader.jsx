import React, { Fragment, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faArrowRight, faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FiltersSVG } from '../global/SVGs';
import ReelayColors from '../../constants/ReelayColors';

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
    width: 133px;
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
    setSortMethod
}) => {
    const topOffset = useSafeAreaInsets().top;
    const canGoBack = navigation.getState().index > 0;
    const resetFilter = { category: 'all', option: 'unselect_all', display: 'all' };

    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([resetFilter]);
    const [showSortOptions, setShowSortOptions] = useState(false);

    const expandSort = () => setShowSortOptions(!showSortOptions);

    const closeAllFilters = () => {
        setShowFilters(false);
        setShowSortOptions(false);
    }

    const expandFilters = () => setShowFilters(!showFilters);
    const isResetOption = (filter) => (filter.option === 'unselect_all');
    const noFiltersSelected = (selectedFilters.length === 1 && isResetOption(selectedFilters[0]));
    const showFilterActionButton = (!noFiltersSelected || !showFilters);

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

    const getDisplayFilters = () => {
        return [
            { category: 'all', option: 'unselect_all', display: 'all' },
            { category: 'community', option: 'following', display: 'following' },
            { category: 'popularityAndRating', option: 'highly_rated', display: 'highly-rated' },
            { category: 'titleType', option: 'film', display: 'movies' },
            { category: 'titleType', option: 'tv', display: 'TV' },
            { category: 'venue', option: 'on_my_streaming', display: 'on my streaming' },
            { category: 'venue', option: 'theaters', display: 'in theaters' },
            { category: 'all', option: 'see_all_filters', display: 'see all ' },
        ]
    }

    const isFilterSelected = (filter) => {
        const matchFilter = (nextFilter) => (nextFilter.display === filter.display);
        return selectedFilters.find(matchFilter);
    }

    const onSelectOrUnselectFilter = (filter) => {
        const isSelecting = !isFilterSelected(filter);
        const isResetOption = (filter.option === 'unselect_all');
        const removeResetOption = (nextFilter) => (nextFilter.option !== 'unselect_all')
        if (isResetOption) {
            resetFilters();
            return;
        }

        if (isSelecting) {
            const nextSelectedFilters = [...selectedFilters, filter].filter(removeResetOption);
            setSelectedFilters(nextSelectedFilters);
        } else {
            const removeFilter = (nextFilter) => (nextFilter.display !== filter.display);
            const nextSelectedFilters = selectedFilters.filter(removeFilter);
            setSelectedFilters(nextSelectedFilters);
        }
    }

    const resetFilters = () => {
        setSelectedFilters([resetFilter]);
        // todo
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
                    <ExpandSortPressable onPress={expandSort}>
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
                    {/* { !isFullScreen && (
                        <DiscoveryBarRightView>
                            { showFilterActionButton && <FilterActionButton /> }
                            <ExpandFiltersButton />
                        </DiscoveryBarRightView>                    
                    )} */}
                </DiscoveryBarView>
            </Fragment>
        )
    }

    const ExpandFiltersButton = () => {
        return (
            <ExpandFiltersPressable onPress={expandFilters} showFilters={showFilters}>
                { !showFilters && <FiltersSVG /> }
                { showFilters && <FontAwesomeIcon icon={faXmark} color='white' size={24} /> }
            </ExpandFiltersPressable>
        );
    }

    const FilterBar = () => {
        const renderFilter = (filter) => {
            return <FilterOption key={filter.option} filter={filter} selected={false} setSelected={() => {}} />
        }

        return (
            <FilterBarView topOffset={topOffset}>
                { getDisplayFilters().map(renderFilter) }
            </FilterBarView>
        );
    }

    const FilterOption = ({ filter }) => {
        const { category, option, display } = filter;
        const isSelected = isFilterSelected(filter);
        const isAllFiltersOption = (option === 'see_all_filters');
        const advanceToAllFiltersScreen = () => navigation.push('FeedFiltersScreen', { feedSource });

        const onPress = () => {
            if (isAllFiltersOption) {
                advanceToAllFiltersScreen();
            } else {
                onSelectOrUnselectFilter(filter);
            }
        }

        return (
            <FilterPressable selected={isSelected} allFilters={isAllFiltersOption} onPress={onPress}>
                <FilterText>{display}</FilterText>
                { isAllFiltersOption && <FontAwesomeIcon icon={faArrowRight} size={14} color='white' /> }
            </FilterPressable>
        )
    }

    const FilterActionButton = () => {
        const filterCount = selectedFilters.length;

        const getActionText = () => {
            if (noFiltersSelected) return 'all';
            if (!showFilters) return `${filterCount}x`;
            return 'reset';
        }

        const getAction = () => {
            if (!showFilters) return expandFilters;
            if (noFiltersSelected) return () => {};
            return resetFilters;
        }

        return (
            <ResetFiltersPressable onPress={getAction()}>
                <ResetFiltersText>{getActionText()}</ResetFiltersText>
            </ResetFiltersPressable>
        );
    }

    return (
        <FeedHeaderView>
            <HeaderFill topOffset={topOffset} />
            { showFilters && <FilterBar /> }
            <DiscoveryBar />
        </FeedHeaderView>
    );
}