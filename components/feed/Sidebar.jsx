import React, { useContext, useState, useEffect } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from "../global/Text";
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import { notifyCreatorOnLike } from '../../api/NotificationsApi';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { postLikeToDB, removeLike } from '../../api/ReelayDBApi';
import SendRecButton from '../watchlist/SendRecButton';
import ReelayColors from '../../constants/ReelayColors';

const { height, width } = Dimensions.get('window');

export default Sidebar = ({ navigation, reelay }) => {
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
		text-shadow-color: rgba(0, 0, 0, 0.2);
		text-shadow-offset: 1px 1px;
		text-shadow-radius: 1px;
	`
	const SidebarView = styled(View)`
		align-items: center;
		align-self: flex-end;
		position: absolute;
		bottom: ${height / 6}px;
	`
	const SidebarButton = styled(Pressable)`
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
	`
	const ButtonContainer = styled(View)`
		align-items: center;
		margin-right: 10px;
	`
	const [likeUpdateCounter, setLikeUpdateCounter] = useState(0);

	const { reelayDBUser } = useContext(AuthContext);
	const { 
		setCommentsVisible, 
		setLikesVisible, 
		setDotMenuVisible, 
		setJustShowMeSignupVisible,
	} = useContext(FeedContext);

	const isMyReelay = reelay.creator.sub === reelayDBUser?.sub;
	const commentedByUser = reelay.comments.find(comment => comment.authorName === reelayDBUser?.username);
	const likedByUser = reelay.likes.find(like => like.username === reelayDBUser?.username);

	const onCommentLongPress = async () => {
		if (showMeSignupIfGuest()) return;
		setCommentsVisible(true);
	}
	const onCommentPress = async () => {
		if (showMeSignupIfGuest()) return;
		setCommentsVisible(true);
	}
	const onDotMenuPress = async () => {
		if (showMeSignupIfGuest()) return;
		setDotMenuVisible(true);
	}
	const onLikeLongPress = async () => {
		if (showMeSignupIfGuest()) return;
		setLikesVisible(true);
	}

	const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			setJustShowMeSignupVisible(true);
			return true;
		}
		return false;
	}

	const onLikePress = async () => {
		if (showMeSignupIfGuest()) return;

		if (likedByUser) {
			const unlikeBody = {
				creatorName: reelay.creator.username,
				username: reelayDBUser?.username,
				reelaySub: reelay.sub,
			}
			reelay.likes = reelay.likes.filter(likes => likes.username !== reelayDBUser?.username);
		
			const postResult = await removeLike(unlikeBody, reelay.sub);
			console.log(postResult);
			
			setLikeUpdateCounter(likeUpdateCounter + 1);
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
			const likeBody = {
				creatorName: reelay.creator.username,
				username: reelayDBUser?.username,
				postedAt: new Date().toISOString(),
			}
			reelay.likes.push(likeBody);		

			const postResult = await postLikeToDB(likeBody, reelay.sub);
			console.log(postResult);

			setLikeUpdateCounter(likeUpdateCounter + 1);
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

	const IconDropShadowStyle = {
		shadowColor: "black",
		shadowOpacity: 0.2,
		shadowRadius: 2,
		shadowOffset: {
			width: 0, // These can't both be 0
			height: 1, // i.e. the shadow has to be offset in some way
		},
	}

	return (
		<SidebarView>
			<ButtonContainer>
				<SidebarButton 
					onPress={onLikePress} 
					onLongPress={onLikeLongPress}>
					<Icon
						type="ionicon"
						name="heart"
						color={likedByUser ? ReelayColors.reelayRed : "white"}
						iconStyle={IconDropShadowStyle}
						size={ICON_SIZE}
					/>
				</SidebarButton>
				<Count>{reelay.likes.length}</Count>
			</ButtonContainer>

			<ButtonContainer>
				<SidebarButton 
					addHighlight={commentedByUser}
					onPress={onCommentPress} 
					onLongPress={onCommentLongPress}>
					<Icon
						type="ionicon"
						name="chatbubble-ellipses"
						color={'white'}
						iconStyle={IconDropShadowStyle}
						size={ICON_SIZE}
					/>
				</SidebarButton>
				<Count>{reelay.comments.length}</Count>
			</ButtonContainer>

			<ButtonContainer>
				<SidebarButton>
					<SendRecButton navigation={navigation} titleObj={reelay.title} reelay={reelay} />
				</SidebarButton>
				<Count>{''}</Count>
			</ButtonContainer>

			<ButtonContainer>
				<SidebarButton onPress={onDotMenuPress}>
					<Icon 
						type='ionicon' 
						name={'ellipsis-horizontal'} 
						color={'white'} 
						iconStyle={IconDropShadowStyle}
						size={DOT_ICON_SIZE} 
					/>
				</SidebarButton>
			</ButtonContainer>
		</SidebarView>
	);
}