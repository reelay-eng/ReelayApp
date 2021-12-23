import React, { useContext, useEffect } from "react";
import { Modal, View, Text, Image, Pressable, SafeAreaView } from "react-native";
import { FeedContext } from "../../context/FeedContext";
import styled from "styled-components/native";
import ReelayIcon from "../../assets/icons/reelay-icon.png";
import * as ReelayText from "../global/Text";
import ReelayColors from "../../constants/ReelayColors";
import { HeaderDoneCancel } from '../global/Headers';

export default EditProfile = ({ isEditingProfile, setIsEditingProfile }) => {
    const ModalContainer = styled(View)`
		position: absolute;
	`;
	const { setTabBarVisible } = useContext(FeedContext);
	useEffect(() => {
		setTabBarVisible(false);
		return () => {
			setTabBarVisible(true);
		};
	}, []);
	const EditProfileContainer = styled(SafeAreaView)`
		background-color: black;
		height: 100%;
		width: 100%;
	`;

    const doneFunc = () => {
        setIsEditingProfile(false);
    }

    const cancelFunc = () => {
        setIsEditingProfile(false);
    }

	return (
		<ModalContainer>
			<Modal animationType="slide" transparent={true} visible={isEditingProfile}>
				<EditProfileContainer>
					<HeaderDoneCancel
						withBar
						onDone={doneFunc}
						onCancel={doneFunc}
						text="Edit Profile"
					/>
					<EditProfileImage />
				</EditProfileContainer>
			</Modal>
		</ModalContainer>
	);
};

const EditProfileImage = () => {
	const Container = styled(View)`
		width: 100%;
		padding-top: 20px;
		padding-bottom: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	`;
	const EditContainer = styled(Pressable)`
		display: flex;
		flex-direction: column;
        align-items: center;
	`;
	const ProfileImage = styled(Image)`
		border-radius: 48px;
		height: 96px;
		width: 96px;
		border-width: 2px;
		border-color: white;
		margin-bottom: 10px;
	`;
	const ProfileText = styled(ReelayText.Body2Bold)`
		color: rgba(0, 165, 253, 1);
		text-align: center;
	`;

	return (
		<Container>
			<EditContainer>
				<ProfileImage source={ReelayIcon} />
				<ProfileText>Change Profile Photo</ProfileText>
			</EditContainer>
		</Container>
	);
};
