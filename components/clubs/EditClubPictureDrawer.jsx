import React, { useContext, useEffect, useState, useRef } from "react";
import { Modal, View, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../context/AuthContext";
import Constants from 'expo-constants';
import styled from "styled-components/native";
import ReelayColors from "../../constants/ReelayColors";

import * as ReelayText from "../global/Text";
import { logAmplitudeEventProd } from "../utils/EventLogger";
import { showErrorToast } from "../utils/toasts";

import { manipulateAsync } from "expo-image-manipulator";
import { Buffer } from "buffer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { cacheClubPic } from "../../api/ReelayLocalImageCache";

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
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
const Spacer = styled(View)`
	height: 10px;
`
const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;

export default EditClubPictureDrawer = ({ 
	clubID, 
	drawerVisible, 
	setDrawerVisible,
	setUploadingPic,
}) => {
	const { reelayDBUser } = useContext(AuthContext);
	// const [uploadingPic, setUploadingPic] = useState(false);
	const s3Client = useSelector(state => state.s3Client);
	const closeDrawer = () => setDrawerVisible(false);

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

			closeDrawer();
			setUploadingPic(true);
			const uploadResult = await uploadClubPicToS3(clubID, result.uri);
			await cacheClubPic(clubID);
			setUploadingPic(false);
			console.log(uploadResult);
		} catch (error) {
			console.log(error);
			logAmplitudeEventProd('selectClubPhotoError', {
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
				showErrorToast("Please enable your camera permissions to take a photo.");
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

			closeDrawer();
			setUploadingPic(true);
			const uploadResult = await uploadClubPicToS3(clubID, result.uri);
			await cacheClubPic(clubID);
			setUploadingPic(false);
			console.log(uploadResult);
		} catch (error) {
			console.log(error);
			logAmplitudeEventProd('selectClubPhotoError', {
				username: reelayDBUser?.username,
				error,
			})
			showErrorToast("Club photo selection failed. \nPlease try again.");
		}
	};

	const resizeImage = async (photoURI) => {
		const photoHeight = 256;
		const compression = 1 // 0 is most compressed, 1 is not compressed
		const resizeResult = await manipulateAsync(
			photoURI,
			[{ resize: { height: photoHeight }}],
			{ compress: compression, base64: true }
		);
		return resizeResult;
	}

	const uploadClubPicToS3 = async (clubID, photoURI) => {
        const resizedPhoto = await resizeImage(photoURI);
		const resizedPhotoURI = resizedPhoto.base64;
		const photoBuffer = Buffer.from(resizedPhotoURI, "base64");
        const photoS3Key = `public/clubpic-${clubID}.jpg`;
		const uploadResult = await s3Client.send(
			new PutObjectCommand({
				Bucket: S3_UPLOAD_BUCKET,
				Key: photoS3Key,
				ContentType: "image/jpg",
				CacheControl: "no-cache",
				Body: photoBuffer,
			})
		);
        return uploadResult;
	};
    
    const MenuOption = ({onPress, children}) => {
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
			<Modal animationType="slide" transparent={true} visible={drawerVisible}>
				<Backdrop onPress={closeDrawer} />
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
							<MenuOption onPress={closeDrawer}>
								<MenuOptionText>Cancel</MenuOptionText>
							</MenuOption>
						</MenuOptionsContainer>
					</MenuContainer>
			</Modal>
		</ModalContainer>
	);
}