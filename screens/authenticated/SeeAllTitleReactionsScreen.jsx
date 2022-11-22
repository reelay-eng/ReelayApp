import React from 'react';
import { View } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import TitleReactions from '../../components/titlePage/TitleReactions';
import BackButton from '../../components/utils/BackButton';
import AddToWatchlistButton from '../../components/watchlist/AddToWatchlistButton';

const HeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding-top: ${props => props.topOffset}px;
    padding-bottom: 10px;
    padding-left: 8px;
    padding-right: 8px;
    width: 100%;
`
const ScreenView = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`
const TitleText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 18px;
`

export default SeeAllTitleReactionsScreen = ({ navigation, route }) => {
    const titleObj = route?.params?.titleObj;
    const topOffset = useSafeAreaInsets().top;
    
    const Header = () => {
        return (
            <HeaderView topOffset={topOffset}>
                <BackButton navigation={navigation} />
                <TitleText>{titleObj?.display}</TitleText>
                <AddToWatchlistButton titleObj={titleObj} />
            </HeaderView>
        );
    }

    return (
        <ScreenView>
            <Header />
            <TitleReactions 
                navigation={navigation} 
                seeAll={true} 
                titleObj={titleObj} 
            />
        </ScreenView>
    )
}