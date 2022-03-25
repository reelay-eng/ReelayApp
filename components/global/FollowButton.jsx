import React, { useContext, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../global/Text';
import { AuthContext } from '../../context/AuthContext';

import FollowButtonDrawer from './FollowButtonDrawer';
import { followCreator } from '../../api/ReelayDBApi';
import { notifyCreatorOnFollow } from '../../api/NotificationsApi';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { useDispatch, useSelector } from 'react-redux';

export default FollowButton = ({ creator }) => {
	const AlreadyFollowingButtonPressable = styled(Pressable)`
		align-items: center;
		background: rgba(0, 0, 0, 0.36);
		border-color: white;
		border-radius: 8px;
		border-width: 1px;
		justify-content: center;
		flex-direction: row;
		height: 30px;
		width: 90px;
	`
	const FollowButtonContainer = styled(View)``
	const FollowButtonText = styled(ReelayText.CaptionEmphasized)`
		color: white;
	`
	const NotYetFollowingButtonPressable = styled(Pressable)`
		align-items: center;
		background: rgba(41, 119, 239, 0.9);
		border-radius: 8px;
		justify-content: center;
		flex-direction: row;
		height: 30px;
		width: 90px;
	`
    const dispatch = useDispatch();
	const { reelayDBUser } = useContext(AuthContext);
    const myFollowing = useSelector(state => state.myFollowing);
	const isMyProfile = reelayDBUser?.sub === creator?.sub;

	const findFollowUser = (userObj) => (userObj.creatorSub === creator?.sub);
    const alreadyFollowing = myFollowing.find(findFollowUser);
	const [followDrawerOpen, setFollowDrawerOpen] = useState(false);

	const followObj = {
		creatorName: creator?.username,
		creatorSub: creator?.sub,
	}

	const followOnPress = async () => {
		const followResult = await followCreator(creator?.sub, reelayDBUser?.sub);
        const isFollowing = !followResult?.error && !followResult?.requestStatus;
        dispatch({ type: 'setMyFollowing', payload: [...myFollowing, followResult] });
        

        if (!isFollowing) {
            logAmplitudeEventProd('followCreatorError', {
                error: followResult?.error,
                requestStatus: followResult?.requestStatus,
            });
            showErrorToast('Cannot follow creator. Please reach out to the Reelay team.');
            return;
        }

        logAmplitudeEventProd('followedUser', {
            followerName: reelayDBUser?.username,
            followSub: reelayDBUser?.sub
        });

        await notifyCreatorOnFollow({
          creatorSub: creator?.sub,
          follower: reelayDBUser,
        });
	}

	const AlreadyFollowingIcon = () => {
		return (
			<Icon
				type="ionicon"
				name="chevron-down-outline"
				color={"white"}
				size={15}
			/>
		)
	};

	const AlreadyFollowingButton = () => {
		return (
			<AlreadyFollowingButtonPressable onPress={() => { setFollowDrawerOpen(true) }}>
				<FollowButtonText>{'Following'}</FollowButtonText>
				<AlreadyFollowingIcon />
			</AlreadyFollowingButtonPressable>
		);
	}

	const NotYetFollowingButton = () => {
		return (
			<NotYetFollowingButtonPressable onPress={followOnPress}>
				<FollowButtonText>{'Follow'}</FollowButtonText>
			</NotYetFollowingButtonPressable>
		);
	};

	return (
		<FollowButtonContainer>
			{ !alreadyFollowing && !isMyProfile && <NotYetFollowingButton /> }
			{ alreadyFollowing && !isMyProfile && <AlreadyFollowingButton /> }
			{ followDrawerOpen && (
				<FollowButtonDrawer
					drawerOpen={followDrawerOpen}
					setDrawerOpen={setFollowDrawerOpen}
					followObj={followObj}
					sourceScreen={"Feed"}
				/>
			)}
		</FollowButtonContainer>
	);
}