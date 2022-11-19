import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import { getTitleReactEmojis } from '../../api/WatchlistApi';
import MarkSeenButton from '../watchlist/MarkSeenButton';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import * as Haptics from 'expo-haptics';

const { height, width } = Dimensions.get('window');
const MAX_DISPLAY_EMOJIS = 5;

const HeaderText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 18px;
`
const ReactEmojiCount = styled(ReelayText.Body1)`
    color: ${props => props?.isSelected ? 'white' : 'gray' };
    font-size: 16px;
    margin-top: 8px;
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
const ReactEmojisRowView = styled(View)`
    align-items: flex-start;
    flex-direction: row;
    justify-content: center;
    padding: 12px;
    width: 100%;
`
const ReactEmojiText = styled(ReelayText.H6)`
    font-size: 30px;
    line-height: 40px;
`
const ReactEmojiView = styled(View)`
    align-items: center;
    width: 56px;
`
const ReactionCardView = styled(View)`
    align-items: center;
    background-color: #0D0D0D;
    border-radius: 16px;
    margin: 16px;
    padding: 12px;
    width: ${width - 32}px;
`
const ReactionHeaderRow = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`

const DEFAULT_REACTIONS_BY_EMOJI = {
    '🤣': 0,
    '😍': 0,
    '🤯': 0,
    '😴': 0,
    '🐐': 0,
}

const emojiUtf16ToArr = (reactEmojis) => {
    const reactEmojisArr = [];
    for (let ii = 0; ii < reactEmojis.length; ii += 2) {
        const nextEmoji = reactEmojis.charAt(ii) + reactEmojis.charAt(ii + 1);
        reactEmojisArr.push(nextEmoji);
    }
    return reactEmojisArr;
}

const emojiArrToUtf16 = (reactEmojisArr) => {
    return reactEmojisArr.join('');
}

export default TitleReactions = ({ navigation, titleObj }) => {

    // authoritative state:
    // all reactions
    // changes: remove reaction, add reaction

    // takes form of a watchlistItem
    const newReaction = {
        recommendedReelaySub: null, 
        recReelayCreatorName: null,
        tmdbTitleID: titleObj?.id, 
        titleType: titleObj?.titleType,     
        reactEmojis: '',
    };

    const authSession = useSelector(state => state.authSession);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const { reelayDBUser } = useContext(AuthContext);
    const [markedSeen, setMarkedSeen] = useState(false);
    const [myReaction, setMyReaction] = useState(newReaction);
    const [allReactions, setAllReactions] = useState([]);

    const getReactionsByEmoji = () => allReactions.reduce((emojiCounts, nextReaction) => {
        const utf16EmojiBuffer = nextReaction?.reactEmojis ?? '';
        for (let ii = 0; ii < utf16EmojiBuffer?.length; ii += 2) {
            const emoji = utf16EmojiBuffer.charAt(ii) + utf16EmojiBuffer.charAt(ii + 1);
            if (emojiCounts[emoji]) {
                emojiCounts[emoji] += 1;
            } else {
                emojiCounts[emoji] = 1;
            }
        }
        return emojiCounts;
    }, {...DEFAULT_REACTIONS_BY_EMOJI});

    const getMyReaction = () => {
        const matchWatchlistItem = ({ tmdbTitleID, titleType }) => {
            return (tmdbTitleID === titleObj?.id) && (titleType === titleObj?.titleType);
        }

        const newWatchlistItem = {
            recommendedReelaySub: null, 
            recReelayCreatorName: null,
            tmdbTitleID: titleObj?.id, 
            titleType: titleObj?.titleType,
            hasSeenTitle: true,
            reactEmojis: '',
        };

        return myWatchlistItems.find(matchWatchlistItem) ?? newWatchlistItem;
    }

    const reactionsByEmoji = getReactionsByEmoji();

    const loadReactions = async () => {
        const loadReactionsObj = await getTitleReactEmojis({ 
            authSession, 
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID: titleObj?.id,
            titleType: titleObj?.titleType,
        });

        if (loadReactionsObj && !loadReactionsObj?.error) {
            setAllReactions(loadReactionsObj?.allReactions ?? []);
        }
    }

    const ReactEmoji = ({ emoji }) => {
        const isSelected = (myReaction?.reactEmojis?.indexOf(emoji) !== -1);
        const reactionCount = reactionsByEmoji[emoji];
        const showReactionCount = (reactionCount > 0);

        const selectEmoji = async () => {     
            const nextReactEmojis = myReaction?.reactEmojis + emoji;
            const nextMyReaction = { ...myReaction, reactEmojis: nextReactEmojis };
            setMyReaction(nextMyReaction);

            const removeMyReaction = (reaction) => reaction?.userSub !== reelayDBUser?.sub
            const nextAllReactions = [nextMyReaction, ...allReactions.filter(removeMyReaction)];
            setAllReactions(nextAllReactions);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // TODO: update server
        }

        const unselectEmoji = async () => {
            let nextReactEmojis = '';
            for (let ii = 0; ii < myReaction?.reactEmojis?.length; ii += 2) {
                const nextEmoji = myReaction?.reactEmojis.charAt(ii) + myReaction?.reactEmojis.charAt(ii + 1);
                if (nextEmoji === emoji) continue;
                nextReactEmojis += nextEmoji;
            }

            const nextMyReaction = { ...myReaction, reactEmojis: nextReactEmojis };
            setMyReaction(nextMyReaction);

            const removeMyReaction = (reaction) => reaction?.userSub !== reelayDBUser?.sub
            const nextAllReactions = [nextMyReaction, ...allReactions.filter(removeMyReaction)]
            setAllReactions(nextAllReactions);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }


        const onPress = async () => {
            if (isSelected) {
                unselectEmoji();
            } else {
                selectEmoji();
            }

            // todo: 
            // 1. create the watchlist item
            // 2. mark it as seen
            // 3. add emojis to it

        //     const setEmojisResult = await setReactEmojis({
        //         authSession, 
        //         itemID: watchlistItem?.id, 
        //         reactEmojis: nextSelectedEmojis.join(''),
        //         reqUserSub: reelayDBUser?.sub,
        //    });
        }

        return (
            <ReactEmojiView>
                <ReactEmojiPressable key={emoji} isSelected={isSelected} onPress={onPress}>
                    <ReactEmojiText>{emoji}</ReactEmojiText>
                </ReactEmojiPressable>
                { showReactionCount && <ReactEmojiCount>{reactionCount}</ReactEmojiCount> }
            </ReactEmojiView>
        )
    }

    const AddOtherEmojiButton = () => {
        return (
            <ReactEmojiView>
                <ReactEmojiPressable>
                    <FontAwesomeIcon icon={faPlus} color='white' size={20} />
                </ReactEmojiPressable>
                <ReactEmojiCount>{''}</ReactEmojiCount>
            </ReactEmojiView>
        )
    }

    const ReactionHeader = () => {
        return (
            <ReactionHeaderRow>
                <HeaderText>{'Reactions'}</HeaderText>
                <MarkSeenButton 
                    markedSeen={markedSeen} 
                    setMarkedSeen={setMarkedSeen} 
                    showText={true}
                    watchlistItem={null}            
                />
            </ReactionHeaderRow>
        );
    }

    const ReactEmojisRow = () => {
        const emojiKeys = Object.keys(reactionsByEmoji);
        const displayEmojiKeys = emojiKeys.slice(0, MAX_DISPLAY_EMOJIS);

        return (
            <ReactEmojisRowView>
                { displayEmojiKeys.map(emoji => <ReactEmoji key={emoji} emoji={emoji} /> )}
                <AddOtherEmojiButton />
            </ReactEmojisRowView>
        )
    }

    useEffect(() => {
        setMyReaction(getMyReaction());
        if (!titleObj?.reactions) loadReactions();
    }, []);

    return (
        <ReactionCardView>
            <ReactionHeader />
            <ReactEmojisRow />
        </ReactionCardView>
    )
}