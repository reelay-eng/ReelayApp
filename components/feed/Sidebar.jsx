import React, { useContext, useState, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';

import { AuthContext } from '../../context/AuthContext';

import { notifyCreatorOnLike } from '../../api/NotificationsApi';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { postLikeToDB, removeLike } from '../../api/ReelayDBApi';
import ReelayColors from '../../constants/ReelayColors';
import ShareOutButton from './ShareOutButton';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsis, faHeart } from '@fortawesome/free-solid-svg-icons';
import { CommentIconSVG } from '../global/SVGs';

import * as Haptics from 'expo-haptics';

export default Sidebar = ({ navigation, reelay, game = null }) => {
	const ICON_SIZE = 24;
	const DOT_ICON_SIZE = 18;

	const Count = styled(Text)`
		font-family: Outfit-Regular;
		font-size: 14px;
		font-style: normal;
		line-height: 20px;
		letter-spacing: 0.25px;
		text-align: left;

		color: #fff;
		text-shadow-color: rgba(0, 0, 0, 0.3);
		text-shadow-offset: 1px 1px;
		text-shadow-radius: 1px;
	`
	const SidebarView = styled(View)`
		align-items: center;
		align-self: flex-end;
		position: absolute;
		bottom: 95px;
	`
	const SidebarButton = styled(TouchableOpacity)`
		align-items: center;
		background: ${({ addHighlight }) => (addHighlight) 
			? 'rgba(41, 119, 239, 0.40)'
			: 'rgba(255, 255, 255, 0.20)'
		};
		border-radius: 50px;
		height: 44px;
		justify-content: center;
		margin-top: 8px;
		width: 44px;
		box-shadow: 0px 1px 1px rgba(0,0,0,0.7);
	`
	const ButtonContainer = styled(View)`
		align-items: center;
		margin-right: 10px;
	`
	const [likeUpdateCounter, setLikeUpdateCounter] = useState(0);
	const dispatch = useDispatch();

	const commentRefreshListener = useSelector(state => state.commentRefreshListener);

	const { reelayDBUser } = useContext(AuthContext);

	const commentedByUser = reelay.comments.find(comment => comment.authorName === reelayDBUser?.username);
	const likedByUser = reelay.likes.find(like => like.username === reelayDBUser?.username);
	const displayWatchlistAdds = (count) => count > 0 ? `${count}` : ``;

	const onCommentLongPress = async () => {
		if (showMeSignupIfGuest()) return;
		dispatch({ type: 'setCommentsVisible', payload: true })
	}
	const onCommentPress = async () => {
		if (showMeSignupIfGuest()) return;
		dispatch({ type: 'setCommentsVisible', payload: true })
	}
	const onDotMenuPress = async () => {
		if (showMeSignupIfGuest()) return;
		dispatch({ type: 'setDotMenuVisible', payload: true })
	}
	const onLikeLongPress = async () => {
		if (showMeSignupIfGuest()) return;
		dispatch({ type: 'setLikesVisible', payload: true })
	}

	const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true })
			return true;
		}
		return false;
	}

	const likeAnimScale = useRef(new Animated.Value(1)).current;

	const LikeButton = () => {
		const animateLike = () => {
			Animated.stagger(300, [
				Animated.spring(likeAnimScale, {
					toValue: 100,
					useNativeDriver: false,
				}),
				Animated.spring(likeAnimScale, {
					toValue: 1,
					useNativeDriver: false,
				}),
			]).start()
		}

		const onLikePress = async () => {
			if (showMeSignupIfGuest()) return;
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
	
			if (likedByUser) {
				const unlikeBody = {
					creatorName: reelay.creator.username,
					username: reelayDBUser?.username,
					reelaySub: reelay.sub,
				}
				reelay.likes = reelay.likes.filter(likes => likes.username !== reelayDBUser?.username);
				setLikeUpdateCounter(likeUpdateCounter + 1);
			
				const postResult = await removeLike(unlikeBody, reelay.sub);
				console.log(postResult);
				logAmplitudeEventProd('unlikedReelay', {
					user: reelayDBUser.username,
					creator: reelay.creator.username,
					title: reelay.title.display,
					reelayID: reelay.id,
				});
				console.log('unlikedReelay', {
					user: reelayDBUser?.username,
					creator: reelay.creator.username,
					title: reelay.title.display,
					reelayID: reelay.id,
				});
			} else {
				animateLike();
				const likeBody = {
					creatorName: reelay.creator.username,
					username: reelayDBUser?.username,
					postedAt: new Date().toISOString(),
	
					// for frontend purpose only, not used on backend:
					userSub: reelayDBUser?.sub,
				}
				reelay.likes.push(likeBody);
				setLikeUpdateCounter(likeUpdateCounter + 1);		
	
				const postResult = await postLikeToDB(likeBody, reelay.sub);
				console.log(postResult);
				notifyCreatorOnLike({ 
					creatorSub: reelay.creator.sub,
					user: reelayDBUser,
					reelay: reelay,
				});
				logAmplitudeEventProd('likedReelay', {
					user: reelayDBUser?.username,
					creator: reelay.creator.username,
					title: reelay.title.display,
					reelayID: reelay.id,
				});
			}
		}

		const likeAnimationStyle = {
			transform: [{ 
				scale: likeAnimScale.interpolate({
						inputRange: [1, 100],
						outputRange: [1, 1.7]
					}) 
			}, {
				rotate: likeAnimScale.interpolate({
					inputRange: [1, 100],
					outputRange: ["0deg", "10deg"]
				})
			}]
		}

		return (
			<ButtonContainer>
				<SidebarButton 
					onPress={onLikePress} 
					onLongPress={onLikeLongPress}>
					<Animated.View style={likeAnimationStyle}>
						<FontAwesomeIcon 
							icon={faHeart} 
							color={likedByUser ? ReelayColors.reelayRed : "white"} 
							size={ICON_SIZE} 
						/>
					</Animated.View>
				</SidebarButton>
				<Count>{reelay.likes.length}</Count>
			</ButtonContainer>
		)

	}

	return (
		<SidebarView>
			<LikeButton />

			<ButtonContainer>
				<SidebarButton 
					addHighlight={commentedByUser}
					onPress={onCommentPress} 
					onLongPress={onCommentLongPress}>
					<CommentIconSVG color={'white'} />
				</SidebarButton>
				<Count>{reelay.comments.length}</Count>
			</ButtonContainer>

			<ButtonContainer>
				<SidebarButton>
					{ game && <ShareGameButton navigation={navigation} game={game} reelay={reelay} /> }
					{ !game && <ShareOutButton navigation={navigation} reelay={reelay} /> }
				</SidebarButton>
				<Count>{''}</Count>
			</ButtonContainer>

			<ButtonContainer>
				<SidebarButton onPress={onDotMenuPress}>
					<FontAwesomeIcon icon={faEllipsis} color='white' size={DOT_ICON_SIZE} />
				</SidebarButton>
			</ButtonContainer>
		</SidebarView>
	);
}