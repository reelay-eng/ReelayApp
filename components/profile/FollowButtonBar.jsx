    import React, { useContext, useState, useEffect } from "react";
    import { View, Pressable, Text } from "react-native";
    import styled from "styled-components/native";
    import ReelayColors from "../../constants/ReelayColors";
    import { AuthContext } from "../../context/AuthContext";
    import { followCreator, unfollowCreator } from "../../api/ReelayDBApi";

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

        console.log("followers", followers);

    const [alreadyFollow, setAlreadyFollow] = useState(false);
    const { 
        reelayDBUser,
        following,
        setFollowing,
    } = useContext(AuthContext);

    const creatorSub = creator.sub;
    const userSub = reelayDBUser.sub;
    // check if current user is already following creator
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
        // if (alreadyFollow) {
        //     setAlreadyFollow(false);
        // }
    };

    // ON PRESS:

    const followUser = async () => {
        const followResult = await followCreator(creatorSub, userSub);
        // const { error, requestStatus } = followResult;
        const isFollowing = !followResult?.error && !followResult?.requestStatus;
        console.log('follow result: ', followResult);
        
        if (isFollowing) {
            setFollowers([...followers, followResult]);
            setFollowing([...following, followResult]);
            setAlreadyFollow(true);
        } else {
        // handle error
        }

        Amplitude.logEventWithPropertiesAsync("followedUser", {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });

        console.log(reelayDBUser.username + " followed " + creator.username);
    };

    const unfollowUser = async () => {
        const unfollowResult = await unfollowCreator(creatorSub, userSub);
        console.log(reelayDBUser.username + " unfollowed " + creator.username);
        // checkAlreadyFollow();
        const unfollowSucceeded = !unfollowResult?.error;
        if (unfollowSucceeded) {
        const nextFollowers = followers.filter((followObj) => {
            return followObj.followerSub !== userSub;
        });
        setFollowers(nextFollowers);
        
        const nextFollowing = following.filter((followObj) => {
            return followObj.creatorSub !== creatorSub;
        })
        setFollowing(nextFollowing);
        setAlreadyFollow(false);
        } else {
        // handle error
        }

        Amplitude.logEventWithPropertiesAsync("unfollowedUser", {
            username: reelayDBUser.username,
            creatorName: creator.username,
        });

    };

    // if the person already follows, then it should say following
    return (
        <FollowContainer>
        {!alreadyFollow && (
            <FollowButton onPress={followUser}>
            <FollowText>{"Follow"}</FollowText>
            </FollowButton>
        )}
        {alreadyFollow && (
            <FollowButton onPress={unfollowUser}>
            <FollowText>{"Following"}</FollowText>
            </FollowButton>
        )}
        </FollowContainer>
    );
    };
