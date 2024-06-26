import React, { useContext } from 'react';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { Dimensions, Modal, Pressable, Share, TouchableOpacity, View } from 'react-native';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { GamesIconSVG, ShareOutSVG } from '../global/SVGs';
import ReelayColors from '../../constants/ReelayColors';
import { BlurView } from 'expo-blur';
import ProfilePicture from '../global/ProfilePicture';
import { AuthContext } from '../../context/AuthContext';
import { showMessageToast } from '../utils/toasts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faChevronRight, faLink, faUnlock, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { getRuntimeString } from '../utils/TitleRuntime';
import TitlePoster from '../global/TitlePoster';
import AddToWatchlistButton from '../watchlist/AddToWatchlistButton';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isMentionPartType, parseValue } from 'react-native-controlled-mentions';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../utils/EventLogger';

const { height, width } = Dimensions.get('window');

const BUTTON_MARGIN_WIDTH = 10;
const BUTTON_WIDTH = ((width - 32) - (BUTTON_MARGIN_WIDTH * 5)) / 3;

const CloseButtonPressable = styled(TouchableOpacity)`
    position: absolute;
    top: 16px;
    right: 16px;
`
const CommentsPreviewHeaderCount = styled(ReelayText.Overline)`
    color: rgba(255,255,255,0.8);
    font-size: 15px;
    margin-top: 5px;
    margin-left: 12px;
`
const CommentsPreviewHeaderText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 18px;
    line-height: 30px;
    margin-left: 8px;
`
const CommentsPreviewBodyText = styled(ReelayText.Body2)`
    color: white;
    width: ${width - 120}px;
    margin-left: 8px;
`
const CommentsPreviewBodyRow = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-top: 8px;
    width: 100%;
`
const CommentsPreviewHeaderRow = styled(View)`
    align-items: center;
    flex-direction: row;
    width: 100%;
`
const CommentsPreviewPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: #292929;
    border-radius: 12px;
    flex-direction: row;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 24px;
    width: ${width - 32}px;
`
const GuessMarkerView = styled(View)`
    align-items: center;
    background-color: ${props => props.color};
    border-color: rgba(255,255,255,0.5);
    border-radius: 4px;
    height: 24px;
    justify-content: center;
    margin: 4px;
    margin-top: 0px;
    margin-bottom: 0px;
    width: 24px;
`
const GuessMarkerRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 100%;
`
const OverlayBox = styled(Pressable)`
    align-items: center;
    height: ${height}px;
    justify-content: center;
    overflow: hidden;
    position: absolute;
    width: ${width}px;
`
const ShareCardWhiteLayer = styled(View)`
    background-color: #191919;
    border-radius: 24px;
    height: 100%;
    opacity: 0.9;
    position: absolute;
    width: 100%;
`
const ShareCardView = styled(View)`
    bottom: 0px;
    border-radius: 24px;
    height: ${props => props?.height}px;
    opacity: 0.95;
    position: absolute;
    z-index: 100;
    width: ${width}px;
`
const ClueIndexView = styled(View)`
    margin-left: 8px;
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
    background-color: ${props => props.isCorrect ? ReelayColors.reelayBlue : 'transparent'};
    flex-direction: row;
    width: 100%;
`
const ClueStatsView = styled(View)`
    margin: 16px;
    width: 100%;
`
const GuessIconView = styled(View)`
    align-items: center;
    border-radius: 100px;
    justify-content: center;
`
const GuesserPicsRow = styled(View)`
    align-items: center;
    display: flex;
    flex-direction: row;
    margin-left: 8px;
    right: 16px;
`
const ModalStyle = {
    alignItems: 'center',
    height: height,
    justifyContent: 'center',
    width: width,
}
const RuntimeText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-right: 10px;
`
const ShareSectionView = styled(View)`
    align-items: center;
