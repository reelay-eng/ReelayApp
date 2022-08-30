import React, { Fragment, useState } from 'react';
import { SafeAreaView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
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
    background-color: #333333;
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
    border-color: #79747E;
    border-radius: 8px;
    border-width: ${props => props.allFilters ? 1 : 0}px;
    height: 28px;
    justify-content: center;
    margin-right: 8px;
    margin-top: 6px;
    margin-bottom: 6px;
    padding-left: 8px;
    padding-right: 8px;
    padding-top: 2px;
    padding-bottom: 2px;
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

export default ReelayFeedHeader = ({ navigation, feedSource = 'discover' }) => {
    const topOffset = useSafeAreaInsets().top;
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({});
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
            { category: 'community', option: 'following', display: 'friends' },
            { category: 'popularityAndRating', option: 'highly_rated', display: 'highly-rated' },
            { category: 'titleType', option: 'film', display: 'movie' },
            { category: 'titleType', option: 'tv', display: 'TV' },
            { category: 'venue', option: 'on_my_streaming', display: 'on my streaming' },
            { category: 'venue', option: 'theaters', display: 'in theaters' },
            { category: 'all', option: 'see_all_filters', display: 'all filters' },
        ]
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
                    { feedSource === 'discover' && <DiscoverHeader /> }
                    { feedSource !== 'discover' && <WhenableHeader /> }
                    <DiscoveryBarRightView>
                        <ResetFiltersButton />
                        <ExpandFiltersButton />
                    </DiscoveryBarRightView>
                </DiscoveryBarView>
            </Fragment>
        )
    }

    const ExpandFiltersButton = () => {
        return (
            <ExpandFiltersPressable onPress={expandFilters}>
                <FiltersSVG />
            </ExpandFiltersPressable>
        );
    }

    const FilterBar = () => {
        const renderFilter = (filter) => {
            return <FilterOption filter={filter} selected={false} setSelected={() => {}} />
        }

        return (
            <FilterBarView topOffset={topOffset}>
                { getDisplayFilters().map(renderFilter) }
            </FilterBarView>
        );
    }

    const FilterOption = ({ filter, selected, setSelected }) => {
        console.log('filter: ', filter);
        const { category, option, display } = filter;
        const selectOrUnselectFilter = () => {
            setSelected(!selected);
            // todo
        }
        return (
            <FilterPressable key={display} onPress={selectOrUnselectFilter}>
                <FilterText>{display}</FilterText>
            </FilterPressable>
        )
    }

    const ResetFiltersButton = () => {
        const resetFilters = () => {};
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