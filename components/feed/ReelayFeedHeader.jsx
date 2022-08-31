import React, { Fragment, useState } from 'react';
import { SafeAreaView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faArrowRight, faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FiltersSVG } from '../global/SVGs';
import ReelayColors from '../../constants/ReelayColors';

const DiscoveryBarView = styled(View)`
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
    background-color: ${props => props.showFilters ? 'black' : '#333333' };
    border-radius: 17px;
    height: 34px;
    justify-content: center;
    margin-left: 16px;
    width: 34px;
`
const ExpandWhenPressable = styled(TouchableOpacity)`
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
    top: ${props => props.topOffset + 50}px;
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
    height: ${props => props.topOffset + 50}px;
    position: absolute;
    width: 100%;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 24px;
    line-height: 24px;
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
const WhenOptionPressable = styled(TouchableOpacity)`
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 7px;
    padding-bottom: 7px;
`
const WhenOptionText = styled(ReelayText.Body2)`
    color: white;
    font-size: 16px;
    text-align: right;
`
const WhenOptionsView = styled(View)`
    background-color: black;
    border-bottom-left-radius: 14px;
    border-bottom-right-radius: 14px;
    padding: 4px;
    position: absolute;
    top: ${props => props.topOffset - 20}px;
    width: 100%;
`

export default ReelayFeedHeader = ({ navigation, feedSource = 'discover', isFullScreen = false }) => {
    const topOffset = useSafeAreaInsets().top;
    const resetFilter = { category: 'all', option: 'unselect_all', display: 'all' };
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([resetFilter]);
    const expandFilters = () => setShowFilters(!showFilters);

    const getDisplayFeedSource = () => {
        switch (feedSource) {
            case 'festivals': return 'at festivals';
            case 'following': return 'friends are watching';
            case 'discover': return 'discover';
            case 'popularTitlesDiscover': return 'popular titles';
            case 'popularTitlesFollowing': return 'popular titles';
            case 'single': return '';
            case 'streaming': return 'on streaming'; 
            case 'topics': return 'topics';
            case 'theaters': return 'in theaters';
            case 'trending': return 'top of the week';
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

    const DiscoveryBar = () => {
        const [showWhenOptions, setShowWhenOptions] = useState(false);
        const expandWhen = () => setShowWhenOptions(!showWhenOptions);

        const DiscoverHeader = () => {
            return (
                <DiscoveryBarLeftView>
                    <HeaderText>{'discover'}</HeaderText>
                </DiscoveryBarLeftView>
            );
        }

        const FullScreenHeader = () => {
            return (
                <DiscoveryBarLeftView>
                    <BackButton />
                    <HeaderLeftSpacer />
                    <HeaderText>{getDisplayFeedSource()}</HeaderText>
                </DiscoveryBarLeftView>
            );
        }

        const WhenOption = ({ option, optionDisplay }) => {
            const setWhenFilter = () => {}
            return (
                <WhenOptionPressable>
                    <WhenOptionText>{optionDisplay}</WhenOptionText>
                </WhenOptionPressable>
            );
        }

        const WhenOptions = () => {
            return (
                <WhenOptionsView topOffset={topOffset}>
                    <WhenOption option='mostRecent' optionDisplay={'most recent'} />
                    <WhenOption option='thisWeek' optionDisplay={'this week'} />
                    <WhenOption option='thisMonth' optionDisplay={'this month'} />
                    <WhenOption option='allTime' optionDisplay={'all time'} />
                </WhenOptionsView>
            );
        }

        const WhenableHeader = () => {
            return (
                <DiscoveryBarLeftView>
                    <BackButton />
                    <ExpandWhenPressable onPress={expandWhen}>
                        <HeaderLeftSpacer />
                        <HeaderText>{getDisplayFeedSource()}</HeaderText>
                        <HeaderLeftSpacer />
                        <FontAwesomeIcon icon={faChevronDown} color='white' size={14} />
                    </ExpandWhenPressable>
                    { showWhenOptions && <WhenOptions/> }
                </DiscoveryBarLeftView>
            );
        }
    
        return (
            <Fragment>
                <DiscoveryBarView topOffset={topOffset}>
                    { isFullScreen && <FullScreenHeader /> }
                    { !isFullScreen && feedSource === 'discover' && <DiscoverHeader /> }
                    { !isFullScreen && feedSource !== 'discover' && <WhenableHeader /> }
                    { !isFullScreen && (
                        <DiscoveryBarRightView>
                            { !showFilters && <ResetFiltersButton /> }
                            <ExpandFiltersButton />
                        </DiscoveryBarRightView>                    
                    )}
                </DiscoveryBarView>
            </Fragment>
        )
    }

    const ExpandFiltersButton = () => {
        return (
            <ExpandFiltersPressable onPress={expandFilters} showFilters={showFilters}>
                { !showFilters && <FiltersSVG /> }
                { showFilters && <FontAwesomeIcon icon={faXmark} color='white' size={30} /> }
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

    const ResetFiltersButton = () => {
        return (
            <ResetFiltersPressable onPress={resetFilters}>
                <ResetFiltersText>{'reset'}</ResetFiltersText>
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