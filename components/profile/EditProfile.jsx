import React, { useContext, useEffect, useState, useRef } from "react";
import { Dimensions, Modal, View, Image, Pressable, SafeAreaView, Alert } from "react-native";

// Expo imports
import * as ImagePicker from "expo-image-picker";
import { EncodingType, readAsStringAsync, writeAsStringAsync } from "expo-file-system";
import Constants from 'expo-constants';
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

// Upload imports
import { Buffer } from "buffer";
import {
	PutObjectCommand,
} from "@aws-sdk/client-s3";

// DB
import { updateProfilePic } from "../../api/ReelayDBApi";

// Context
import { FeedContext } from "../../context/FeedContext";
import { AuthContext } from "../../context/AuthContext";
import { UploadContext } from "../../context/UploadContext";

// Styling
import styled from "styled-components/native";
import ReelayColors from "../../constants/ReelayColors";

import ReelayIcon from "../../assets/icons/reelay-icon.png";
import * as ReelayText from "../global/Text";
import { HeaderDoneCancel } from '../global/Headers';
import { logAmplitudeEventProd } from "../utils/EventLogger";





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
	const [isUploading, setIsUploading] = useState(false);
	const { reelayDBUser } = useContext(AuthContext);

	const profilePictureURI = reelayDBUser?.profilePictureURI;
	
	
	const startEditPhoto = () => {
        if (!isUploading) setIsEditingPhoto(true);
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
		color: ${({isUploading}) => isUploading ? "#4D4D4D" : "rgba(0, 165, 253, 1)"};
		text-align: center;
		padding: 5px;
	`;

	const profileImageSource =
		profilePictureURI && profilePictureURI !== undefined && profilePictureURI !== "none"
			? { uri: profilePictureURI }
			: ReelayIcon;
    
    return (
		<Container>
			<EditContainer>
				<Pressable onPress={startEditPhoto}>
					<ProfileImage source={profileImageSource} />
				</Pressable>
				<Pressable onPress={startEditPhoto}>
					<ProfileText isUploading={isUploading}>
						{isUploading ? "Uploading..." : "Change Profile Photo"}
					</ProfileText>
				</Pressable>
			</EditContainer>
			<EditingPhotoMenuModal
				visible={isEditingPhoto}
				setIsUploading={setIsUploading}
				close={() => {
					setIsEditingPhoto(false);
				}}
			/>
		</Container>
	);
};

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const REELAY_API_BASE_URL = Constants.manifest.extra.reelayApiBaseUrl;
const REELAY_API_KEY = Constants.manifest.extra.reelayApiKey;

const REELAY_API_HEADERS = {
	Accept: "application/json",
	"Accept-encoding": "gzip, deflate",
	"Content-Type": "application/json",
	reelayapikey: REELAY_API_KEY,
};

const EditingPhotoMenuModal = ({ visible, close, setIsUploading }) => {

	const { cognitoUser } = useContext(AuthContext);
	const { reelayDBUser, setReelayDBUser } = useContext(AuthContext);
	const { s3Client } = useContext(UploadContext);

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
		logAmplitudeEventProd("profilePhotoUpdatedCamera", {
			username: cognitoUser.username,
		});
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
	};

	handleImagePicked = async (pickerResult) => {
        try {
			if (pickerResult.cancelled) {
				return;
			} else {
				setIsUploading(true);
				close();
				const { cloudfrontPhotoURI } = await uploadProfilePhotoToS3(pickerResult.uri);
				if (reelayDBUser?.profilePictureURI !== cloudfrontPhotoURI) {
					const patchResult = await updateProfilePic(cognitoUser?.attributes?.sub, cloudfrontPhotoURI);
					console.log("Patched Profile Image: ", patchResult);
					logAmplitudeEventProd("profilePhotoUpdatedCameraroll", {
						"Profile Photo Updated": "Profile Photo Updated",
					});
					let newReelayDBUser = reelayDBUser;
					newReelayDBUser.profilePictureURI = cloudfrontPhotoURI;
					setReelayDBUser(newReelayDBUser);
				}
				setIsUploading(false);
			}
		} catch (e) {
			console.log("Upload Profile Picture Error: ", e);
			logAmplitudeEventProd	("uploadProfilePictureError", {
				error: e,
				cognitoUser: cognitoUser,
				reelayDBUser: reelayDBUser,
			});
			setIsUploading(false);
			alert("Profile photo upload failed. \nPlease try again.");
		}
	};

	const resizeImage = async (photoURI) => {
		const photoHeight = 256;
		const compression = 1 // 0 is most compressed, 1 is not compressed
		const resizeResult = await manipulateAsync(
			photoURI,
			[{ resize: {height: photoHeight} }],
			{ compress: compression, base64: true }
		);
		return resizeResult;
	}

	const uploadProfilePhotoToS3 = async (photoURI) => {
		const uploadTimestamp = Date.now();
		const resizedPhoto = await resizeImage(photoURI);
		const resizedPhotoURI = resizedPhoto.base64;
		const photoTimestampedS3Key = `profilepic-${cognitoUser?.attributes?.sub}-${uploadTimestamp}.jpg`;
		const photoCurrentS3Key = `profilepic-${cognitoUser?.attributes?.sub}-current.jpg`;
		const { timestampedUploadResult, currentUploadResult } = await uploadProfilePicToS3(
			resizedPhotoURI,
			`public/${photoTimestampedS3Key}`,
			`public/${photoCurrentS3Key}`
		);
		console.log("S3 Timestamped Profile Picture Upload Result: ", timestampedUploadResult);
		console.log("S3 Current Profile Picture Upload Result: ", currentUploadResult);

		const currentPhotoURI = `${CLOUDFRONT_BASE_URL}/public/${photoCurrentS3Key}`;
		console.log("user current photo URI: ", currentPhotoURI);
		const timestampedPhotoURI = `${CLOUDFRONT_BASE_URL}/public/${photoTimestampedS3Key}`;

		return {
			timestampedUploadResult,
			currentUploadResult,
			cloudfrontPhotoURI: currentPhotoURI,
		};
	};

	const uploadProfilePicToS3 = async (photoURI, timestampedS3Key, currentS3Key) => {
		// const photoStr = await writeAsStringAsync(photoURI, { encoding: EncodingType.Base64 });
		const photoBuffer = Buffer.from(photoURI, "base64");
		const timestampedUploadResult = await s3Client.send(
			new PutObjectCommand({
				Bucket: S3_UPLOAD_BUCKET,
				Key: timestampedS3Key,
				ContentType: "image/jpg",
				Body: photoBuffer,
			})
		);
		const currentUploadResult = await s3Client.send(
			new PutObjectCommand({
				Bucket: S3_UPLOAD_BUCKET,
				Key: currentS3Key,
				ContentType: "image/jpg",
				CacheControl: "no-cache",
				Body: photoBuffer,
			})
		);
		return {timestampedUploadResult, currentUploadResult};
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
    
    const MenuOptionText = styled(ReelayText.H6)`
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
