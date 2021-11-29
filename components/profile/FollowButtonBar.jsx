import React, { useContext, useState, useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import styled from "styled-components/native";
import ReelayColors from "../../constants/ReelayColors";
import { AuthContext } from "../../context/AuthContext";
import { followCreator, unfollowCreator, getFollowers } from "../../api/ReelayDBApi";

export default FollowButtonBar = ({ creator }) => {
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
    font-size: 18;
    font-weight: bold;
    line-height: 21px;
  `;
  
    const [followers, setFollowers] = useState([]);

    useEffect(() => {
        loadFollowers();
    }, [alreadyFollow]);

    const loadFollowers = async () => {
        const nextFollowers = await getFollowers(creatorSub);
        setFollowers(nextFollowers);
    };
    
    const [alreadyFollow, setAlreadyFollow] = useState(false);

    const { reelayDBUser } = useContext(AuthContext);

    const creatorSub = creator.sub;
    const followerSub = reelayDBUser.sub;

    // check if current user is already following creator
    useEffect(() => {
        checkAlreadyFollow();
    }, [followers]);

    const checkAlreadyFollow = () => {
        for (let i = 0; i < followers.length; i++) {
            if (followers[i].followerSub === followerSub) {
                setAlreadyFollow(true);
                return true;
            }
        }
        setAlreadyFollow(false);
        console.log("hi");
    }
    
    // ON PRESS:

    const followUser = async () => {
        followCreator(creatorSub, followerSub);
        console.log(reelayDBUser.username + " followed " + creator.username);
        checkAlreadyFollow();
    };

    const unfollowUser = async () => {
        unfollowCreator(creatorSub, followerSub);
        console.log(reelayDBUser.username + " unfollowed " + creator.username);
        checkAlreadyFollow();
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
