import React, { useContext, useEffect, useState } from "react";
import { Dimensions, Modal, View, Image, Pressable, SafeAreaView, Alert } from "react-native";
import { FeedContext } from "../../context/FeedContext";
import styled from "styled-components/native";
import ReelayIcon from "../../assets/icons/reelay-icon.png";
import * as ReelayText from "../global/Text";
import ReelayColors from "../../constants/ReelayColors";
import { HeaderDoneCancel } from '../global/Headers';
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";

const { height, width } = Dimensions.get("window");

const Spacer = styled(View)`
	height: ${(props) => (props.height ? props.height : "0px")};
`;

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
						onCancel={cancelFunc}
						text="Edit Profile"
					/>
					<EditProfileImage />
				</EditProfileContainer>
			</Modal>
		</ModalContainer>
	);
};

const EditProfileImage = () => {
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    
    const startEditPhoto = () => {
        setIsEditingPhoto(true);
    }
	const Container = styled(View)`
		width: 100%;
		padding-top: 20px;
		padding-bottom: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	`;
	const EditContainer = styled(View)`
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
		margin-bottom: 5px;
	`;
	const ProfileText = styled(ReelayText.Body2Bold)`
		color: rgba(0, 165, 253, 1);
		text-align: center;
        padding: 5px;
	`;
    

    return (
		<Container>
			<EditContainer>
				<Pressable onPress={startEditPhoto}>
					<ProfileImage source={ReelayIcon} />
				</Pressable>
				<Pressable onPress={startEditPhoto}>
					<ProfileText>Change Profile Photo</ProfileText>
				</Pressable>
			</EditContainer>
			<EditingPhotoMenuModal
				visible={isEditingPhoto}
				close={() => {
					setIsEditingPhoto(false);
				}}
			/>
		</Container>
	);
};

const EditingPhotoMenuModal = ({ visible, close }) => {

    const [image, setImage] = useState(null);
	const [percentage, setPercentage] = useState(0);

    const takePhoto = async () => {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== "granted") {
            alert("Please enable your camera permissions to take a photo.");
            return;
        }
		let result = await ImagePicker.launchCameraAsync({
			mediaTypes: "Images",
			aspect: [4, 3],
		});
		handleImagePicked(result);
	};

    const choosePhoto = async () => {
		const cameraRollStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraRollStatus.status !== "granted") {
            alert("Please enable your camera roll permissions to select a photo.");
            return;
        }
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: "Images",
			aspect: [4, 3],
			quality: 1,
		});

		handleImagePicked(result);
	};;

	handleImagePicked = async (pickerResult) => {
        try {
            console.log(pickerResult);
			if (pickerResult.cancelled) {
				alert("Upload cancelled");
				return;
			} else {
				setPercentage(0);
                const img = await fetchImageFromUri(pickerResult.uri);
			}
		} catch (e) {
			console.log(e);
			alert("Upload failed");
		}
	};

	const fetchImageFromUri = async (uri) => {
		const response = await fetch(uri);
		const blob = await response.blob();
		return blob;
    };
    
    const ModalContainer = styled(View)`
		position: absolute;
	`;
    const MenuContainer = styled(View)`
        background: transparent;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: auto;
        margin-bottom: 40px;
    `
    const MenuOptionsContainer = styled(View)`
        width: 90%;
        background-color: #2D2D2D;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
    `
    const MenuOption = ({onPress, children}) => {
        const MenuOptionComponent = styled(Pressable)`
			width: 100%;
			height: 60px;
			justify-content: center;
			align-items: center;
			border-radius: 20px;
		`;
        return (
            <MenuOptionComponent style={({ pressed }) => [
								{ backgroundColor: pressed ? "#292929" : "#2D2D2D" },
            ]} onPress={onPress}>
                {children}
            </MenuOptionComponent>
        )
    }
    
    const MenuOptionText = styled(ReelayText.Body1)`
        color: ${ReelayColors.reelayBlue};
        text-align: center;
    `
    const Backdrop = styled(Pressable)`
		background-color: transparent;
		height: 100%;
		position: absolute;
		width: 100%;
	`;
    return (
		<ModalContainer>
			<Modal animationType="slide" transparent={true} visible={visible}>
				<Backdrop onPress={close} />
				<MenuContainer>
					<MenuOptionsContainer>
						<MenuOption onPress={choosePhoto}>
							<MenuOptionText>Choose Photo</MenuOptionText>
						</MenuOption>
						<MenuOption onPress={takePhoto}>
							<MenuOptionText>Take Photo</MenuOptionText>
						</MenuOption>
					</MenuOptionsContainer>
					<Spacer height="10px" />
					<MenuOptionsContainer>
						<MenuOption onPress={close}>
							<MenuOptionText>Cancel</MenuOptionText>
						</MenuOption>
					</MenuOptionsContainer>
				</MenuContainer>
			</Modal>
		</ModalContainer>
	);
}
