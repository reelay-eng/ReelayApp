import React, { useContext, useState } from "react";
import { Modal, View, Image, Pressable } from "react-native";
import ReelayIcon from '../../assets/icons/reelay-icon-with-dog-black.png'

// Expo imports
import * as ImagePicker from "expo-image-picker";

// Context
import { AuthContext } from "../../context/AuthContext";

// Styling
import styled from "styled-components/native";
import ReelayColors from "../../constants/ReelayColors";

import * as ReelayText from "../global/Text";
import { firebaseCrashlyticsError, firebaseCrashlyticsLog, logAmplitudeEventProd } from "../utils/EventLogger";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const ClubImage = styled(Image)`
    border-radius: 80px;
    height: 160px;
	margin-bottom: 5px;
    width: 160px;
`
const DefaultClubImage = styled(LinearGradient)`
	align-items: center;
	border-radius: 80px;
	height: 160px;
	justify-content: center;
	margin-bottom: 5px;
	width: 160px;
`
const EditContainer = styled(View)`
    display: flex;
    flex-direction: column;
    align-items: center;
`
const MenuContainer = styled(View)`
    background: transparent;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: auto;
    margin-bottom: 40px;
`
const MenuOptionComponent = styled(Pressable)`
    width: 100%;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
	padding: 16px;
`
const MenuOptionsContainer = styled(View)`
    width: 90%;
    background-color: #2D2D2D;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
`
const MenuOptionText = styled(ReelayText.H6)`
    color: ${ReelayColors.reelayBlue};
	font-size: 16px;
    text-align: center;
`
const ModalContainer = styled(View)`
    position: absolute;
`
const AddPhotoText = styled(ReelayText.Body2Bold)`
    color: rgba(0, 165, 253, 1);
	font-size: 16px;
    text-align: center;
    padding-top: 8px;
`
const Spacer = styled(View)`
	height: 10px;
`

export default ChooseClubPicture = ({ clubPicSourceRef }) => {
	try {
		firebaseCrashlyticsLog('Choose club picture');
		const [clubPicSource, setClubPicSource] = useState(null);
		const [isEditingPhoto, setIsEditingPhoto] = useState(false);
		const startEditPhoto = () => setIsEditingPhoto(true);

		const addPhotoPromptText = (clubPicSource) ? 'Edit Photo' : 'Add photo (optional)';
		clubPicSourceRef.current = clubPicSource;

		const ClubPicturePreview = () => {
			return (
				<Pressable onPress={startEditPhoto}>
					{!clubPicSource && (
						<DefaultClubImage colors={['#FF4848', '#038AFF']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}>
							<FontAwesomeIcon icon={faCamera} color='white' size={30} />
						</DefaultClubImage>
					)}
					{clubPicSource && <ClubImage source={clubPicSource} />}
				</Pressable>
			);
		}

		return (
			<React.Fragment>
				<EditContainer>
					<ClubPicturePreview />
					<Pressable onPress={startEditPhoto}>
						<AddPhotoText>{addPhotoPromptText}</AddPhotoText>
					</Pressable>
				</EditContainer>
				{isEditingPhoto && <EditingPhotoMenuModal
					close={() => setIsEditingPhoto(false)}
					setClubPicSource={setClubPicSource}
					visible={isEditingPhoto}
				/>}
			</React.Fragment>
		);
	} catch (error) {
		firebaseCrashlyticsError(error);
	}
};

const EditingPhotoMenuModal = ({ visible, close, setClubPicSource }) => {
	try {
		firebaseCrashlyticsLog('Editing photo menu club screen');
		const { reelayDBUser } = useContext(AuthContext);

		const choosePhoto = async () => {
			try {
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
				if (result.cancelled) return;
				setClubPicSource(result);
				close();
			} catch (error) {
				logAmplitudeEventProd('clubPicSelectPhotoError', {
					username: reelayDBUser?.username,
					error,
				})
				alert("Club photo selection failed. \nPlease try again.");
			}
		};

		const takePhoto = async () => {
			try {
				const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
				if (cameraStatus.status !== "granted") {
					alert("Please enable your camera permissions to take a photo.");
					return;
				}
				let result = await ImagePicker.launchCameraAsync({
					mediaTypes: "Images",
					aspect: [4, 3],
				});
				logAmplitudeEventProd("clubPicOpenedCamera", {
					username: reelayDBUser?.username,
				});
				if (result.cancelled) return;
				setClubPicSource(result);
				close();
			} catch (error) {
				logAmplitudeEventProd('clubPicUserCameraError', {
					username: reelayDBUser?.username,
					error,
				})
				alert("Club photo selection failed. \nPlease try again.");
			}
		};

		const MenuOption = ({ onPress, children }) => {
			return (
				<MenuOptionComponent style={({ pressed }) => [
					{ backgroundColor: pressed ? "#292929" : "#2D2D2D" },
				]} onPress={onPress}>
					{children}
				</MenuOptionComponent>
			)
		}

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
						<Spacer />
						<MenuOptionsContainer>
							<MenuOption onPress={close}>
								<MenuOptionText>Cancel</MenuOptionText>
							</MenuOption>
						</MenuOptionsContainer>
					</MenuContainer>
				</Modal>
			</ModalContainer>
		);
	} catch (error) {
		firebaseCrashlyticsError(error);
	}
}