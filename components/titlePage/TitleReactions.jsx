import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Keyboard, TouchableOpacity, View } from 'react-native';
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
import AddReactEmojiDrawer from './AddReactEmojiDrawer';

const { height, width } = Dimensions.get('window');
const MAX_DISPLAY_EMOJIS = 5;
const MAX_SELECT_EMOJIS = 3;

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
    background-color: #191919;
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
const ReactionView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    height: 56px;
    width: 100%;
    border-bottom-width: ${props => props.isLastRow ? 0 : 1}px;
    border-color: gray;
    border-opacity: 24%;
`
const ReactionLeftView = styled(View)`
    align-items: center;
    flex-direction: row;
`
const SeeAllPressable = styled(TouchableOpacity)`
    align-items: center;
    padding: 6px;
    padding-top: 0px;
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

export default TitleReactions = ({ navigation, titleObj, seeAll = false }) => {

    // authoritative state:
    // all reactions
    // changes: remove reaction, add reaction

    // takes form of a watchlistItem

    const getMyReaction = () => {
        const matchWatchlistItem = ({ tmdbTitleID, titleType }) => {
            return (tmdbTitleID === titleObj?.id) && (titleType === titleObj?.titleType);
        }

        const newWatchlistItem = {
            hasSeenTitle: false,
            isNewWatchlistItem: true,
            recommendedReelaySub: null, 
            recReelayCreatorName: null,
            tmdbTitleID: titleObj?.id, 
            titleType: titleObj?.titleType,
            title: titleObj,
            reactEmojis: '',
            userSub: reelayDBUser?.sub,
            username: reelayDBUser?.username,
        };

        return myWatchlistItems.find(matchWatchlistItem) ?? newWatchlistItem;
    }

    const authSession = useSelector(state => state.authSession);
    const emojiLastIndices = useRef({});
    const initReactions = titleObj?.allReactions ?? [];
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const [myReaction, setMyReaction] = useState(getMyReaction());
    const [allReactions, setAllReactions] = useState(initReactions);

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

    const reactionsByEmoji = getReactionsByEmoji();

    const autoMarkSeen = async () => {
        if (!myReaction?.hasSeenTitle) {
            myReaction.hasSeenTitle = true;
            const watchlistItemMarkedSeen = await markWatchlistItemSeen({
                reqUserSub: reelayDBUser?.sub,
                tmdbTitleID: myReaction?.tmdbTitleID,
                titleType: myReaction?.titleType,
            });

            watchlistItemMarkedSeen.title = titleObj;
            return watchlistItemMarkedSeen;
        }
    }

    const loadReactions = async () => {
        const loadReactionsObj = await getTitleReactEmojis({ 
            authSession, 
            reqUserSub: reelayDBUser?.sub,
            tmdbTitleID: titleObj?.id,
            titleType: titleObj?.titleType,
        });

        titleObj.allReactions = loadReactionsObj?.allReactions;
        if (loadReactionsObj && !loadReactionsObj?.error) {
            setAllReactions(loadReactionsObj?.allReactions ?? []);
        }
    }

    const selectEmoji = (emoji) => {
        if (myReaction?.reactEmojis?.indexOf(emoji) !== -1) return;
        const atMaxEmojisSelected = (myReaction?.reactEmojis?.length === MAX_SELECT_EMOJIS * 2);
        const nextReactEmojis = (atMaxEmojisSelected)
            ? myReaction?.reactEmojis.slice(2) + emoji
            : myReaction?.reactEmojis + emoji;
        const nextMyReaction = { 
            ...myReaction, 
            reactEmojis: nextReactEmojis,
            hasSeenTitle: true,
        };
        setMyReaction(nextMyReaction);

        const removeMyReaction = (reaction) => reaction?.userSub !== reelayDBUser?.sub
        const myReactionCondensed = {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
            reactEmojis: nextReactEmojis
        };

        const nextAllReactions = [
            myReactionCondensed, 
            ...allReactions.filter(removeMyReaction)
        ];

        titleObj.allReactions = nextAllReactions;
        setAllReactions(nextAllReactions);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateReactions(nextReactEmojis);
    }

    const unselectEmoji = (emoji) => {
        let nextReactEmojis = '';
        for (let ii = 0; ii < myReaction?.reactEmojis?.length; ii += 2) {
            const nextEmoji = myReaction?.reactEmojis.charAt(ii) + myReaction?.reactEmojis.charAt(ii + 1);
            if (nextEmoji === emoji) continue;
            nextReactEmojis += nextEmoji;
        }

        const nextMyReaction = { ...myReaction, reactEmojis: nextReactEmojis };
        setMyReaction(nextMyReaction);

        const removeMyReaction = (reaction) => reaction?.userSub !== reelayDBUser?.sub;
        const myReactionCondensed = {
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
            reactEmojis: nextReactEmojis
        };

        const nextAllReactions = [
            myReactionCondensed, 
            ...allReactions.filter(removeMyReaction)
        ];

        titleObj.allReactions = nextAllReactions;
        setAllReactions(nextAllReactions);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateReactions(nextReactEmojis);
    }

    const updateReactions = async (nextReactEmojis) => {
        if (nextReactEmojis === myReaction?.reactEmojis) return;
        const nextMyReaction = (!myReaction?.hasSeenTitle)
            ? await autoMarkSeen()
            : myReaction;

        const watchlistItemWithEmojis = await setReactEmojis({
            authSession, 
            itemID: nextMyReaction?.id, 
            reactEmojis: nextReactEmojis,
            reqUserSub: reelayDBUser?.sub,
        });

        watchlistItemWithEmojis.title = titleObj;
        if (watchlistItemWithEmojis && !watchlistItemWithEmojis?.error) {
            dispatch({ type: 'setUpdatedWatchlistItem', payload: watchlistItemWithEmojis })
        }
    }
    
    const AddOtherEmojiButton = () => {
        const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
        const openDrawer = () => setShowEmojiDrawer(true);
        const closeDrawer = () => setShowEmojiDrawer(false);

        return (
            <ReactEmojiView>
                <ReactEmojiPressable onPress={openDrawer}>
                    <FontAwesomeIcon icon={faPlus} color='white' size={20} />
                </ReactEmojiPressable>
                { showEmojiDrawer && (
                    <AddReactEmojiDrawer closeDrawer={closeDrawer} onEmojiSelected={selectEmoji} />
                )}
            </ReactEmojiView>
        )
    }

    const ReactionRow = ({ reaction, isLastRow }) => {
        const reactEmojis = reaction?.reactEmojis;
        const user = { sub: reaction?.userSub , username: reaction?.username };

        // not proud of this hack: the query doesn't return your own username
        const displayUsername = user?.username ?? reelayDBUser?.username;

        return (
            <ReactionView isLastRow={isLastRow}>
                <ReactionLeftView>
                    <ProfilePicture navigation={navigation} user={user} size={30} />
                    <ReactUsernameText>{displayUsername}</ReactUsernameText>
                </ReactionLeftView>
                <ReactEmojiText>{reactEmojis}</ReactEmojiText>
            </ReactionView>
        );
    }

    const ReactEmoji = ({ emoji }) => {
        const isSelected = (myReaction?.reactEmojis?.indexOf(emoji) !== -1);
        const reactionCount = reactionsByEmoji[emoji];
        const showReactionCount = (reactionCount > 0);
        const onPress = async () => (isSelected) ? unselectEmoji(emoji) : selectEmoji(emoji);

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
                { !seeAll && <MarkSeenButton showText={true} watchlistItem={myReaction} /> }
            </ReactionHeaderRow>
        );
    }

    const ReactEmojisRow = () => {
        const sortEmojisByCount = (emoji0, emoji1) => {            
            const isSelected0 = myReaction?.reactEmojis.indexOf(emoji0) !== -1;
            const isSelected1 = myReaction?.reactEmojis.indexOf(emoji1) !== -1;

            if (isSelected0 && !isSelected1) return -1;
            if (!isSelected0 && isSelected1) return 1;

            let lastIndex0 = emojiLastIndices?.current[emoji0] ?? 11
            let lastIndex1 = emojiLastIndices?.current[emoji1] ?? 11;

            if (lastIndex0 !== -1 || lastIndex1 !== -1) {
                return lastIndex0 - lastIndex1;
            }

            const reactionCount0 = reactionsByEmoji[emoji0];
            const reactionCount1 = reactionsByEmoji[emoji1];
            return reactionCount1 - reactionCount0;
        }

        const emojiKeys = Object.keys(reactionsByEmoji).sort(sortEmojisByCount);
        const displayEmojiKeys = emojiKeys.slice(0, MAX_DISPLAY_EMOJIS);

        const sortEmojisInDisplay = (emoji0, emoji1) => {
            let lastIndex0 = emojiLastIndices?.current[emoji0] ?? 11
            let lastIndex1 = emojiLastIndices?.current[emoji1] ?? 11;
            return lastIndex0 - lastIndex1;
        }

        displayEmojiKeys.sort(sortEmojisInDisplay);
        emojiKeys.slice(MAX_DISPLAY_EMOJIS).map(emoji => emojiLastIndices.current[emoji] = 11);

        return (
            <ReactEmojisRowView>
                { displayEmojiKeys.map((emoji, index) => {
                    emojiLastIndices.current[emoji] = index;
                    return <ReactEmoji key={emoji} emoji={emoji} />
                })}
                <AddOtherEmojiButton />
            </ReactEmojisRowView>
        )
    }

    const SeeOtherReactions = () => {
        const removeMyReaction = reaction => reaction?.userSub !== reelayDBUser?.sub;
        const displayReactions = seeAll ? allReactions : allReactions.slice(0,3).filter(removeMyReaction);
        const showSeeAll = !seeAll && (displayReactions.length > 0);

        const SeeAll = () => {
            const advanceToSeeAllScreen = () => {
                navigation.push('SeeAllTitleReactionsScreen', { titleObj });
            }
            return (
                <SeeAllPressable onPress={advanceToSeeAllScreen}>
                    <SeeAllText>{'see all'}</SeeAllText>
                </SeeAllPressable>
            )
        }

        const renderReactionRow = ({ item, index }) => {
            const reaction = item;
            const isLastRow = (index === displayReactions?.length - 1)
            return <ReactionRow key={reaction?.userSub} isLastRow={isLastRow} reaction={reaction} />;
        }

        return (
            <SeeOtherReactionsView>
                { seeAll && (
                    <FlatList 
                        data={displayReactions}
                        estimatedItemSize={30}
                        keyExtractor={reaction => reaction?.userSub}
                        renderItem={renderReactionRow}
                        showsVerticalScrollIndicator={false}
                    />                
                )}
                { !seeAll && (displayReactions.map(reaction => renderReactionRow({ item: reaction })))}
                { showSeeAll && <SeeAll /> }
            </SeeOtherReactionsView>
        );
    }

    useEffect(() => {
        const nextMyReaction = getMyReaction();
        setMyReaction(getMyReaction());
        if (myReaction?.reactEmojis?.length === 0) {
            const removeMyReaction = reaction => reaction?.userSub !== nextMyReaction?.userSub;
            setAllReactions(allReactions.filter(removeMyReaction));
        }
    }, [myWatchlistItems]);

    useEffect(() => {
        if (seeAll && (titleObj?.allReactions?.length > 0)) return;
        loadReactions();
    }, []);

    return (
        <ReactionCardView>
            <ReactionHeader />
            <ReactEmojisRow />
            <SeeOtherReactions />
        </ReactionCardView>
    )
}