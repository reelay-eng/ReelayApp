import React, { useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { Dimensions, Pressable, Share, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { GamesIconSVG, ShareOutSVG } from '../global/SVGs';
import ReelayColors from '../../constants/ReelayColors';
import { BlurView } from 'expo-blur';
import ProfilePicture from '../global/ProfilePicture';
import { AuthContext } from '../../context/AuthContext';
import { showMessageToast } from '../utils/toasts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLink, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;
const BUTTON_WIDTH = ((0.8 * width) - (BUTTON_MARGIN_WIDTH * 5)) / 3;
const REELAY_WEB_BASE_URL = Constants.manifest.extra.reelayWebBaseUrl;

const Backdrop = styled(Pressable)`
    align-items: center;
    background-color: transparent;
    height: 100%;
    justify-content: center;
    position: absolute;
    width: 100%;
`
const CloseButtonPressable = styled(TouchableOpacity)`
    position: absolute;
    top: 16px;
    right: 16px;
`
const GuessMarkerView = styled(View)`
    background-color: ${props => props.color};
    border-color: rgba(255,255,255,0.5);
    border-radius: 12px;
    height: 12px;
    margin: 8px;
    margin-top: 0px;
    margin-bottom: 0px;
    width: 12px;
`
const GuessMarkerRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 100%;
`
const OverlayBox = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: center;
    position: absolute;
    width: 100%;
`
const ShareCardGradient = styled(LinearGradient)`
    border-radius: 24px;
    height: 100%;
    position: absolute;
    width: 100%;
`
const ShareCardView = styled(View)`
    align-items: center;
    border-radius: 24px;
    height: 480px;
    opacity: 0.9;
    width: 80%;
`
const ClueIndexView = styled(View)`
    padding: 8px;
    width: 32px;
`
const ClueCenterView = styled(View)`
    align-items: center;
    display: flex;
    flex: 1;
    flex-direction: row;
`
const ClueStatBar = styled(View)`
    background-color: ${ReelayColors.reelayGreen};
    border-radius: 14px;
    height: 14px;
    width: ${props => props.width}px;
`
const ClueStatText = styled(ReelayText.Body1)`
    color: white;
    text-align: center;
`
const CluePercentView = styled(View)`
    padding: 8px;
    width: 56px;
`;
const ClueStatRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    width: 100%;
`
const ClueStatsView = styled(View)`
    display: flex;
    flex: 1;
    margin: 16px;
    width: 100%;
`
const GuesserPicsRow = styled(View)`
    align-items: center;
    display: flex;
    flex-direction: row;
    margin-left: 8px;
    margin-right: 8px;
`
const ShareOptionPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: #3D3552;
    border-radius: 12px;
    height: ${BUTTON_WIDTH}px;
    justify-content: center;
    margin: ${BUTTON_MARGIN_WIDTH / 2}px;
    width: ${BUTTON_WIDTH}px;
`
const ShareOptionText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 14px;
    margin-top: 10px;
    margin-bottom: 12px;
`
const ShareOptionTextView = styled(View)`
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    position: absolute;
    width: 100%;
`
const ShareOptionView = styled(View)`
    align-items: center;
`
const ShareOptionsRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 10px;
    padding-left: ${BUTTON_MARGIN_WIDTH}px;
    padding-right: ${BUTTON_MARGIN_WIDTH}px;
`
const ShareOptionIconPad = styled(View)`
    height: 25px;
`
const YouGotItView = styled(View)`
    margin: 16px;
`
const YouWinText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 16px;
`


export default ShareGuessingGameModal = ({ closeModal, clueOrder, guessingGame, myGuesses }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const url = `google.com`;

    const CloseButton = () => {
        return (
            <CloseButtonPressable onPress={closeModal}>
                <FontAwesomeIcon icon={faXmark} color='white' size={20} />
            </CloseButtonPressable>
        )
    }

    const CopyLinkButton = () => {
        const copyLink = () => {
            Clipboard.setStringAsync(url).then(onfulfilled => {
                showMessageToast('Shareable link copied to clipboard');
            });
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={copyLink}>
                    <FontAwesomeIcon icon={faLink} color='white' size={30} />
                    <ShareOptionIconPad />
                    <ShareOptionTextView>
                        <ShareOptionText>{'Copy link'}</ShareOptionText>
                    </ShareOptionTextView>
                </ShareOptionPressable>
            </ShareOptionView>
        )
    }

    const ShareOutButton = () => {
        const shareReelay = async () => {
            const title = `The Reelay guessing game`;
            const content = { title, url };
            const options = {};
            const sharedAction = await Share.share(content, options);
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={shareReelay}>
                    <ShareOutSVG />
                    <ShareOptionIconPad />
                    <ShareOptionTextView>
                        <ShareOptionText>{'Share'}</ShareOptionText>
                    </ShareOptionTextView>
                </ShareOptionPressable>
            </ShareOptionView>
        )
    }

    const ShareToInstaStoryButton = () => {
        const openShareInstaStoryScreen = () => {
            // closeDrawer();
            // navigation.push('InstaStoryReelayScreen', { reelay, url });
        }

        return (
            <ShareOptionView>
                <ShareOptionPressable onPress={openShareInstaStoryScreen}>
                    <FontAwesomeIcon icon={faInstagram} color='white' size={30} />
                    <ShareOptionIconPad />
                    <ShareOptionTextView>
                        <ShareOptionText>{'Insta story'}</ShareOptionText>
                    </ShareOptionTextView>
                </ShareOptionPressable>
            </ShareOptionView>
        )
    }


    const GuessMarkers = () => {
        const getMarkerColor = (guess) => {
            if (guess?.isCorrect) return ReelayColors?.reelayGreen;
            return ReelayColors.reelayRed;
        } 

        const renderGuessMarker = (guess, index) => {
            const isCorrect = guess?.isCorrect;
            const color = getMarkerColor(guess);
            return (
                <GuessMarkerView key={index} 
                    color={color}
                    isCorrect={isCorrect} 
                    isGuessed={true} 
                />
            );
        };

        return (
            <GuessMarkerRowView>
                { myGuesses.map(renderGuessMarker) }
            </GuessMarkerRowView>
        )
    }

    const GuessStats = () => {
        const guessStats = guessingGame?.stats;

        const ClueStatRow = ({ clueStats, index }) => {
            const guesserSubs = clueStats?.guesserSubs ?? [];
            const numCorrect = clueStats?.numCorrect ?? 0;
            const numGuesses = clueStats?.numGuesses ?? 1;
            const correctRatio = (numGuesses === 0) ? 0 : numCorrect / numGuesses;

            const correctRatioStr = (100 * correctRatio).toFixed(0);
            const statBarWidth = (correctRatioStr * 1.5) + 20;

            return (
                <ClueStatRowView key={index}>
                    <ClueIndexView>
                        <ClueStatText>{index}</ClueStatText>
                    </ClueIndexView>
                    <ClueCenterView>
                        <ClueStatBar width={statBarWidth} />
                        <CluePercentView>
                            <ClueStatText>{`${correctRatioStr}%`}</ClueStatText>
                        </CluePercentView>
                    </ClueCenterView>
                    <GuesserPicsRow>
                        { guesserSubs.map(sub => <ProfilePicture user={{ sub, username: 'anthman' }} size={24} />)}
                    </GuesserPicsRow>
                </ClueStatRowView>
            );
        }   

        return (
            <ClueStatsView>
                { guessStats.map((clueStats, index) => {
                    return <ClueStatRow clueStats={clueStats} key={index} index={index} />
                })}
            </ClueStatsView>
        );
    }

    const YouGotIt = () => {
        return (
            <YouGotItView>
                <GamesIconSVG />
                <YouWinText>{'You got it!'}</YouWinText>
            </YouGotItView>
        )
    }

    return (
        <OverlayBox>
            <Backdrop onPress={closeModal} />
            <ShareCardView>
                <ShareCardGradient colors={[ReelayColors.reelayBlue, '#4C268B']} />
                <YouGotIt />
                <CloseButton />
                <GuessMarkers />
                <GuessStats />
                <ShareOptionsRowView>
                    <CopyLinkButton />
                    <ShareOutButton />
                    <ShareToInstaStoryButton />
                </ShareOptionsRowView>
            </ShareCardView>
        </OverlayBox>
    );
}