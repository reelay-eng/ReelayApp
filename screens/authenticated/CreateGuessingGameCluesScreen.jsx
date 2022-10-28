import React, { Fragment, useContext, useEffect, useState } from "react";
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
import { faEllipsisVertical, faPlay, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import UploadProgressBar from "../../components/global/UploadProgressBar";
import { getGameDetails, getMyDraftGuessingGames, patchGuessingGameDetails } from "../../api/GuessingGameApi";
import { AuthContext } from "../../context/AuthContext";
import ReelayThumbnail from "../../components/global/ReelayThumbnail";
import DeleteGuessingGameDrawer from "../../components/games/DeleteGuessingGameDrawer";
import DeleteGuessingGameClueDrawer from "../../components/games/DeleteGuessingGameClueDrawer";

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
const ClueBarText = styled(ReelayText.Body1)`
    align-items: flex-end;
    color: white;
    flex: 1;
    flex-direction: row;
    font-size: 14px;
    padding: 12px;
    padding-left: 0px;
    text-align: left;
`
const ClueBarView = styled(View)`
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
const ClueReelayRowPressable = styled(TouchableOpacity)`
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
const DeleteDraftPressable = styled(TouchableOpacity)`
    position: absolute;
    padding: 10px;
    right: 10px;
`
const DotMenuPressable = styled(TouchableOpacity)`
    align-items: center;
    height: 100%;
    justify-content: center;
    padding: 12px;
`
const GameTitleText = styled(ReelayText.Body1)`
    color: white;
`
const GameTitleView = styled(View)`
    background-color: #1d1d1d;
    border-color: rgba(255,255,255,0.5);
    border-radius: 8px;
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
const PreviewButtonPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: white;
    border-radius: 20px;
    justify-content: center;
    flex-direction: row;
    margin: 12px;
    margin-top: 0px;
    margin-bottom: 24px;
    padding: 8px;
    width: 108px;
`
const PreviewButtonText = styled(ReelayText.Overline)`
    color: black;
    font-size: 12px;
    margin-right: 8px;
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
    padding-right: 48px;
    padding-top: 4px;
    width: 100%;
`
const YearText = styled(ReelayText.Subtitle2)`
    color: gray
`

const getDisplayClues = (nextClues) => {
    const hasMaxClues = (nextClues?.length < 6);
    return (hasMaxClues) ? [...nextClues, null] : nextClues;
}

export default CreateGuessingGameCluesScreen = ({ navigation, route }) => {
    const initialGame = route?.params?.game;
    const initialClues = getDisplayClues(initialGame?.reelays ?? []);

    const [game, setGame] = useState(initialGame);
    const [clues, setClues] = useState(initialClues);
    const { reelayDBUser } = useContext(AuthContext);

    const authSession = useSelector(state => state.authSession);
    const topOffset = useSafeAreaInsets().top;
    const clueOrder = game?.clueOrder;
    const correctTitleObj = game?.correctTitleObj;
    const gameTitle = game?.title;

    const uploadStage = useSelector(state => state.uploadStage);
    const showProgressBarStages = ['uploading', 'upload-complete', 'upload-failed-retry'];
    const showProgressBar = showProgressBarStages.includes(uploadStage);

    const title = correctTitleObj?.display;
    const actors = correctTitleObj?.displayActors?.map(actor => actor.name)
            .filter((actor) => actor !== undefined)
            .join(", ") 
        ?? [];


    const releaseYear = (correctTitleObj?.releaseDate && correctTitleObj?.releaseDate.length >= 4) 
        ? correctTitleObj?.releaseDate.slice(0,4) : '';
    const runtimeString = getRuntimeString(correctTitleObj?.runtime);

    const advanceToGamePreview = (index = 0, isUnlocked = false) => {
        navigation.push('SingleGuessingGameScreen', {
            initialStackPos: index,
            guessingGame: game,
            isPreview: true,
            isUnlocked,
        })
    }

    const onRefresh = async () => {
        const myDraftGuessingGames = await getMyDraftGuessingGames({
            authSession,
            reqUserSub: reelayDBUser?.sub,
        });
        const matchedGame = myDraftGuessingGames.find(nextGame => nextGame?.id === game.id);
        if (matchedGame) {
            setGame(matchedGame);
            setClues(getDisplayClues(matchedGame.reelays));
        }
    }

    const setNextCluesFromDrag = async ({ data }) => {
        const nextClues = data;
        const curLastItem = clues?.[clues?.length - 1];
        const nextLastItem = nextClues?.[nextClues?.length - 1];
        if (!curLastItem && !!nextLastItem) {
            // cannot move last item (add a clue)
            return;
        }
        setClues(nextClues);
        const prevGameDetails = getGameDetails(game);
        prevGameDetails.clueOrder = [];


        const gameDetails = nextClues.reduce((curGameDetails, nextClue) => {
            if (!nextClue) return curGameDetails;
            const reelaySub = nextClue?.sub;
            curGameDetails.clueOrder.push(reelaySub);
            return curGameDetails;
        }, prevGameDetails);


        const nextDetailsJSON = JSON.stringify(gameDetails);
        const patchResult = await patchGuessingGameDetails({
            authSession,
            reqUserSub: reelayDBUser?.sub,
            detailsJSON: nextDetailsJSON,
            topicID: game?.id,
        });
    }

    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    }, []);

    const ClueBar = ({ isActive, onPress = () => {}, reelay = null }) => {
        const [clueDrawerOpen, setClueDrawerOpen] = useState(false);
        const backgroundColor = (isActive) 
            ? ReelayColors.reelayBlue
            : (!!reelay) ? '#252527' : 'black';

        if (!reelay) {
            return (
                <ClueBarView isActive={isActive} backgroundColor={backgroundColor}>
                    <ClueBarText>{'Add a video clue...'}</ClueBarText>
                    <AddReelayButtonView>
                        <FontAwesomeIcon icon={faPlusCircle} size={30} color='white' />
                    </AddReelayButtonView>
                </ClueBarView>
            );    
        } else {
            return (
                <ClueBarView isActive={isActive} backgroundColor={backgroundColor}>
                    <DotMenuPressable onPress={() => setClueDrawerOpen(true)}>
                        <FontAwesomeIcon icon={faEllipsisVertical} color='white' size={24} />
                    </DotMenuPressable>
                    <ClueBarText>{reelay?.description}</ClueBarText>
                    <ReelayThumbnail
                        asTopOfTheWeek={false}
                        asAllClubActivity={false}
                        asSingleClubActivity={true}
                        height={80}
                        margin={0}
                        onPress={onPress}
                        reelay={reelay}
                        showPoster={false}
                        showVenue={false}
                        showIcons={false}
                        width={54}                        
                    />
                    { clueDrawerOpen && (
                        <DeleteGuessingGameClueDrawer
                            closeDrawer={() => setClueDrawerOpen(false)}
                            guessingGame={game}
                            navigation={navigation}
                            reelay={reelay}
                        />
                    )}
                </ClueBarView>
            );    
        }
    }

    const ClueReelayRow = ({ item, index, drag, isActive }) => {
        const advanceToCreateReelayScreen = () => navigation.push('ReelayCameraScreen', {
            draftGame: game,
            topicID: game?.id,
            titleObj: correctTitleObj,
            venue: '',
        })

        const reelay = item;
        const onPress = (reelay) 
            ? () => advanceToGamePreview(index, true)
            : advanceToCreateReelayScreen;

        return (
            <ClueReelayRowPressable delayLongPress={100} onPress={onPress} onLongPress={drag} disabled={isActive}>
                <ClueReelayIndexView>
                    <ClueReelayIndexText>{index + 1}</ClueReelayIndexText>
                </ClueReelayIndexView>
                <ClueBar isActive={isActive} onPress={onPress} reelay={reelay} />
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
                    { !correctTitleObj?.posterSource && <TitleText>{"No Poster Available"}</TitleText>}
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
                <DeleteDraftButton />
                <GameTitleView>
                    <GameTitleText>{gameTitle}</GameTitleText>
                </GameTitleView>
                <CorrectTitleLine />
                <CluesHeaderView>
                    <HeaderText>{'Clues'}</HeaderText>
                    <HeaderSubText>{'Add reelays to help people guess the title. Players get one guess for each reelay they see.'}</HeaderSubText>
                    <HeaderSubText>{'Press and hold to reorder.'}</HeaderSubText>
                </CluesHeaderView>
                <PreviewButtonPressable onPress={() => advanceToGamePreview(0)}>
                    <PreviewButtonText>{'preview'}</PreviewButtonText>
                    <FontAwesomeIcon icon={faPlay} color='black' size={12} />
                </PreviewButtonPressable>
            </View>
        );
    }

    const ComponentBelowList = () => {
        return (
            <View style={{ height: 200 }} />
        )
    }

    const DeleteDraftButton = () => {
        const [drawerVisible, setDrawerVisible] = useState(false);

        return (
            <Fragment>
                <DeleteDraftPressable onPress={() => setDrawerVisible(true)}>
                    <FontAwesomeIcon icon={faTrash} color='white' size={20} />
                </DeleteDraftPressable>
                { drawerVisible && (
                    <DeleteGuessingGameDrawer
                        closeDrawer={() => setDrawerVisible(false)}
                        guessingGame={game}
                        navigation={navigation}
                    />
                )}
            </Fragment>
        )
    }

    return (
        <ScreenView topOffset={topOffset}>
            <DraggableFlatList
                ListHeaderComponent={ComponentAboveList}
                ListFooterComponent={ComponentBelowList}
                data={clues}
                keyExtractor={(item, index) => (!!item) ? item?.id : index}
                onDragEnd={setNextCluesFromDrag}
                renderItem={(props) => <ClueReelayRow { ...props } /> }                
                showsVerticalScrollIndicator={false}
            />
            { showProgressBar && <UploadProgressBar mountLocation={'InClueBuilder'} onRefresh={onRefresh} /> }
        </ScreenView>
    )
}