import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

import { getTitleReactEmojis, markWatchlistItemSeen, setReactEmojis } from '../../api/WatchlistApi';
import MarkSeenButton from '../watchlist/MarkSeenButton';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import * as Haptics from 'expo-haptics';
import ProfilePicture from '../global/ProfilePicture';

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
    font-size: 20px;
    line-height: 40px;
`
const ReactEmojiTextLarge = styled(ReelayText.H6)`
    font-size: 30px;
    line-height: 40px;
`
const ReactEmojiView = styled(View)`
    align-items: center;
    width: 56px;
`
const ReactUsernameText = styled(ReelayText.H6)`
    color: white;
    font-size: 16px;
    line-height: 30px;
    margin-top: 4px;
    margin-left: 8px;
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
const OtherReactionView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
`
const OtherReactionLeftView = styled(View)`
    align-items: center;
    flex-direction: row;
`
const SeeAllPressable = styled(TouchableOpacity)`
    align-items: center;
    padding: 6px;
    width: 100%;
`
const SeeAllText = styled(ReelayText.Body2)`
    color: gray;
    font-size: 16px;
    margin-top: 8px;
`
const SeeOtherReactionsView = styled(View)`
    padding-left: 12px;
    padding-right: 12px;
    width: 100%;
`

const DEFAULT_REACTIONS_BY_EMOJI = {
    '🤣': 0,
    '😍': 0,
    '🤯': 0,
    '😴': 0,
    '🐐': 0,
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
    const dispatch = useDispatch();
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
            hasSeenTitle: true,
            isNewWatchlistItem: true,
            recommendedReelaySub: null, 
            recReelayCreatorName: null,
            tmdbTitleID: titleObj?.id, 
            titleType: titleObj?.titleType,
            reactEmojis: '',
            userSub: reelayDBUser?.sub,
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

    const OtherReactionRow = ({ reaction }) => {
        const reactEmojis = reaction?.reactEmojis;
        const user = { sub: reaction?.userSub , username: reaction?.username };

        return (
            <OtherReactionView>
                <OtherReactionLeftView>
                    <ProfilePicture navigation={navigation} user={user} size={30} />
                    <ReactUsernameText>{user?.username}</ReactUsernameText>
                </OtherReactionLeftView>
                <ReactEmojiText>{reactEmojis}</ReactEmojiText>
            </OtherReactionView>
        );
    }

    const ReactEmoji = ({ emoji }) => {
        const isSelected = (myReaction?.reactEmojis?.indexOf(emoji) !== -1);
        const reactionCount = reactionsByEmoji[emoji];
        const showReactionCount = (reactionCount > 0);

        const selectEmoji = () => {     
            const nextReactEmojis = myReaction?.reactEmojis + emoji;
            const nextMyReaction = { ...myReaction, reactEmojis: nextReactEmojis };
            setMyReaction(nextMyReaction);

            const removeMyReaction = (reaction) => reaction?.userSub !== reelayDBUser?.sub
            const nextAllReactions = [nextMyReaction, ...allReactions.filter(removeMyReaction)];
            setAllReactions(nextAllReactions);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            return nextReactEmojis;
        }

        const unselectEmoji = () => {
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
            return nextReactEmojis;
        }


        const onPress = async () => {
            const nextReactEmojis = (isSelected) ? unselectEmoji() : selectEmoji();
            if (myReaction?.isNewWatchlistItem) {
                const watchlistItem = await markWatchlistItemSeen({
                    reqUserSub: reelayDBUser?.sub,
                    titleType: titleObj?.titleType,
                    tmdbTitleID: titleObj?.id,
                });
                myReaction.id = watchlistItem?.id;
            }

            const watchlistItemWithEmojis = await setReactEmojis({
                authSession, 
                itemID: myReaction?.id, 
                reactEmojis: nextReactEmojis,
                reqUserSub: reelayDBUser?.sub,
            });

            console.log('react emojis: ', nextReactEmojis);

            if (watchlistItemWithEmojis && !watchlistItemWithEmojis?.error) {
                dispatch({ type: 'setUpdatedWatchlistItem', payload: watchlistItemWithEmojis })
            }

           console.log('set emojis result: ', watchlistItemWithEmojis);
        }

        return (
            <ReactEmojiView>
                <ReactEmojiPressable key={emoji} isSelected={isSelected} onPress={onPress}>
                    <ReactEmojiTextLarge>{emoji}</ReactEmojiTextLarge>
                </ReactEmojiPressable>
                { showReactionCount && <ReactEmojiCount>{reactionCount}</ReactEmojiCount> }
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

    const SeeOtherReactions = () => {
        const removeMyReaction = reaction => reaction?.userSub !== reelayDBUser?.sub;
        const displayOtherReactions = allReactions.slice(0,3).filter(removeMyReaction)

        return (
            <SeeOtherReactionsView>
                { displayOtherReactions.map(reaction => <OtherReactionRow reaction={reaction} /> )}
                <SeeAllPressable>
                    <SeeAllText>{'see all'}</SeeAllText>
                </SeeAllPressable>
            </SeeOtherReactionsView>
        );
    }

    useEffect(() => {
        setMyReaction(getMyReaction());
        if (!titleObj?.reactions) loadReactions();
    }, []);

    return (
        <ReactionCardView>
            <ReactionHeader />
            <ReactEmojisRow />
            <SeeOtherReactions />
        </ReactionCardView>
    )
}