import React, { useContext, useState, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';

import { AuthContext } from '../../context/AuthContext';

import { notifyCreatorOnLike } from '../../api/NotificationsApi';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { postLikeToDB, removeLike } from '../../api/ReelayDBApi';
import ShareOutButton from './ShareOutButton';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsis, faHeart } from '@fortawesome/free-solid-svg-icons';
import { CommentIcon30DotlessSVG, CommentIcon30SVG } from '../global/SVGs';

import * as Haptics from 'expo-haptics';
import ShareGameButton from '../games/ShareGameButton';
import { BlurView } from 'expo-blur';

const ICON_SIZE = 27;
const DOT_ICON_SIZE = 21;

const ButtonContainer = styled(View)`
	align-items: center;
	margin-right: 10px;
	margin-top: 8px;
`
const SidebarButtonBlurView = styled(BlurView)`
	align-items: center;
	border-radius: 100%;
	height: 100%;
	overflow: hidden;
	justify-content: center;
	position: absolute;
	width: 100%;
`
const SidebarButton = styled(TouchableOpacity)`
	align-items: center;
	background-color: ${props => props.addHighlight 
		? 'rgba(41, 119, 239, 0.25)' 
		: 'transparent'
	}
	border-radius: 50px;
	height: 44px;
	justify-content: center;
	width: 44px;
	shadow-offset: 2px 2px;
    shadow-color: black;
    shadow-opacity: 0.5;
`
const SidebarView = styled(View)`
	align-items: center;
	align-self: flex-end;
	position: absolute;
	bottom: 95px;
`

export default Sidebar = ({ navigation, reelay, game = null }) => {
	const commentRefreshListener = useSelector(state => state.commentRefreshListener);
	const dispatch = useDispatch();
	const [likeUpdateCounter, setLikeUpdateCounter] = useState(0);
	const { reelayDBUser } = useContext(AuthContext);

	const hasComments = reelay.comments?.length > 0;
	const commentedByUser = reelay.comments.find(comment => comment.authorName === reelayDBUser?.username);
	const likedByUser = reelay.likes.find(like => like.username === reelayDBUser?.username);

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
				{ likedByUser && (
					<SidebarButtonBlurView intensity={25} tint='dark' />
				)}
				<SidebarButton 
					onPress={onLikePress} 
					onLongPress={onLikeLongPress}>
					<Animated.View style={likeAnimationStyle}>
						<FontAwesomeIcon 
							icon={faHeart} 
							color={likedByUser ? '#FF4848' : "white"} 
							size={ICON_SIZE} 
						/>
					</Animated.View>
				</SidebarButton>
			</ButtonContainer>
		)

	}

	return (
		<SidebarView>
			<LikeButton />
			<ButtonContainer>
				{ commentedByUser && <SidebarButtonBlurView intensity={25} tint='dark' /> }
				<SidebarButton 
					addHighlight={commentedByUser}
					onPress={onCommentPress} 
					onLongPress={onCommentLongPress}>
						{ hasComments && <CommentIcon30SVG /> }
						{ !hasComments && <CommentIcon30DotlessSVG /> }
				</SidebarButton>
			</ButtonContainer>

			<ButtonContainer>
				<SidebarButton>
					{ game && <ShareGameButton /> }
					{ !game && <ShareOutButton navigation={navigation} reelay={reelay} /> }
				</SidebarButton>
			</ButtonContainer>

			<ButtonContainer>
				<SidebarButton onPress={onDotMenuPress}>
					<FontAwesomeIcon icon={faEllipsis} color='white' size={DOT_ICON_SIZE} />
				</SidebarButton>
			</ButtonContainer>
		</SidebarView>
	);
}