`
const ShareOptionPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: #3C3C3C;
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
const ShareOptionsTitleText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    font-size: 16px;
    line-height: 16px;
`
const ShareOptionsTitleView = styled(View)`
    align-items: center;
    height: 26px;
    width: 100%;
`
const TitleBannerRow = styled(View)`
    align-items: center;
    background-color: rgba(255,255,255,0.1);
    flex-direction: row;
    justify-content: space-between;
    margin-top: 18px;
    padding-left: 10px;
    padding-right: 10px;
`
const TitleInfoPressable = styled(TouchableOpacity)`
    align-items: flex-start;
    justify-content: center;
    font-size: 18px;
    display: flex;
    flex: 1;
    padding: 5px;
`
const TitlePosterView = styled(View)`
    justify-content: center;
    margin: 8px;
    margin-top: 12px;
`
const TitleText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    text-shadow-color: rgba(0, 0, 0, 0.4);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const TitleTextView = styled(View)`
    justify-content: center;
    display: flex;
`
const UnderlineView = styled(View)`
    margin-top: 5px;
    margin-right: 8px;
    width: 100%;
`
const YouGotItView = styled(View)`
    align-items: center;
    margin: 16px;
    margin-bottom: 0px;
`
const YouWinText = styled(ReelayText.H5Bold)`
    color: white;
    line-height: 52px;
    font-size: 24px;
`
const YearText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
    margin-right: 10px;
`
const YearView = styled(View)`
    align-items: center;
    flex-direction: row;
