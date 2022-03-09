import React, { useContext, useState } from 'react';
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

const { height, width } = Dimensions.get('window');

export default Sidebar = ({ navigation, reelay }) => {
	const ICON_SIZE = 21;
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
		bottom: ${height / 8}px;
	`
	const SidebarButton = styled(Pressable)`
		align-items: center;
		background: rgba(255, 255, 255, 0.35);
		border-radius: 50px;
		height: 40px;
		justify-content: center;
		margin-top: 8px;
		width: 40px;
	`
	const ButtonContainer = styled(View)`
		align-items: center;
		margin-right: 10px;
	`
	const [likeUpdateCounter, setLikeUpdateCounter] = useState(0);

	const { cognitoUser } = useContext(AuthContext);
	const { setCommentsVisible, setLikesVisible, setDotMenuVisible } = useContext(FeedContext);

	const isMyReelay = reelay.creator.sub === cognitoUser?.attributes?.sub;
	const commentedByUser = reelay.comments.find(comment => comment.authorName === cognitoUser.username);
	const likedByUser = reelay.likes.find(like => like.username === cognitoUser.username);

	const onCommentLongPress = async () => setCommentsVisible(true);
	const onCommentPress = async () => setCommentsVisible(true);
	const onDotMenuPress = async () => setDotMenuVisible(true);
	const onLikeLongPress = async () => setLikesVisible(true);

	const onLikePress = async () => {
		if (likedByUser) {
			const unlikeBody = {
				creatorName: reelay.creator.username,
				username: cognitoUser.username,
				reelaySub: reelay.sub,
			}
			reelay.likes = reelay.likes.filter(likes => likes.username !== cognitoUser.username);
		
			const postResult = await removeLike(unlikeBody, reelay.sub);
			console.log(postResult);
			
			setLikeUpdateCounter(likeUpdateCounter + 1);
			logAmplitudeEventProd('unlikedReelay', {
				user: cognitoUser.username,
				creator: reelay.creator.username,
				title: reelay.title.display,
				reelayID: reelay.id,
			});
			console.log('unlikedReelay', {
				user: cognitoUser.username,
				creator: reelay.creator.username,
				title: reelay.title.display,
				reelayID: reelay.id,
			});
		} else {
			const likeBody = {
				creatorName: reelay.creator.username,
				username: cognitoUser.username,
				postedAt: new Date().toISOString(),
			}
			reelay.likes.push(likeBody);		

			const postResult = await postLikeToDB(likeBody, reelay.sub);
			console.log(postResult);

			setLikeUpdateCounter(likeUpdateCounter + 1);
			notifyCreatorOnLike({ 
				creatorSub: reelay.creator.sub,
				user: cognitoUser,
				reelay: reelay,
			});
			logAmplitudeEventProd('likedReelay', {
				user: cognitoUser.username,
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
				<SidebarButton onPress={onLikePress} onLongPress={onLikeLongPress}>
					<Icon
						type="ionicon"
						name="heart"
						color={likedByUser ? "#db1f2e" : "white"}
						iconStyle={IconDropShadowStyle}
						size={ICON_SIZE}
					/>
				</SidebarButton>
				<Count>{reelay.likes.length}</Count>
			</ButtonContainer>

			<ButtonContainer>
				<SidebarButton onPress={onCommentPress} onLongPress={onCommentLongPress}>
					<Icon
						type="ionicon"
						name="chatbubble-ellipses"
						color={commentedByUser ? "#db1f2e" : "white"}
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
				<Count>{" "}</Count>
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