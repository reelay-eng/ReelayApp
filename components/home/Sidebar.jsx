import React, { useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { VisibilityContext } from '../../context/VisibilityContext';

import { 
	addComment, deleteComment,
	addLike, deleteLike,
} from '../../api/ReelayApi';

export default Sidebar = ({ reelay }) => {
	const ICON_SIZE = 54;
	const Count = styled(Text)`
		color: #fff;
		font-size: 18px;
		font-weight: bold;
		letter-spacing: -0.1px;
	`
	const SidebarView = styled(View)`
		align-items: flex-start;
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

	const user = useContext(AuthContext).user;
	const visibilityContext = useContext(VisibilityContext);

	const likedByUser = reelay.likes.find(like => like.userID === user.username) || false;
	
	const onLikePress = async () => {
		if (likedByUser) {
			await deleteLike(reelay, user);
			setLikeUpdateCounter(likeUpdateCounter + 1);
		} else {
			await addLike(reelay, user);
			setLikeUpdateCounter(likeUpdateCounter + 1);
		}
	}

	const onLikeLongPress = async () => {
		console.log('on like long press');
		visibilityContext.setLikesVisible(true);
	}

	return (
		<SidebarView>
			<SidebarButton onPress={onLikePress} onLongPress={onLikeLongPress}>
				<Icon type='ionicon' name='heart' color={likedByUser ? '#b83636' : 'white'} size={ICON_SIZE} />
				<Count>{reelay.likes.length}</Count>
			</SidebarButton>
			<SidebarButton>
				<Icon type='ionicon' name='chatbubble-ellipses' color='white' size={ICON_SIZE} />
				<Count>{reelay.comments.length}</Count>
			</SidebarButton>
		</SidebarView>
	);
}