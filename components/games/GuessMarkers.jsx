import React from "react";
import { View } from "react-native";
import ReelayColors from "../../constants/ReelayColors";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import styled from 'styled-components/native';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from "../utils/EventLogger";

const GuessMarkerView = styled(View)`
    align-items: center;
    background-color: ${props => props.color};
    border-color: rgba(255,255,255,0.5);
    border-radius: 4px;
    height: ${props => props.unanswered ? 18 : 24}px;
    justify-content: center;
    margin: 4px;
    margin-top: 0px;
    margin-bottom: 0px;
    width: ${props => props.unanswered ? 18 : 24}px;
`
const GuessMarkerRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 100%;
`

export default GuessMarkers = ({ game }) => {
    try {
        firebaseCrashlyticsLog('Guess markers');
        const gameDetails = game?.details;
        const guessesLeft = (gameDetails?.clueOrder?.length - myGuesses?.length);
        const myGuesses = game?.myGuesses ?? [];

        const findCorrectGuess = (nextGuess) => nextGuess?.isCorrect;
        const gameOver = (guessesLeft === 0 || myGuesses.find(findCorrectGuess));

        const getMarkerColor = (guess) => {
            if (guess?.isCorrect) return ReelayColors?.reelayGreen;
            return ReelayColors.reelayRed;
        }

        const renderGuessMarker = (guess, index) => {
            const isCorrect = guess?.isCorrect;
            const icon = isCorrect ? faCheck : faXmark;
            const color = getMarkerColor(guess);
            return (
                <GuessMarkerView key={index}
                    color={color}
                    isCorrect={isCorrect}
                    isGuessed={true}
                >
                    <FontAwesomeIcon icon={icon} color='white' size={18} />
                </GuessMarkerView>
            );
        };

        const unansweredColor = gameOver ? ReelayColors.reelayGreen : '#C8C8C8';

        return (
            <GuessMarkerRowView>
                {myGuesses.map(renderGuessMarker)}
                {(guessesLeft > 0 && !gameOver) && (
                    <GuessMarkerView
                        key={'unanswered'}
                        color={unansweredColor}
                        isCorrect={false}
                        isGuessed={false}
                        unanswered={true}
                    >
                    </GuessMarkerView>
                )}
            </GuessMarkerRowView>
        )
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}
