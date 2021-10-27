import React, { useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import { sendLikeNotification } from '../../api/NotificationsApi';
import * as Amplitude from 'expo-analytics-amplitude';

import { addLike, deleteLike } from '../../api/ReelayApi';

export default Sidebar = ({ reelay }) => {
	const ICON_SIZE = 40;
	const Count = styled(Text)`
		color: #fff;
		font-size: 18px;
		font-weight: bold;
		`
	const SidebarView = styled(View)`
		align-items: flex-end;
		height: 100%;
		justify-content: center;
		width: 20%;
	`
	const SidebarButton = styled(Pressable)`
		align-items: center;
		justify-content: center;
		margin: 10px;
	`
	const [likeUpdateCounter, setLikeUpdateCounter] = useState(0);

	const { user } = useContext(AuthContext);
	const { setCommentsVisible, setLikesVisible } = useContext(FeedContext);

	const commentedByUser = reelay.comments.find(comment => comment.authorName === user.username);
	const likedByUser = reelay.likes.find(like => like.username === user.username);

	const onCommentLongPress = async () => setCommentsVisible(true);
	const onCommentPress = async () => setCommentsVisible(true);
	const onLikeLongPress = async () => setLikesVisible(true);

	const onLikePress = async () => {
		if (likedByUser) {
			await deleteLike(reelay, user);
			setLikeUpdateCounter(likeUpdateCounter + 1);
			Amplitude.logEventWithPropertiesAsync('unlikedReelay', {
				user: user.username,
				creator: reelay.creator.username,
				title: reelay.title.display,
				reelayID: reelay.id,
			});
		} else {
			await addLike(reelay, user);
			setLikeUpdateCounter(likeUpdateCounter + 1);
			sendLikeNotification({ 
				creatorSub: reelay.creator.sub,
				user: user,
				reelay: reelay,
			});
			Amplitude.logEventWithPropertiesAsync('likedReelay', {
				user: user.username,
				creator: reelay.creator.username,
				title: reelay.title.display,
				reelayID: reelay.id,
			});
		}
	}

	return (
		<SidebarView>
			<SidebarButton onPress={onLikePress} onLongPress={onLikeLongPress}>
				<Icon type='ionicon' name='heart' color={likedByUser ? '#db1f2e' : 'white'} size={ICON_SIZE} />
				<Count>{reelay.likes.length}</Count>
			</SidebarButton>
			<SidebarButton onPress={onCommentPress} onLongPress={onCommentLongPress}>
				<Icon type='ionicon' name='chatbubble-ellipses' color={ commentedByUser ? '#db1f2e' :'white' } size={ICON_SIZE} />
				<Count>{reelay.comments.length}</Count>
			</SidebarButton>
		</SidebarView>
	);
}