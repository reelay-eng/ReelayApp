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
    padding: 6px;
    position: absolute;
    top: ${props => props.topOffset}px;
    width: 100%;
`
const DiscoveryBarLeftView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-top: 12px;
    width: 50%;
`
const DiscoveryBarRightView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: flex-end;
    width: 50%;
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
    margin-left: 10px;
`
const HeaderFill = styled(View)`
    background-color: black;
    height: ${props => props.topOffset + 50}px;
    position: absolute;
    width: 100%;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 20px;
    line-height: 20px;
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
const WhenOptionPressable = styled(TouchableOpacity)`
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 7px;
    padding-bottom: 7px;
`
const WhenOptionText = styled(ReelayText.Body2)`
    color: white;
    text-align: right;
`
const WhenOptionsView = styled(View)`
    background-color: black;
    border-bottom-left-radius: 14px;
    border-bottom-right-radius: 14px;
    padding: 4px;
    top: ${props => props.topOffset}px;
    width: 200px;
`

export default ReelayFeedHeader = ({ navigation, feedSource = 'discover' }) => {
    const topOffset = useSafeAreaInsets().top;

    const getDisplayFeedSource = () => {
        switch (feedSource) {
            case 'festivals': return 'at festivals';
            case 'following': return 'friends are watching';
            case 'discover': return 'discover';
            case 'popularTitlesDiscover': return 'popular titles';
            case 'popularTitlesFollowing': return 'popular titles with friends';
            case 'single': return '';
            case 'streaming': return 'on streaming'; 
            case 'theaters': return 'in theaters';
            case 'trending': return 'top of the Week';
            default: 
                return '';
        }
    }

    const BackButton = () => {
        return (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 6 }}>
                <FontAwesomeIcon icon={faArrowLeft} size={20} color='white' />
            </TouchableOpacity>
        );
    }

    const DiscoveryBar = () => {
        const [showWhenOptions, setShowWhenOptions] = useState(false);

        const ExpandWhenButton = () => {
            const expandWhen = () => setShowWhenOptions(!showWhenOptions);
            return (
                <ExpandWhenPressable onPress={expandWhen}>
                    <FontAwesomeIcon icon={faChevronDown} color='white' size={14} />
                </ExpandWhenPressable>
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
    
        return (
            <Fragment>
                <DiscoveryBarView topOffset={topOffset}>
                    <DiscoveryBarLeftView>
                        { feedSource !== 'discover' && <BackButton /> }
                        <HeaderText>{getDisplayFeedSource()}</HeaderText>
                        { feedSource !== 'discover' && <ExpandWhenButton /> }
                    </DiscoveryBarLeftView>
                    <DiscoveryBarRightView>
                        <ResetFiltersButton />
                        <ExpandFiltersButton />
                    </DiscoveryBarRightView>
                </DiscoveryBarView>
                { showWhenOptions && <WhenOptions/> }
            </Fragment>
        )
    }

    const ExpandFiltersButton = () => {
        const expandFilters = () => {};
        return (
            <ExpandFiltersPressable onPress={expandFilters}>
                <FiltersSVG />
            </ExpandFiltersPressable>
        );
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
            <DiscoveryBar />
        </FeedHeaderView>
    );
}