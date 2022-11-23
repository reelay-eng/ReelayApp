import React, { Fragment } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import FanOfPosters from '../watchlist/FanOfPosters';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AddToWatchlistPressable = styled(TouchableOpacity)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    padding: 15px;
    padding-top: 5px;
    height: 100%;
`
const AddText = styled(ReelayText.Caption)`
    color: ${ReelayColors.reelayBlue};
    font-size: 16px;
`
const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 4px;
    margin-left: 16px;
    margin-bottom: 8px;
`
const HeaderContainerLeft = styled(View)`
    display: flex;
    flex: 1;
`
const HeaderText = styled(ReelayText.H4Bold)`
    color: white;
    font-size: 20px;
    line-height: 24px;
    margin-bottom: 8px;
`
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
`
const HomeWatchlistCardFill = styled(View)`
    background-color: #1A8BF2;
    border-radius: 12px;
    height: 100%;
    opacity: 0.2;
    position: absolute;
    width: 100%;
`
const HomeWatchlistCardGradient = styled(LinearGradient)`
    border-radius: 12px;
    height: 100%;
    opacity: 0.2;
    position: absolute;
    width: 100%;
`
const HomeWatchlistCardView = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 12px;
    height: 256px;
    justify-content: center;
    left: 16px;
    margin-top: 8px;
    margin-bottom: 16px;
    width: ${width - 32}px;
`
const WatchlistText = styled(ReelayText.H6)`
    color: white;
    margin-top: 8px;
    font-size: 24px;
`

export default HomeWatchlistCard = ({ navigation }) => {
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const myWatchlistRecs = useSelector(state => state.myWatchlistRecs);

    const advanceToAddToWatchlistScreen = () => navigation.push('SearchScreen', { addToWatchlist: true });
    const advanceToWatchlistScreen = () => navigation.push('WatchlistScreen', { myWatchlistItems, myWatchlistRecs });

    const AddToWatchlistButton = () => {
        return (
            <Fragment>
                <AddToWatchlistPressable onPress={advanceToAddToWatchlistScreen}>
                    <AddText>{'Add'}</AddText>
                </AddToWatchlistPressable>
            </Fragment>
        );
    }

    const SectionHeader = () => {
        return (
            <HeaderContainer>
                <HeaderContainerLeft>
                    <HeaderText>{'Watchlist'}</HeaderText>
                    <HeaderSubText>{'"What are we gonna watch tonight?"'}</HeaderSubText>
                    <HeaderSubText>{'YOU have the answer'}</HeaderSubText>
                </HeaderContainerLeft>
                <AddToWatchlistButton />
            </HeaderContainer>
        );
    }
    
    if (myWatchlistItems?.length === 0) {
        return <View />
    }

    return (
        <Fragment>
            <SectionHeader />
            <HomeWatchlistCardView onPress={advanceToWatchlistScreen}>
                <HomeWatchlistCardFill />
                <HomeWatchlistCardGradient colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']} />
                <FanOfPosters titles={myWatchlistItems.map(item => item.title)} />
                <WatchlistText>{'My watchlist'}</WatchlistText>
            </HomeWatchlistCardView>
        </Fragment>
    );
}
