import React, { useContext } from 'react';
import { Pressable, View } from 'react-native';
import * as ReelayText from '../global/Text';
import { AuthContext } from '../../context/AuthContext';

import { followCreator, unfollowCreator } from '../../api/ReelayDBApi';
import { notifyCreatorOnFollow } from '../../api/NotificationsApi';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import { useDispatch, useSelector } from 'react-redux';

export default FollowButton = ({ creator, bar=false }) => {
	const Spacer = styled(View)`
		height: ${props => props.height ?? "10px"};
	`
	const AlreadyFollowingButtonPressable = styled(Pressable)`
		align-items: center;
		background: rgba(0, 0, 0, 0.36);
		border-color: white;
		border-radius: ${bar ? "25px" : "8px"};
		border-width: 1px;
		justify-content: center;
		flex-direction: row;
		height: ${bar ? "44px" : "30px"};
		width: ${bar ? "75%" : "90px"};
	`
	const FollowButtonText = styled(ReelayText.CaptionEmphasized)`
		color: white;
	`
	const NotYetFollowingButtonPressable = styled(Pressable)`
		align-items: center;
		background: rgba(41, 119, 239, 0.9);
		border-radius: ${bar ? "25px" : "8px"};
		justify-content: center;
		flex-direction: row;
		height: ${bar ? "44px" : "30px"};
		width: ${bar ? "75%" : "90px"};
	`
    const dispatch = useDispatch();
	const { reelayDBUser } = useContext(AuthContext);
    const myFollowing = useSelector(state => state.myFollowing);
	const isMyProfile = reelayDBUser?.sub === creator?.sub;

	const findFollowUser = (userObj) => (userObj.creatorSub === creator?.sub);
    const alreadyFollowing = myFollowing.find(findFollowUser);

	const showMeSignupIfGuest = () => {
		if (reelayDBUser?.username === 'be_our_guest') {
			dispatch({ type: 'setJustShowMeSignupVisible', payload: true });
			return true;
		}
		return false;
	}

	const followOnPress = async () => {
		if (showMeSignupIfGuest()) return;
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

	const unfollowOnPress = async () => {
        const unfollowResult = await unfollowCreator(creator?.sub, reelayDBUser?.sub);
        console.log('UNFOLLOW RESULT: ', unfollowResult);
        if (unfollowResult && !unfollowResult?.error) {
            removeFollowObjsFromState();
        } else {
            logAmplitudeEventProd('unfollowedCreatorError', {
                creatorName: creator?.username,
                creatorSub: creator?.sub,
                username: reelayDBUser?.username,
                userSub: reelayDBUser?.sub,
            });   
             
            showErrorToast('Cannot unfollow creator. Please reach out to the Reelay team');
            return;
        }
    };

    const removeFollowObjsFromState = () => {
        const removeFromMyFollows = (followObj) => followObj.creatorSub !== creator?.sub;
        const nextMyFollowing = myFollowing.filter(removeFromMyFollows);
        dispatch({ type: 'setMyFollowing', payload: nextMyFollowing });

        logAmplitudeEventProd('unfollowedCreator', {
            creatorName: creator?.username,
			creatorSub: creator?.sub,
            username: reelayDBUser?.username,
            userSub: reelayDBUser?.sub,
        });
    }

	const AlreadyFollowingButton = () => {
		return (
			<AlreadyFollowingButtonPressable onPress={unfollowOnPress}>
				<FollowButtonText>{'Following'}</FollowButtonText>
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
		<>
			{ !alreadyFollowing && !isMyProfile && <NotYetFollowingButton /> }
			{ alreadyFollowing && !isMyProfile && <AlreadyFollowingButton /> }
			{ bar && <Spacer height="20px" />}
		</>
	);
}