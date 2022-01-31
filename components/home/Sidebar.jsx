import React, { useContext, useState, useEffect, useRef } from 'react';
import { Dimensions, Pressable, Image, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from "../../components/global/Text";
import styled from 'styled-components/native';

import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';

import { sendLikeNotification } from '../../api/NotificationsApi';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { postLikeToDB, removeLike, getRegisteredUser } from '../../api/ReelayDBApi';

import ReelayIcon from "../../assets/icons/reelay-icon.png";

const { height, width } = Dimensions.get('window');
// <ProfilePicture source={profileImageSource} defaultSource={ReelayIcon}/>
const ICON_SIZE = 36;

const SidebarButton = styled(Pressable)`
	align-items: center;
	justify-content: center;
	margin: 10px;
`
const Count = styled(ReelayText.Subtitle1)`
	color: #fff;
	text-shadow-color: rgba(0, 0, 0, 0.2);
	text-shadow-offset: 1px 1px;
	text-shadow-radius: 1px;
`

export default Sidebar = ({ reelay }) => {
	const SidebarView = styled(View)`
		align-items: center;
		align-self: flex-end;
		justify-content: center;
		position: absolute;
		bottom: ${height / 3}px;
	`
	
	return (
		<SidebarView>
			<ProfilePicture reelay={reelay} />
			<LikeButton reelay={reelay} />
			<CommentButton reelay={reelay} />
			<DotMenuButton />
		</SidebarView>
	);
}

const ProfilePicture = ({ reelay }) => {
	const ProfilePicture = styled(Image)`
        border-radius: 48px;
        height: 36px;
        width: 36px;
    `
	const ProfilePictureContainer = styled(Pressable)`
		align-items: center;
		justify-content: center;
        border-color: white;
        border-radius: 50px;
        border-width: 2px;
        margin: 16px;
		margin-bottom: 25px;
        height: 40px;
        width: 40px;
    `

	const [profilePicSource, setProfilePicSource] = useState();

	useEffect(() => {
		setCreatorProfilePicture();
	}, []);

	const setCreatorProfilePicture = async () => {
		const creator = await getRegisteredUser(reelay.creator.sub);
		const profilePicSource =  { uri: creator.profilePictureURI } ?? ReelayIcon;
		setProfilePicSource(profilePicSource);
	}
	return (
		<ProfilePictureContainer>
			<ProfilePicture source={profilePicSource} defaultSource={ReelayIcon}/>
		</ProfilePictureContainer>
	)
}

const LikeButton = ({ reelay }) => {
	const [likeUpdateCounter, setLikeUpdateCounter] = useState(0);

	const { cognitoUser } = useContext(AuthContext);
	const { setLikesVisible } = useContext(FeedContext);

	const likedByUser = reelay.likes.find(like => like.username === cognitoUser.username);

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
	</SidebarButton>)
}

const CommentButton = ({ reelay }) => {
	const { cognitoUser } = useContext(AuthContext);
	const { setCommentsVisible} = useContext(FeedContext);

	const commentedByUser = reelay.comments.find((comment) => comment.authorName === cognitoUser.username);

	const onCommentLongPress = async () => setCommentsVisible(true);
	const onCommentPress = async () => setCommentsVisible(true);

	return (
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
	);
}

const DotMenuButton = () => {
	const onDotMenuPress = async () => setDotMenuVisible(true);

	const { setDotMenuVisible } = useContext(FeedContext);

	return (
		<SidebarButton onPress={onDotMenuPress}>
			<Icon type='ionicon' name={'ellipsis-horizontal'} color={'white'} size={24} />
		</SidebarButton>
	)
}