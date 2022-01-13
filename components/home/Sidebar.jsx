import React, { useContext, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from "../../components/global/Text";
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import { sendLikeNotification } from '../../api/NotificationsApi';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { postLikeToDB, removeLike } from '../../api/ReelayDBApi';

const { height, width } = Dimensions.get('window');

export default Sidebar = ({ reelay }) => {
	const ICON_SIZE = 36;
	const Count = styled(ReelayText.Subtitle1)`
		color: #fff;
		text-shadow-color: rgba(0, 0, 0, 0.2);
		text-shadow-offset: 1px 1px;
		text-shadow-radius: 1px;
	`
	const SidebarView = styled(View)`
		align-items: flex-end;
		align-self: flex-end;
		justify-content: center;
		position: absolute;
		bottom: ${height / 3}px;
	`
	const SidebarButton = styled(Pressable)`
		align-items: center;
		justify-content: center;
		margin: 10px;
	`
	const [likeUpdateCounter, setLikeUpdateCounter] = useState(0);

	const { cognitoUser } = useContext(AuthContext);
	const { setCommentsVisible, setLikesVisible } = useContext(FeedContext);

	const commentedByUser = reelay.comments.find(comment => comment.authorName === cognitoUser.username);
	const likedByUser = reelay.likes.find(like => like.username === cognitoUser.username);

	const onCommentLongPress = async () => setCommentsVisible(true);
	const onCommentPress = async () => setCommentsVisible(true);
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
			sendLikeNotification({ 
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

	return (
		<SidebarView>
			<SidebarButton onPress={onLikePress} onLongPress={onLikeLongPress}>
				<Icon
					type="ionicon"
					name="heart"
					color={likedByUser ? "#db1f2e" : "white"}
					iconStyle={{
						shadowColor: "black",
						shadowOpacity: 0.2,
						shadowRadius: 2,
						shadowOffset: {
							width: 0, // These can't both be 0
							height: 1, // i.e. the shadow has to be offset in some way
						},
					}}
					size={ICON_SIZE}
				/>
				<Count>{reelay.likes.length}</Count>
			</SidebarButton>
			<SidebarButton onPress={onCommentPress} onLongPress={onCommentLongPress}>
				<Icon
					type="ionicon"
					name="chatbubble-ellipses"
					color={commentedByUser ? "#db1f2e" : "white"}
					iconStyle={{
						shadowColor: "black",
						shadowOpacity: 0.25,
						shadowRadius: 2,
						shadowOffset: {
							width: 0, // These can't both be 0
							height: 1, // i.e. the shadow has to be offset in some way
						},
					}}
					size={ICON_SIZE}
				/>
				<Count>{reelay.comments.length}</Count>
			</SidebarButton>
		</SidebarView>
	);
}