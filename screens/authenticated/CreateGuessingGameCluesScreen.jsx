import React, { useEffect, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ReelayText from '../../components/global/Text';
import { HeaderWithBackButton } from "../../components/global/Headers";
import styled from 'styled-components/native';
import { getRuntimeString } from "../../components/utils/TitleRuntime";
import TitlePoster from "../../components/global/TitlePoster";
import { FlatList, ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler";
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import ReelayColors from "../../constants/ReelayColors";
import { LogBox } from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

const { width } = Dimensions.get('window');

const ActorText = styled(ReelayText.Subtitle2)`
    color: gray
`
const AddReelayButtonView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    padding-left: 16px;
    padding-right: 16px;
`
const ClueReelayDescriptionText = styled(ReelayText.Body1)`
    align-items: flex-end;
    color: white;
    flex: 1;
    flex-direction: row;
    text-align: left;
`
const ClueReelayDescriptionView = styled(View)`
    align-items: center;
    background-color: ${props => props.backgroundColor};
    border-radius: 10px;
    display: flex;
    flex: 1;
    flex-direction: row;
    height: 100%;
    justify-content: flex-end;
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
const ClueReelayRowPressable = styled(TouchableWithoutFeedback)`
    align-items: center;
    flex-direction: row;
    height: 82px;
    margin-top: 8px;
    margin-bottom: 8px;
    padding-left: 16px;
    padding-right: 16px;
    width: 100%;
`
const CluesHeaderView = styled(View)`
    padding: 16px;
    padding-top: 20px;
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

    const [clues, setClues] = useState([null]);

    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    }, []);

    const ClueReelayDescription = ({ isActive, reelay = null }) => {
        const backgroundColor = (isActive) 
            ? ReelayColors.reelayBlue
            : (!!reelay) ? '#252527' : 'black';

        if (!reelay) {
            return (
                <ClueReelayDescriptionView isActive={isActive} backgroundColor={backgroundColor}>
                    <ClueReelayDescriptionText>{'Add a video clue...'}</ClueReelayDescriptionText>
                    <AddReelayButtonView>
                        <FontAwesomeIcon icon={faPlusCircle} size={30} color='white' />
                    </AddReelayButtonView>
                </ClueReelayDescriptionView>
            );    
        } else {
            return (
                <ClueReelayDescriptionView isActive={isActive} backgroundColor={backgroundColor}>
    
                </ClueReelayDescriptionView>
            );    
        }
    }

    const ClueReelayRow = ({ item, index, drag, isActive }) => {
        const advanceToCreateReelayScreen = () => navigation.push('ReelayCameraScreen', {
            titleObj: correctTitleObj
        })

        const reelay = item;
        const onPress = (reelay) ? () => {} : advanceToCreateReelayScreen;
        return (
            <ClueReelayRowPressable delayLongPress={250} onPress={onPress} onLongPress={drag} disabled={isActive}>
                <ClueReelayIndexView>
                    <ClueReelayIndexText>{index + 1}</ClueReelayIndexText>
                </ClueReelayIndexView>
                <ClueReelayDescription isActive={isActive} />
            </ClueReelayRowPressable>
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

    const ComponentAboveList = () => {
        return (
            <View>
                <HeaderWithBackButton navigation={navigation} text={'guessing game'} />
                <GameTitleView>
                    <GameTitleText>{gameTitle}</GameTitleText>
                </GameTitleView>
                <CorrectTitleLine />
                <CluesHeaderView>
                    <HeaderText>{'Clues'}</HeaderText>
                    <HeaderSubText>{'Add reelays to help people guess the title. Players get one guess for each reelay they see.'}</HeaderSubText>
                    <HeaderSubText>{'Press and hold to reorder.'}</HeaderSubText>
                </CluesHeaderView>
            </View>
        );
    }

    const ComponentBelowList = () => {
        return (
            <View style={{ height: 200 }} />
        )
    }

    return (
        <ScreenView topOffset={topOffset}>
            <DraggableFlatList
                ListHeaderComponent={ComponentAboveList}
                ListFooterComponent={ComponentBelowList}
                data={clues}
                keyExtractor={(item, index) => (!!item) ? item?.id : index}
                onDragEnd={({ data }) => setClues(data)}
                renderItem={(props) => <ClueReelayRow { ...props } /> }                
                showsVerticalScrollIndicator={false}
            />
        </ScreenView>
    )
}