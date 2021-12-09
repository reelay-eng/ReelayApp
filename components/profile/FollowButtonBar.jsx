    import React, { useContext, useState, useEffect } from 'react';
    import { View, Pressable, Text } from 'react-native';
    import styled from 'styled-components/native';
    import ReelayColors from '../../constants/ReelayColors';
    import { AuthContext } from '../../context/AuthContext';
    import { followCreator, unfollowCreator } from '../../api/ReelayDBApi';

    import { logEventWithPropertiesAsync } from 'expo-analytics-amplitude';

    export default FollowButtonBar = ({ creator, followers, setFollowers }) => {
    const FollowContainer = styled(View)`
        align-self: center;
        flex-direction: row;
        margin-top: 10px;
        margin-bottom: 20px;
    `;
    const FollowButton = styled(Pressable)`
        align-items: center;
        align-self: center;
        background-color: ${ReelayColors.reelayRed};
        border-radius: 36px;
        justify-content: center;
        height: 50px;
        width: 75%;
    `;
    const FollowText = styled(Text)`
        color: white;
        font-size: 18px;
        font-weight: bold;
        line-height: 21px;
    `;

    const [alreadyFollow, setAlreadyFollow] = useState(false);
    const { reelayDBUser, following, setFollowing } = useContext(AuthContext);

    const creatorSub = creator.sub;
    const userSub = reelayDBUser.sub;

    useEffect(() => {
        checkAlreadyFollow();
    }, []);

    const checkAlreadyFollow = () => {
        try {
            for (let i = 0; i < followers.length; i++) {
                const userInFollowList = followers[i].followerSub === userSub;
                if (!alreadyFollow && userInFollowList) {
                    setAlreadyFollow(true);
                    return true;
                }
            }
        } catch (error) {
        console.log(error);
        }
    };

    // ON PRESS:

    const followUser = async () => {
        const followResult = await followCreator(creatorSub, userSub);
        const isFollowing = !followResult?.error && !followResult?.requestStatus;
        console.log('follow result: ', followResult);
        
        if (isFollowing) {
            setFollowers([...followers, followResult]);
            setFollowing([...following, followResult]);
            setAlreadyFollow(true);
        } else {
        // handle error
        }

        logEventWithPropertiesAsync('followedUser', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });

        console.log(reelayDBUser.username + ' followed ' + creator.username);
    };

    const unfollowUser = async () => {
        const unfollowResult = await unfollowCreator(creatorSub, userSub);
        const unfollowSucceeded = !unfollowResult?.error;

        if (unfollowSucceeded) {
            const nextFollowers = followers.filter((followObj) => {
                return followObj.followerSub !== userSub;
            });
            
            const nextFollowing = following.filter((followObj) => {
                return followObj.creatorSub !== creatorSub;
            });
            
            setFollowers(nextFollowers);
            setFollowing(nextFollowing);
            setAlreadyFollow(false);
        } else {
        // handle error
        }

        logEventWithPropertiesAsync('unfollowedUser', {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });
    };

    // if the person already follows, then it should say following
    return (
        <FollowContainer>
            {!alreadyFollow && (
                <FollowButton onPress={followUser}>
                <FollowText>{'Follow'}</FollowText>
                </FollowButton>
            )}
            {alreadyFollow && (
                <FollowButton onPress={unfollowUser}>
                <FollowText>{'Following'}</FollowText>
                </FollowButton>
            )}
        </FollowContainer>
    );
};
