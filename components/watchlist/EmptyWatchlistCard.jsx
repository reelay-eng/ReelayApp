import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';

import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { ClubsIconSVG } from '../global/SVGs';
import ReelayColors from '../../constants/ReelayColors';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

const { height, width } = Dimensions.get('window');

const AddFromReelaysGradient = styled(LinearGradient)`
    border-radius: 30px;
    height: 60px;
    position: absolute;
    width: 100%;
`
const AddFromReelaysPressable = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 30px;
    height: 60px;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 12px;
    width: 90%;
`
const AddFromReelaysText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    display: flex;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
`
const AddFromSearchPressable = styled(AddFromReelaysPressable)`
    background-color: white;
`
const AddFromSearchText = styled(AddFromReelaysText)`
    color: black
`

const EmptyWatchlistView = styled(View)`
    align-items: center;
    display: flex;
    justify-content: center;
    margin-left: 16px;
    margin-right: 16px;
    margin-top: 24px;
    margin-bottom: 100px;
    width: ${width - 32}px;
`
const EmptyWatchlistOuterView = styled(View)`
    align-items: center;
    height: ${height - 200}px;
    justify-content: center;
    width: 100%;
`
const SectionHeader = styled(ReelayText.H5Bold)`
    color: white;
    line-height: 28px;
    margin-bottom: 20px;
    padding: 20px;
    text-align: center;
    width: 100%;
`
const SectionView = styled(View)`
    align-items: center;
    padding: 12px;
    width: 100%;
`
const TopAndBottomSpacer = styled(View)`
    height: 18px;
`

export default EmptyWatchlistCard = ({ navigation }) => {
    const topOfTheWeek = useSelector(state => state.myHomeContent?.discover?.topOfTheWeek);

    const AddFromReelaysButton = () => {
        const advanceToBrowseReelays = () => {
            navigation.push("FeedScreen", {
                initialFeedPos: 0,
                initialFeedSource: 'trending',
                preloadedStackList: topOfTheWeek,
            });    
        }

        return (
            <AddFromReelaysPressable onPress={advanceToBrowseReelays}>
                <AddFromReelaysGradient 
                    colors={[ReelayColors.reelayBlue, ReelayColors.reelayRed]} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <AddFromReelaysText>{'Browse reelays'}</AddFromReelaysText>
            </AddFromReelaysPressable>
        );
    }

    const AddFromSearchButton = () => {
        return (
            <AddFromSearchPressable onPress={() => navigation.push('SearchScreen')}>
                <AddFromSearchText>{'Search for titles'}</AddFromSearchText>
            </AddFromSearchPressable>
        );
    }

    return (
        <EmptyWatchlistOuterView>
            <EmptyWatchlistView>
                <TopAndBottomSpacer />
                <ClubsIconSVG enlarge={true} sizeRatio={0.15} />
                <SectionHeader numberOfLines={3}>
                    {'Add some titles to your watchlist'}
                </SectionHeader>
                <AddFromReelaysButton />
                <AddFromSearchButton />
                <TopAndBottomSpacer />
            </EmptyWatchlistView>
        </EmptyWatchlistOuterView>
    );
}