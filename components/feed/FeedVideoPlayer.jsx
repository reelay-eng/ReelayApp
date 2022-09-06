import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { Video, Audio } from 'expo-av'
import { useFocusEffect } from '@react-navigation/native';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { addToMyWatchlist } from '../../api/WatchlistApi';
import { useDispatch, useSelector } from 'react-redux';
import { notifyOnAddedToWatchlist } from '../../api/WatchlistNotifications';
import { showMessageToast } from '../utils/toasts';
import { AddedToWatchlistGiantIconSVG } from '../global/SVGs';
import { animate } from '../../hooks/animations';

import * as ReelayText from '../global/Text';
import * as Haptics from 'expo-haptics';
import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');
const ADD_TO_WATCHLIST_GIANT_ICON_SIZE = 92;
const ADD_TO_WATCHLIST_ICON_TIMEOUT_MS = 1200;
const DOUBLE_TAP_TIMEOUT_MS = 250;
const PLAY_PAUSE_ICON_SIZE = 48;
const PLAY_PAUSE_ICON_TIMEOUT_MS = 800;

const AddedToWatchlistText = styled(ReelayText.Subtitle1Emphasized)`
	color: white;
`
const IconPressable = styled(Pressable)`
	position: absolute;
	left: ${(width - PLAY_PAUSE_ICON_SIZE) / 2}px;
	opacity: 50;
	top: ${(height - PLAY_PAUSE_ICON_SIZE) / 2}px;
	height: ${PLAY_PAUSE_ICON_SIZE}px;
	width: ${PLAY_PAUSE_ICON_SIZE}px;
	zIndex: 3;
`
const PopperView = styled(View)`
	align-items: center;
	position: absolute;
	top: ${(height - ADD_TO_WATCHLIST_GIANT_ICON_SIZE) / 2}px;
`
const TappableOverlay = styled(Pressable)`
	align-items: center;
`

const AddedToWatchlistPopper = () => {
	useEffect(() => {
		animate(200);
		return () => animate(200);
	}, []);

	return (
		<PopperView>
			<AddedToWatchlistGiantIconSVG />
			<AddedToWatchlistText>{'added to your watchlist'}</AddedToWatchlistText>
		</PopperView>
	);
}

const PlayPauseIcon = ({ onPress, type = 'play' }) => {
    return (
        <IconPressable onPress={onPress}>
            <Icon type='ionicon' name={type} color={'white'} size={PLAY_PAUSE_ICON_SIZE} />
        </IconPressable>
    );
}

const ReelayVideo = ({ 
	onPlaybackStatusUpdate,
	shouldPlay,
	videoURI,
}) => {
	return (
		<Video
			isLooping={true}
			isMuted={false}
			onPlaybackStatusUpdate={onPlaybackStatusUpdate}
			progressUpdateIntervalMillis={50}
			rate={1.0}
			resizeMode='cover'
			shouldPlay={shouldPlay}
			source={{ uri: videoURI }}
			style={{ height, width }}
			useNativeControls={false}
			volume={1.0}
		/>
	);
}

