import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, SafeAreaView, TouchableOpacity, View } from 'react-native';
import DogWithGlasses from '../../assets/images/dog-with-glasses.png';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height, width } = Dimensions.get('window');

const BottomContainer = styled(View)`
    align-items: center;
    width: 100%;
`
const DogWithGlassesImage = styled(Image)`
    height: 200px;
    width: 200px;
`
const DogWithGlassesContainer = styled(View)`
    align-items: center;
    justify-content: center;
    width: 100%;
`
const ExplainText = styled(ReelayText.Body2Emphasized)`
    color: gray;
    font-size: 16px;
    font-weight: 500;
    line-height: 32px;
    text-align: center;
    width: 75%;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 22px;
    font-weight: 700;
    line-height: 32px;
    text-align: center;
`
const JustShowMeContainer = styled(SafeAreaView)`
    align-items: center;
    justify-content: center;
    height: 100%;
`
const NoResultsView = styled(View)`
    justify-content: center;
    height: ${props => height - props.topOffset}px;
    width: ${width}px;
`
const OpenFiltersButton = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 60px;
    height: 48px;
    justify-content: center;
    width: 60%;
`
const OpenFiltersText = styled(ReelayText.Overline)`
    color: white;
    text-align: center;
`
const Spacer = styled(View)`
    height: 24px;
`
const TopContainer = styled(View)`
    align-items: center;
    justify-content: center;
    width: 100%;
`

export default NoResults = ({ resetFilters }) => {
    const topOffset = useSafeAreaInsets().top + 46;
    const [loading, setLoading] = useState(false);
    return (
        <NoResultsView topOffset={topOffset}>
            <JustShowMeContainer>
                <TopContainer>
                    <DogWithGlassesContainer>
                        <DogWithGlassesImage source={DogWithGlasses} style={{
                            height: 140,
                            width: 140,
                        }} />
                    </DogWithGlassesContainer>
                    <Spacer />
                    <HeaderText>{'Ruh roh'}</HeaderText>
                    <Spacer />
                    <ExplainText>
                        {"You’ve selected a combination of filters with zero results..."}
                    </ExplainText>
                </TopContainer>
                <BottomContainer>
                    <Spacer />
                    <Spacer />
                    <Spacer />
                    <OpenFiltersButton onPress={() => {
                        setLoading(true);
                        resetFilters();
                    }}>
                        { !loading && <OpenFiltersText>{'Reset Filters'}</OpenFiltersText> }
                        { loading && <ActivityIndicator /> }
                    </OpenFiltersButton>
                </BottomContainer>
            </JustShowMeContainer>
        </NoResultsView>
    );
}
