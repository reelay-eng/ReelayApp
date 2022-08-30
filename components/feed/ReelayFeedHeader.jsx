import React from 'react';
import { SafeAreaView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
        return (
            <DiscoveryBarView topOffset={topOffset}>
                <DiscoveryBarLeftView>
                    { feedSource !== 'discover' && <BackButton /> }
                    <HeaderText>{getDisplayFeedSource()}</HeaderText>
                </DiscoveryBarLeftView>
                <DiscoveryBarRightView>
                    <ResetFiltersButton />
                    <ExpandFiltersButton />
                </DiscoveryBarRightView>
            </DiscoveryBarView>
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