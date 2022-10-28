import React, { Fragment, useContext, useState } from 'react';
import { Dimensions, Pressable, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import TitlePoster from '../global/TitlePoster';
import Carousel from 'react-native-snap-carousel';
import { GamesIconSVG } from '../global/SVGs';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import ReelayColors from '../../constants/ReelayColors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 192;

const BottomButtonRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    width: 100%;
`
const BottomButtonText = styled(ReelayText.CaptionEmphasized)`
    color: ${props => props.color ?? 'white'};
`
const BottomHideRevealPressable = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 20px;
    background-color: white;
    justify-content: center;
    height: 30px;
    width: 72px;
`
const BottomReplayPressable = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 20px;
    background-color: ${ReelayColors.reelayBlue};
    justify-content: center;
    height: 30px;
    width: ${props => props.wide ? 160 : 72}px;
`
const CarouselView = styled(View)`
    margin-left: 16px;
`
const HeaderView = styled(View)`
    margin-left: 15px;
`
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
`
const GuessingGamesView = styled.View`
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
`
const GameDescriptionText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 14px;
    line-height: 18px;
`
const GameDescriptionView = styled(View)`
    padding: 8px;
    padding-top: 0px;
`
const GameElementHeaderView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    width: 100%;
`
const GameElementView = styled(Pressable)`
    align-items: center;
    background-color: rgba(255,255,255,0.15);
    border-radius: 11px;
    margin-top: 10px;
    width: ${CARD_WIDTH}px;
`
const AbovePosterSpacer = styled(View)`
    margin-top: 10px;
`
const RevealText = styled(ReelayText.Body1)`
    color: white;
    padding: 8px;
`
const UnrevealedPosterQuestionMark = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 64px;
    line-height: 64px;
`
const UnrevealedPosterView = styled(Pressable)`
    align-items: center;
    background-color: #080808;
    border-radius: 12px
    height: 240px;
    justify-content: center;
    width: 160px;
`
const TimestampText = styled(ReelayText.Body1)`
    color: gray;
`

export default GuessingGames = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const displayGames = useSelector(state => state.myHomeContent?.discover?.guessingGames ?? []);

    const headerText = 'Guessing Game';
    const headerSubtext = 'Play the official reelay game!'

    const advanceToGuessingGame = ({ game, isPreview = false, isUnlocked = false }) => {
		if (displayGames?.length === 0) return;
		navigation.push("SingleGuessingGameScreen", {
            initialStackPos: 0,
            guessingGame: game,
            isPreview,
            isUnlocked,
		});
	};

    const GamePreviewElement = ({ index, game }) => {
        const daysAgo = moment().diff(moment(game?.updatedAt), 'days');
        const correctTitleObj = game?.correctTitleObj;
        const hasCompletedGame = game?.hasCompletedGame;
        const hasWonGame = game?.hasWonGame;
        const hasLostGame = (hasCompletedGame && !hasWonGame);
        const isGameCreator = (game?.creatorSub === reelayDBUser?.sub);
        const canRevealPoster = (correctTitleObj && (hasCompletedGame || isGameCreator));

        const [isUnlocked, setIsUnlocked] = useState(false);
        const replayGame = () => advanceToGuessingGame({ game, isPreview: true, isUnlocked: false });

        const tapHideReveal = () => {
            if (canRevealPoster) setIsUnlocked(!isUnlocked);
        }

        const tapOnPoster = () => {
            advanceToGuessingGame({ game, isPreview: canRevealPoster, isUnlocked });
        }

        let timestamp = `${daysAgo} days ago`;
        if (daysAgo < 1) timestamp = 'Today';
        if (daysAgo === 1) timestamp = 'Yesterday'; 

        return (
            <GameElementView onPress={tapOnPoster}>
                <GameElementHeaderView>
                    <GamesIconSVG />
                    <TimestampText>{timestamp}</TimestampText>
                </GameElementHeaderView>
                <GameDescriptionView>
                    <GameDescriptionText>{game?.title}</GameDescriptionText>
                </GameDescriptionView>
                <AbovePosterSpacer />
                { isUnlocked && <TitlePoster onPress={tapOnPoster} title={correctTitleObj} width={160} /> }
                { !isUnlocked && <UnrevealedPoster hasWonGame={hasWonGame} hasCompletedGame={hasCompletedGame} canRevealPoster={canRevealPoster} onPress={tapOnPoster} /> }
                { canRevealPoster && (
                    <BottomButtonRowView>
                        <BottomHideRevealPressable onPress={tapHideReveal}>
                            <BottomButtonText color='black'>{(isUnlocked) ? 'Hide' : 'Reveal'}</BottomButtonText>
                        </BottomHideRevealPressable>
                        <BottomReplayPressable onPress={replayGame}>
                            <BottomButtonText color='white'>{'Replay'}</BottomButtonText>
                        </BottomReplayPressable>                    
                    </BottomButtonRowView>
                )}
                { !canRevealPoster && (
                    <BottomButtonRowView>
                        <BottomReplayPressable onPress={replayGame} wide={true}>
                            <BottomButtonText color='white'>{'Play now'}</BottomButtonText>
                        </BottomReplayPressable>                    
                    </BottomButtonRowView>
                )}
            </GameElementView>
        )
    }

    const GuessingGamesRow = () => {
        const renderGameElement = ({ item, index }) => {
            const game = item;
            return <GamePreviewElement key={index} index={index} game={game} />;
        }

        return (
            <CarouselView>
                <Carousel
                    activeSlideAlignment={'start'}
                    data={displayGames}
                    inactiveSlideScale={1}
                    itemWidth={CARD_WIDTH}
                    renderItem={renderGameElement}
                    sliderHeight={240}
                    sliderWidth={width}
                />
            </CarouselView>
        );
    }

    const UnrevealedPoster = ({ canRevealPoster, onPress }) => {
        if (canRevealPoster) {
            return (
                <UnrevealedPosterView onPress={onPress}>
                    <FontAwesomeIcon icon={faEye} color='white' size={64} />
                    <RevealText>{'Reveal answer'}</RevealText>
                </UnrevealedPosterView>
            );    
        } else {
            return (
                <UnrevealedPosterView onPress={onPress}>
                    <UnrevealedPosterQuestionMark>?</UnrevealedPosterQuestionMark>
                </UnrevealedPosterView>
            );    
        }
    }

    if (displayGames?.length === 0) {
        return <View />;
    }
    
    return (
        <GuessingGamesView>
            <HeaderView>
                {/* <HeaderText>{headerText}</HeaderText> */}
                <HeaderSubText>{headerSubtext}</HeaderSubText>
            </HeaderView>
            { displayGames?.length > 0 && <GuessingGamesRow />}
        </GuessingGamesView>
    )
};