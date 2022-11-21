import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';
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
import { FlashList } from '@shopify/flash-list';

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
        ? ReelayColors.reelayGreen
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
const ReactionView = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    height: 40px;
    width: 100%;
`
const ReactionLeftView = styled(View)`
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

export default TitleReactions = ({ navigation, titleObj, seeAll = false, loadedReactions = [] }) => {

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
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);
    const dispatch = useDispatch();
    const { reelayDBUser } = useContext(AuthContext);

    const [myReaction, setMyReaction] = useState(getMyReaction());
    const [allReactions, setAllReactions] = useState(loadedReactions);

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
            </ReactEmojiView>
        )
    }

    const ReactionRow = ({ reaction }) => {
        const reactEmojis = reaction?.reactEmojis;
        const user = { sub: reaction?.userSub , username: reaction?.username };

        // not proud of this hack: the query doesn't return your own username
        const displayUsername = user?.username ?? reelayDBUser?.username;

        return (
            <ReactionView>
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

        const selectEmoji = () => {     
            const nextReactEmojis = myReaction?.reactEmojis + emoji;
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
        const displayReactions = seeAll ? allReactions : allReactions.slice(0,3).filter(removeMyReaction);
        const showSeeAll = !seeAll && (displayReactions.length > 0);

        const SeeAll = () => {
            const advanceToSeeAllScreen = () => {
                navigation.navigate('SeeAllTitleReactionsScreen', { titleObj, allReactions });
            }
            return (
                <SeeAllPressable onPress={advanceToSeeAllScreen}>
                    <SeeAllText>{'see all'}</SeeAllText>
                </SeeAllPressable>
            )
        }

        const renderReactionRow = ({ item, index }) => {
            const reaction = item;
            return <ReactionRow key={reaction?.userSub} reaction={reaction} />;
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
        if (!loadedReactions?.length) loadReactions();
    }, []);

    return (
        <ReactionCardView>
            <ReactionHeader />
            <ReactEmojisRow />
            <SeeOtherReactions />
        </ReactionCardView>
    )
}