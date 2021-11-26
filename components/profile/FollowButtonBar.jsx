import React, { useContext, useState, useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import styled from "styled-components/native";
import ReelayColors from "../../constants/ReelayColors";
import { AuthContext } from "../../context/AuthContext";
import { followCreator, getFollowers } from "../../api/ReelayDBApi";

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
    const [alreadyFollow, setAlreadyFollow] = useState(false);

    const { reelayDBUser } = useContext(AuthContext);

    const creatorSub = creator.sub;
    const followerSub = reelayDBUser.sub;

    useEffect(() => {
        loadFollowers();
    }, []);

    const loadFollowers = async () => {
        setFollowers(await getFollowers(creatorSub));
    };

    // check if current user is already following creator
    if(
      followers.find((follower) => {
        console.log(follower.followerSub === followerSub)
      })
    ) {
        console.log("followed")
    } else {
        console.log("not follow");
    }
    
    // ON PRESS:

    const followUser = async () => {
        followCreator(creatorSub, followerSub);
        console.log(reelayDBUser.username + " followed " + creator.username);
    };

    const unfollowUser = async () => {
        // unfollowCreator(creatorSub, followerSub);
        console.log(reelayDBUser.username + " unfollowed " + creator.username);
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
