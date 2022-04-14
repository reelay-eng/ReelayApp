import React, { useContext } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "react-native-elements";
import styled from "styled-components/native";
import FollowButton from '../global/FollowButton';
import * as ReelayText from '../../components/global/Text';

import { AuthContext } from "../../context/AuthContext";
import { logAmplitudeEventProd } from "../utils/EventLogger";

const PressableContainer = styled(Pressable)`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    height: 60px;
    width: 100%;
`;
const RowContainer = styled(View)`
	display: flex;
	align-items: center;
	flex-direction: row;
	height: 100%;
	width: 95%;
`;
const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
    color: white
`
const UsernameContainer = styled.View`
    align-items: flex-start;
    justify-content: center;
    flex: 0.6;
`;
const ProfilePicture = styled(Image)`
    border-radius: 16px;
    border-width: 1px;
    border-color: white;
    height: 32px;
    width: 32px;
`
const ProfilePictureContainer = styled(View)`
    margin: 10px;
    flex: 0.1;
`

const FollowButtonFlexContainer = styled(View)`
    flex: 0.3;
`

export default UserSearchResultItem = ({
    result,
    navigation
}) => {
    const { reelayDBUser } = useContext(AuthContext);
    const searchedUser = result;
    const profilePictureURI = searchedUser.profilePictureURI;

    const username = searchedUser.username;
    const userSub = searchedUser.sub; // sub is the user's unique id

    const followButtonCreatorObj = {
        sub: userSub,
        username: username,
    }

    const selectResult = () => {
        navigation.push("UserProfileScreen", { creator: searchedUser });
        logAmplitudeEventProd('selectSearchResult', {
            username: reelayDBUser?.username,
            selectedUsername: searchedUser.username,
            source: 'search',
        }); 
    };

    const myUserSub = reelayDBUser.sub;
    const isMyProfile = myUserSub === userSub;

    return (
		<PressableContainer onPress={selectResult}>
			<RowContainer>
				<ProfilePictureContainer>
					{profilePictureURI && (
						<ProfilePicture
							source={{ uri: profilePictureURI }}
							PlaceholderContent={<ActivityIndicator />}
						/>
					)}
					{!profilePictureURI && (
						<ProfilePicture source={require("../../assets/icons/reelay-icon-with-dog-black.png")} />
					)}
				</ProfilePictureContainer>
				<UsernameContainer>
					<UsernameText>{username}</UsernameText>
				</UsernameContainer>

				{ !isMyProfile && (
                    <FollowButtonFlexContainer>
					    <FollowButton creator={followButtonCreatorObj} />
				    </FollowButtonFlexContainer>
                )}
			</RowContainer>
		</PressableContainer>
	);
};