export default function FeedVideoPlayer({ reelay, viewable }) {
	const dispatch = useDispatch();
	const { reelayDBUser } = useContext(AuthContext);
	const authSession = useSelector(state => state.authSession);
	const myWatchlistItems = useSelector(state => state.myWatchlistItems);

	const [finishedLoading, setFinishedLoading] = useState(false);
	const [focused, setFocused] = useState(false);
	const [paused, setPaused] = useState(false);
	const [playPauseVisible, setPlayPauseVisible] = useState(false);
	const [showWatchlistIcon, setShowWatchlistIcon] = useState(false);

	const shouldPlay = viewable && focused && !paused;
	const tapCounter = useRef(0);

	useEffect(() => {
		if (!viewable && paused) {
			setPaused(false);
			setPlayPauseVisible('none');
		}
	}, [viewable, paused, focused]);

	useEffect(() => {
		if (showWatchlistIcon) {
			setTimeout(() => {
				setShowWatchlistIcon(false);
			}, ADD_TO_WATCHLIST_ICON_TIMEOUT_MS);
		}
	}, [showWatchlistIcon]);

    useFocusEffect(React.useCallback(() => {
		if (viewable) setFocused(true);
        return () => {
			if (viewable) setFocused(false);
		}
    }));

	const addToWatchlist = async () => {
		const title = reelay?.title;
		const titleKey = `${title.titleType}-${title.id}`;

		const matchWatchlistItem = (nextWatchlistItem) => {
			if (!nextWatchlistItem.hasAcceptedRec) return false;
			const { titleType, tmdbTitleID } = nextWatchlistItem;
			const watchlistItemTitleKey = `${titleType}-${tmdbTitleID}`;
			return (watchlistItemTitleKey === titleKey);
		}	

		const isAlreadyAdded = myWatchlistItems.find(matchWatchlistItem);
		if (isAlreadyAdded) {
			showMessageToast(`Already added ${title.display} to your watchlist`);
			return;
		}

		setShowWatchlistIcon(true);
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		const addToWatchlistResult = await addToMyWatchlist({
			authSession,
			reqUserSub: reelayDBUser?.sub,
			reelaySub: reelay?.sub,
			creatorName: reelay?.creator?.username,
			tmdbTitleID: title?.id,
			titleType: title?.titleType,
		});

		const nextWatchlistItems = [ 
			addToWatchlistResult, 
			...myWatchlistItems 
		];

		if (reelay?.creator) {
			notifyOnAddedToWatchlist({
				reelayedByUserSub: reelay?.creator?.sub,
				addedByUserSub: reelayDBUser?.sub,
				addedByUsername: reelayDBUser?.username,
				watchlistItem: addToWatchlistResult,
			});    
		}
		logAmplitudeEventProd('addToMyWatchlist', {
			title: title?.display,
			username: reelayDBUser?.username,
			userSub: reelayDBUser?.sub,
		});
		dispatch({ type: 'setMyWatchlistItems', payload: nextWatchlistItems });
		// showMessageToast(`Added ${title.display} to your watchlist`);
	}

	const onPlaybackStatusUpdate = (playbackStatus) => {
		if (!finishedLoading) {
			if (viewable) {
				console.log(`NOT finished loading: ${reelay.creator.username} ${reelay.title.display}`)
			}
		}
		if (!finishedLoading && playbackStatus?.isLoaded) {
			setFinishedLoading(true);
			if (viewable) {
				console.log(`finished loading: ${reelay.creator.username} ${reelay.title.display}`)
			}
		} 
		if (playbackStatus?.didJustFinish && viewable) {
			logAmplitudeEventProd('watchedFullReelay', {
				reelayID: reelay.id,
				reelayCreator: reelay.creator.username,
				title: reelay.title.display,
				username: reelayDBUser?.username,
			})
		}
	}

	const onPlayPause = async () => {
		if (paused) {
            setPaused(false);
            setPlayPauseVisible('pause');
            setTimeout(() => {
                setPlayPauseVisible('none');
            }, PLAY_PAUSE_ICON_TIMEOUT_MS);    

            logAmplitudeEventProd('playVideo', {
                creatorName: reelay.creator.username,
                reelayID: reelay.id,
                reelayTitle: reelay.title.display,
                username: reelayDBUser?.username,
            });
		} else {
            setPaused(true);
            setPlayPauseVisible('play');
            setTimeout(() => {
                if (playPauseVisible === 'play') {
                    setPlayPauseVisible('none');
                }
            }, PLAY_PAUSE_ICON_TIMEOUT_MS);   

            logAmplitudeEventProd('pauseVideo', {
                creatorName: reelay.creator.username,
                reelayID: reelay.id,
                reelayTitle: reelay.title.display,
                username: reelayDBUser?.username,
            });
		}
	}

	const onTap = () => {
		if (tapCounter.current === 1) {
			addToWatchlist();
			tapCounter.current = 0;
		} else {
			tapCounter.current = 1;
			setTimeout(() => {
				if (tapCounter.current === 1) {
					tapCounter.current = 0;
					onPlayPause();
				}
			}, DOUBLE_TAP_TIMEOUT_MS);
		}
	}

	return (
		<TappableOverlay onPress={onTap}>
			<ReelayVideo 
				onPlaybackStatusUpdate={onPlaybackStatusUpdate}
				shouldPlay={shouldPlay} 
				videoURI={reelay?.content?.videoURI}
			/>
			{ playPauseVisible !== 'none' && (
				<PlayPauseIcon onPress={onTap} type={playPauseVisible} />
			) }
			{ showWatchlistIcon && <AddedToWatchlistPopper /> }
		</TappableOverlay>
	);
};