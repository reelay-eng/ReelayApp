import React from "react";
import { Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ReelayText from '../../components/global/Text';
import { HeaderWithBackButton } from "../../components/global/Headers";
import styled from 'styled-components/native';
import { getRuntimeString } from "../../components/utils/TitleRuntime";
import TitlePoster from "../../components/global/TitlePoster";
import { FlatList } from "react-native-gesture-handler";

const { width } = Dimensions.get('window');

const ActorText = styled(ReelayText.Subtitle2)`
    color: gray
`
const ClueReelayDescriptionView = styled(View)`
    align-items: center;
    background-color: #252527;
    border-radius: 10px;
    display: flex;
    flex: 1;
    flex-direction: row;
    height: 100%;
    padding: 16px;
`
const ClueReelayIndexText = styled(ReelayText.H5Bold)`
    color: white;
`
const ClueReelayIndexView = styled(View)`
    height: 100%;
    justify-content: center;
    margin-right: 12px;
    width: 24px;
`
const ClueReelayRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    height: 82px;
    margin-top: 8px;
    margin-bottom: 8px;
    width: 100%;
`
const CluesSectionView = styled(View)`
    padding: 16px;
    padding-top: 20px;
`
const GameTitleText = styled(ReelayText.Body1)`
    color: white;
`
const GameTitleView = styled(View)`
    border-color: rgba(255,255,255,0.5);
    border-radius: 8px;
    border-width: 1px;
    padding: 16px;
    margin: 16px;
    width: ${width - 32}px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
`
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
    margin-bottom: 8px;
`
const ImageContainer = styled(View)`
    flex-direction: row;
    align-items: center;
`
const ScreenView = styled(View)`
    top: ${props => props.topOffset}px;
`
const TitleText = styled(ReelayText.Subtitle1Emphasized)`
    color: white
`
const TitleInfoView = styled(View)`
    margin-left: 12px;
    margin-right: 20px;
`
const TitleLineView = styled(View)`
    flex-direction: row;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 4px;
    width: 100%;
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`



export default CreateGuessingGameCluesScreen = ({ navigation, route }) => {
    const topOffset = useSafeAreaInsets().top;
    const bottomOffset = useSafeAreaInsets().bottom;

    const gameTitle = route?.params?.game?.gameTitle;
    const correctTitleObj = route?.params?.game?.correctTitleObj;

    const title = correctTitleObj?.display;
    const actors = correctTitleObj?.displayActors?.map(actor => actor.name)
            .filter((actor) => actor !== undefined)
            .join(", ") 
        ?? [];


    const releaseYear = (correctTitleObj?.releaseDate && correctTitleObj?.releaseDate.length >= 4) 
        ? correctTitleObj.releaseDate.slice(0,4) : '';
    const runtimeString = getRuntimeString(correctTitleObj?.runtime);

    const ClueReelayRow = ({ item, index }) => {
        return (
            <ClueReelayRowView>
                <ClueReelayIndexView>
                    <ClueReelayIndexText>{index + 1}</ClueReelayIndexText>
                </ClueReelayIndexView>
                <ClueReelayDescriptionView />
            </ClueReelayRowView>
        );
    }

    const CluesSection = () => {
        return (
            <CluesSectionView>
                <HeaderText>{'Clues'}</HeaderText>
                <HeaderSubText>{'Add reelays to help people guess the title. Players get one guess for each reelay they see.'}</HeaderSubText>
                <FlatList
                    data={[1,2,3,4,5,6]}
                    renderItem={({ item, index }) => <ClueReelayRow item={item} index={index} /> }                
                    showsVerticalScrollIndicator={false}
                    style={{ height: '50%'}}
                />
            </CluesSectionView>
        );
    }

    const CorrectTitleLine = () => {
        return (
            <TitleLineView>
                <ImageContainer>
                    { correctTitleObj?.posterSource && (
                        <TitlePoster title={correctTitleObj} width={60} />
                    )}
                    { !correctTitleObj.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
                </ImageContainer>
                <TitleInfoView>
                    <TitleText>{title}</TitleText>
                    <YearText>{`${releaseYear}    ${runtimeString}`}</YearText>
                    <ActorText>{actors}</ActorText>
                </TitleInfoView>
            </TitleLineView>
        );
    }

    return (
        <ScreenView topOffset={topOffset}>
            <HeaderWithBackButton navigation={navigation} text={'guessing game'} />
            <GameTitleView>
                <GameTitleText>{gameTitle}</GameTitleText>
            </GameTitleView>
            <CorrectTitleLine />
            <CluesSection />
        </ScreenView>
    )
}