`

export default ShareGuessingGameDrawer = ({ game, navigation }) => {
    try {
        firebaseCrashlyticsLog('Share guessing game');
        const bottomOffset = useSafeAreaInsets().bottom;
        const dispatch = useDispatch();
        const closeDrawer = () => {
            dispatch({ type: 'setStatsVisible', payload: false });
        }

        const { reelayDBUser } = useContext(AuthContext);
        const isGuestUser = (reelayDBUser?.username === 'be_our_guest');
        const myGuesses = game?.myGuesses ?? [];

        const hasCompletedGame = game?.hasCompletedGame;
        const hasWonGame = game?.hasWonGame;
        const hasLostGame = (hasCompletedGame && !hasWonGame);

        const gameHasGuesses = game?.myGuesses?.length > 0;
        const inviteCode = game?.myGuesses?.[0]?.inviteCode;
        const url = (gameHasGuesses) ? `https://on.reelay.app/game/${inviteCode}` : 'https://on.reelay.app';

        const myGuessEmojis = myGuesses.map(guess => guess?.isCorrect ? '🟢' : '🔴');
        const shareMessageParts = [
            `${game?.title}`,
            `My guesses: ${myGuessEmojis.join('')} 🦮`,
            url,
        ];

        const shareMessage = shareMessageParts.join('\n');
        const statCount = game?.stats?.length ?? 0;
        const statRowCount = statCount + 1; // leave room for losing stats row
        const rowHeight = 32; // sorry magic numbers
        const fixedHeight = isGuestUser ? 316 : 460;
        const modalViewHeight = (rowHeight * statRowCount) + fixedHeight;

        const CloseButton = () => {
            return (
                <CloseButtonPressable onPress={closeDrawer}>
                    <FontAwesomeIcon icon={faXmark} color='white' size={20} />
                </CloseButtonPressable>
            )
        }

        const CommentsPreview = () => {
            const gameComments = game?.reelays?.[0]?.comments ?? null;
            const lastCommentIndex = gameComments ? (gameComments?.length - 1) : 0;
            const previewComment = gameComments ? gameComments[lastCommentIndex] : null;

            const user = (previewComment) ? {
                sub: previewComment?.authorSub,
                username: previewComment?.authorName,
            } : null;

            const commentHeaderText = (gameComments?.length > 0)
                ? `Comments`
                : 'Add a comment';

            const commentHeaderCount = gameComments?.length > 0 ? gameComments?.length : '';
            const openCommentsDrawer = () => {
                dispatch({ type: 'setStatsVisible', payload: false });
                dispatch({ type: 'setCommentsVisible', payload: true });
            }

            const mentionFollowType = { trigger: '@' };
            const commentPlaintext = parseValue(previewComment?.content ?? '', [mentionFollowType])?.plainText ?? '';

            return (
                <CommentsPreviewPressable onPress={openCommentsDrawer}>
                    <View>
                        <CommentsPreviewHeaderRow>
                            <FontAwesomeIcon icon={faUnlock} color='white' size={24} />
                            <CommentsPreviewHeaderText>{commentHeaderText}</CommentsPreviewHeaderText>
                            <CommentsPreviewHeaderCount>{commentHeaderCount}</CommentsPreviewHeaderCount>
                        </CommentsPreviewHeaderRow>
                        {previewComment && (
                            <CommentsPreviewBodyRow>
                                <ProfilePicture navigation={navigation} user={user} size={24} />
                                <CommentsPreviewBodyText numberOfLines={2}>
                                    {commentPlaintext}
                                </CommentsPreviewBodyText>
                            </CommentsPreviewBodyRow>
                        )}
                    </View>
                    <FontAwesomeIcon icon={faChevronRight} color='white' size={16} />
                </CommentsPreviewPressable>
            )
        }

        const CopyLinkButton = () => {
            const copyLink = () => {
                Clipboard.setStringAsync(shareMessage).then(onfulfilled => {
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
            const shareGame = async () => {
                const title = `The Reelay guessing game`;
                const content = { title, message: shareMessage };
                const options = {};
                const sharedAction = await Share.share(content, options);
            }

            return (
                <ShareOptionView>
                    <ShareOptionPressable onPress={shareGame}>
                        <ShareOutSVG />
                        <ShareOptionIconPad />
                        <ShareOptionTextView>
                            <ShareOptionText>{'Share text'}</ShareOptionText>
                        </ShareOptionTextView>
                    </ShareOptionPressable>
                </ShareOptionView>
            )
        }

        const ShareToInstaStoryButton = () => {
            const openShareInstaStoryScreen = () => {
                closeDrawer();
                navigation.push('InstaStoryGuessingGameScreen', { game, url });
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
                const icon = isCorrect ? faCheck : faXmark;
                return (
                    <GuessMarkerView key={index}
                        color={color}
                        isCorrect={isCorrect}
                        isGuessed={true}
                    >
                        <FontAwesomeIcon icon={icon} color='white' size={16} />
                    </GuessMarkerView>
                );
            };

            return (
                <GuessMarkerRowView>
                    {myGuesses.map(renderGuessMarker)}
                </GuessMarkerRowView>
            )
        }

        const GuessStats = () => {
            const guessStats = game?.stats ?? [];
            const totalGuesses = guessStats?.[0]?.numGuesses ?? 1;
            const lastClue = guessStats?.[guessStats?.length - 1] ?? null;
            const lostGameCount = lastClue?.numGuesses - lastClue?.numCorrect;

            const lostGameStats = {
                guesserSubs: [],
                numCorrect: lostGameCount,
                numGuesses: totalGuesses,
            }

            const ClueStatRow = ({ clueStats, index }) => {
                const guesserSubs = clueStats?.guesserSubs ?? [];
                const displayGuesserSubs = guesserSubs.slice(0, 5);
                const numCorrect = clueStats?.numCorrect ?? 0;
                const numGuesses = totalGuesses; // clueStats?.numGuesses ?? 1;
                const correctGuessIndex = myGuesses.findIndex(guess => guess?.isCorrect);
                const isCorrect = (correctGuessIndex === index);
                const correctRatio = (numGuesses === 0) ? 0 : numCorrect / numGuesses;

                const correctRatioStr = (100 * correctRatio).toFixed(0);
                const statBarWidth = (correctRatioStr * 1.4) + 10;

                return (
                    <ClueStatRowView isCorrect={isCorrect}>
                        <ClueIndexView>
                            <ClueStatText>{index === -1 ? 'X' : index + 1}</ClueStatText>
                        </ClueIndexView>
                        <ClueCenterView>
                            <ClueStatBar width={statBarWidth} />
                            <CluePercentView>
                                <ClueStatText>{`${correctRatioStr}%`}</ClueStatText>
                            </CluePercentView>
                        </ClueCenterView>
                        <GuesserPicsRow>
                            {displayGuesserSubs.map(sub => <ProfilePicture user={{ sub, username: '' }} size={24} />)}
                        </GuesserPicsRow>
                    </ClueStatRowView>
                );
            }

            return (
                <ClueStatsView>
                    {guessStats.map((clueStats, index) => {
                        const viewKey = `${game?.id}-${index}`;
                        return <ClueStatRow clueStats={clueStats} key={viewKey} index={index} />
                    })}
                    <ClueStatRow clueStats={lostGameStats} key={-1} index={-1} />
                </ClueStatsView>
            );
        }

        const ShareSection = () => {
            return (
                <ShareSectionView>
                    <ShareOptionsTitleView>
                        <ShareOptionsTitleText>{'Share your score'}</ShareOptionsTitleText>
                    </ShareOptionsTitleView>
                    <ShareOptionsRowView>
                        <CopyLinkButton />
                        <ShareOutButton />
                        <ShareToInstaStoryButton />
                    </ShareOptionsRowView>
                </ShareSectionView>
            )
        }

        const TitleRow = () => {
            const titleObj = game?.correctTitleObj;
            const watchlistReelay = game?.reelays?.[0] ?? null;

            const onPressPoster = () => {
                closeDrawer();
                navigation.push('TitleDetailScreen', {
                    titleObj: titleObj,
                });
            }

            return (
                <TitleBannerRow>
                    <TitlePosterView>
                        <TitlePoster onPress={onPressPoster} title={titleObj} width={36} />
                    </TitlePosterView>
                    <TitleInfo titleObj={titleObj} />
                    <GuessIconView>
                        <AddToWatchlistButton titleObj={titleObj} reelay={watchlistReelay} />
                    </GuessIconView>
                </TitleBannerRow>
            )
        }

        const TitleInfo = ({ titleObj }) => {
            const displayTitle = titleObj?.display;
            const displayYear = (titleObj?.releaseDate && titleObj?.releaseDate.length >= 4)
                ? titleObj.releaseDate.slice(0, 4) : '';

            const onPressTitle = () => {
                closeDrawer();
                navigation.push('TitleDetailScreen', {
                    titleObj: titleObj,
                });
            }

            return (
                <TitleInfoPressable onPress={onPressTitle}>
                    <TitleTextView>
                        <TitleText numberOfLines={2} ellipsizeMode={"tail"}>
                            {displayTitle}
                        </TitleText>
                    </TitleTextView>
                    <Underline
                        displayYear={displayYear}
                        runtime={titleObj?.runtime}
                    />
                </TitleInfoPressable>
            );
        }

        const Underline = ({ displayYear, runtime }) => {
            const runtimeString = runtime ? getRuntimeString(runtime) : '';
            return (
                <UnderlineView>
                    <YearView>
                        {displayYear?.length > 0 && <YearText>{displayYear}</YearText>}
                        {runtimeString?.length > 0 && <RuntimeText>{runtimeString}</RuntimeText>}
                    </YearView>
                </UnderlineView>
            );
        };

        const YouGotIt = () => {
            const getText = () => {
                if (hasWonGame) return 'You guessed it!';
                if (hasLostGame) return 'Darn, next time!';
                return game?.title;
            }
            return (
                <YouGotItView>
                    <GamesIconSVG />
                    <YouWinText>{getText()}</YouWinText>
                </YouGotItView>
            )
        }

        return (
            <Modal style={ModalStyle} animationType='slide' transparent={true}>
                <OverlayBox onPress={closeDrawer} />
                <BlurView intensity={50} tint='default' style={{ borderRadius: 24, bottom: 0, height: modalViewHeight, overflow: 'hidden', width: width, position: 'absolute' }} />
                <ShareCardView height={modalViewHeight}>
                    <ShareCardWhiteLayer />
                    <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: bottomOffset }}>
                        <YouGotIt />
                        <CloseButton />
                        <GuessMarkers />
                        <TitleRow />
                        <GuessStats />
                        <CommentsPreview />
                        {!isGuestUser && <ShareSection />}
                    </ScrollView>
                </ShareCardView>
            </Modal>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}