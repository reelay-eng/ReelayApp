import React, { useContext, useRef, useState } from 'react';
import { 
    Dimensions, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    TouchableHighlight, 
    TouchableOpacity, 
    View,
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TitlePoster from '../global/TitlePoster';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { BlurView } from 'expo-blur'
import ReelayColors from '../../constants/ReelayColors';
import { setReactEmojis } from '../../api/WatchlistApi';

const { width } = Dimensions.get('window');

const DEFAULT_REACT_EMOJIS = '🤣😍😴';
const ICON_SIZE = 24;
const MODAL_HEIGHT = 383;
const MODAL_WIDTH = 265;
const MODAL_MARGIN = 29;

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const CloseButtonPressable = styled(TouchableOpacity)`
    position: absolute;
    top: 16px;
    right: 16px;
`
const CreateReelayPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: rgba(255,255,255,0.12);
    border-radius: 8px;
    height: 32px;
    justify-content: center;
    margin: 12px;
    margin-bottom: 0px;
    width: 65%;
`
const CreateReelayText = styled(ReelayText.Body1)`
    color: white;
    font-size: 16px;
`
const DonePressable = styled(CreateReelayPressable)``
const DoneText = styled(CreateReelayText)``
const ModalView = styled(View)`
    position: absolute;
`
const ShareCardBlurLayer = styled(BlurView)`
    height: ${MODAL_HEIGHT}px;
    opacity: 0.9;
    position: absolute;
    width: ${MODAL_WIDTH - 24}px;
`
const ShareCardGradient = styled(LinearGradient)`
    border-radius: 24px;
    height: 100%;
    opacity: 0.9;
    position: absolute;
    width: 100%;
`
const ShareCardWhiteLayer = styled(View)`
    background-color: rgba(255,255,255,0.8);
    border-radius: 24px;
    height: 100%;
    opacity: 1;
    position: absolute;
    width: 100%;
`
const ShareCardView = styled(View)`
    align-items: center;
    border-radius: 24px;
    height: ${props => props?.height}px;
    opacity: 0.95;
    width: ${MODAL_WIDTH}px;
`
const PromptText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 18px;
    margin: 16px;
`
const ReactEmojiPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${props => props.isSelected
        ? ReelayColors.reelayBlue
        : 'rgba(255,255,255,0.12)'
    };
    border-radius: 8px;
    height: 48px;
    justify-content: center;
    margin: 4px;
    width: 48px;
`
const ReactEmojiRowView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: center;
    width: 100%;
`
const ReactEmojiText = styled(ReelayText.H6)`
    font-size: 18px;
`
const TitleInfoView = styled(View)`
    align-items: center;
    margin-top: 24px;
    width: 100%;
`

export default MarkedSeenModal = ({ 
    closeModal, 
    navigation,
    watchlistItem,
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const bottomOffset = useSafeAreaInsets().bottom;
    const dispatch = useDispatch();
    const titleObj = watchlistItem?.title;

    const [displayEmojis, setDisplayEmojis] = useState(DEFAULT_REACT_EMOJIS);
    const [selectedEmojis, setSelectedEmojis] = useState([]);

    const CloseButton = () => {
        return (
            <CloseButtonPressable onPress={closeModal}>
                <FontAwesomeIcon icon={faXmark} color='white' size={20} />
            </CloseButtonPressable>
        )
    }

    const AddOtherEmojiButton = () => {
        return (
            <ReactEmojiPressable>
                <FontAwesomeIcon icon={faPlus} color='white' size={20} />
            </ReactEmojiPressable>
        )
    }

    const CreateReelayButton = () => {
        const advanceToVenueSelectScreen = () => {
            closeModal();
            navigation.push('VenueSelectScreen', { titleObj })
        }
        return (
            <CreateReelayPressable onPress={advanceToVenueSelectScreen}>
                <CreateReelayText>{'create a reelay'}</CreateReelayText>
            </CreateReelayPressable>
        )
    }

    const DoneButton = () => {
        return (
            <CreateReelayPressable onPress={closeModal}>
                <CreateReelayText>{'done'}</CreateReelayText>
            </CreateReelayPressable>
        )
    }

    const ReactEmoji = ({ emoji }) => {
        const [isSelected, setIsSelected] = useState(selectedEmojis.includes(emoji));
        const onPress = async () => {
            let nextSelectedEmojis = selectedEmojis;
            if (isSelected) {
                setIsSelected(false);
                nextSelectedEmojis = selectedEmojis.filter(nextEmoji => nextEmoji !== emoji);
                setSelectedEmojis(nextSelectedEmojis);
            } else {
                setIsSelected(true);
                nextSelectedEmojis.push(emoji)
                setSelectedEmojis(selectedEmojis);
            }

            const setEmojisResult = await setReactEmojis({
                authSession, 
                itemID: watchlistItem?.id, 
                reactEmojis: nextSelectedEmojis.join(''),
                reqUserSub: reelayDBUser?.sub,
           });
           console.log('set emojis result: ', setEmojisResult);
        }
        return (
            <ReactEmojiPressable key={emoji} isSelected={isSelected} onPress={onPress}>
                <ReactEmojiText>{emoji}</ReactEmojiText>
            </ReactEmojiPressable>
        )
    }

    const ReactEmojiRow = () => {
        const getEmojiChars = () => {
            const chars = [];
            for (let ii = 0; ii < displayEmojis.length; ii += 2) {
                const nextEmoji = displayEmojis.charAt(ii) + displayEmojis.charAt(ii + 1);
                chars.push(nextEmoji);
            }
            return chars;
        }

        return (
            <ReactEmojiRowView>
                { getEmojiChars().map(emoji => <ReactEmoji emoji={emoji} /> )}
                <AddOtherEmojiButton />
            </ReactEmojiRowView>
        )
    }

    const TitleInfo = () => {
        return (
            <TitleInfoView>
                <TitlePoster title={titleObj} width={90} />
                <PromptText>{'What did you think?'}</PromptText>
            </TitleInfoView>
        )
    }

    return (
        <ModalView>
            <Modal animationType='slide' transparent={true} visible={true}>
            <KeyboardAvoidingView behavior="padding" style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Backdrop onPress={closeModal}/>
                <ShareCardBlurLayer intensity={50} tint='dark' />
                <ShareCardView height={MODAL_HEIGHT}>
                    <ShareCardWhiteLayer />
                    <ShareCardGradient colors={[ReelayColors.reelayBlue, '#4C268B']} />
                    <TitleInfo />
                    <CloseButton />
                    <ReactEmojiRow />
                    <CreateReelayButton />
                    <DoneButton />
                </ShareCardView>
                </KeyboardAvoidingView>
            </Modal>
        </ModalView>
    );
}
