import React, { useContext, useEffect, useState, useRef } from "react";
import { Dimensions, Modal, View, Image, Pressable, SafeAreaView, TextInput, Keyboard, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";

// Expo imports
import * as ImagePicker from "expo-image-picker";
import Constants from 'expo-constants';
import { manipulateAsync } from "expo-image-manipulator";

// Upload imports
import { Buffer } from "buffer";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { updateProfilePic, updateUserBio, updateUserWebsite } from "../../api/ReelayDBApi";
import { AuthContext } from "../../context/AuthContext";

import styled from "styled-components/native";
import ReelayColors from "../../constants/ReelayColors";
import * as ReelayText from "../global/Text";
import { HeaderDoneCancel } from '../global/Headers';
import { logAmplitudeEventProd } from "../utils/EventLogger";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { showErrorToast, showMessageToast } from "../utils/toasts";
import { cacheProfilePic } from "../../api/ReelayLocalImageCache";
import ProfilePicture from "../global/ProfilePicture";

const Spacer = styled(View)`
	height: ${(props) => (props.height ? props.height : "0px")};
`;

const SectionTitleText = styled(ReelayText.Body2Bold)`
	align-self: flex-start;
	color: grey;
`;

const SectionTitleContainer = styled(View)`
	align-self: center;
	padding: 5px;
	width: 72%;
`;

export default EditProfile = ({ navigation, refreshProfile }) => {
    const ModalContainer = styled(View)`
		position: absolute;
		height: 100%;
	`;
	const HeaderContainer = styled(SafeAreaView)`
		background-color: black;
		width: 100%;
	`;
	const EditProfilePicContainer = styled(Pressable)`
		background-color: black;
		width: 100%;
	`;
	const EditInfoContainer = styled(SafeAreaView)`
		background-color: black;
		width: 100%;
		height: 100%;
  `;

	const isEditingProfile = useSelector(state => state.isEditingProfile);
	const dispatch = useDispatch();
	const { reelayDBUser } = useContext(AuthContext);

	const initBio = reelayDBUser.bio ? reelayDBUser.bio : "";
	const initWebsite = reelayDBUser.website ? reelayDBUser.website : "";
  	const bioRef = useRef(initBio);
  	const bioInputRef = useRef(null);
  	const websiteRef = useRef(initWebsite);
    const websiteInputRef = useRef(null);
	const currentFocus = useRef("");

	useFocusEffect(() => {
		dispatch({ type: 'setTabBarVisible', payload: false });
        return () => {
			dispatch({ type: 'setTabBarVisible', payload: true });
		}
	});

	const editUsernameOnPress = () => {
		navigation.push("AccountInfoScreen");
		dispatch({ type: 'setIsEditingProfile', payload: false });
	}

    const doneFunc = async () => {
		// save all information
		const successfulySaved = await saveInfo();
		if (successfulySaved) {
			dispatch({ type: 'setIsEditingProfile', payload: false });
		} else{
			showErrorToast("Info did not save successfully! Try again.")
		}
    }

    const cancelFunc = () => {
		bioRef.current = initBio;
		websiteRef.current = initWebsite;
		dispatch({ type: 'setIsEditingProfile', payload: false });
    }

	const saveInfo = async () => {
		reelayDBUser.bio = bioRef.current.trim() === "" ? null : bioRef.current;
		const bioUpdatedSuccessfully = await updateUserBio(reelayDBUser.sub, reelayDBUser.bio);
		reelayDBUser.website = (websiteRef.current.trim() === '') 
			? null 
			: websiteRef.current;
		const websiteUpdatedSuccessfully = await updateUserWebsite(reelayDBUser.sub, reelayDBUser.website);
		return (bioUpdatedSuccessfully && websiteUpdatedSuccessfully);
	}

	return (
		<ModalContainer>
			<Modal
				animationType="slide"
				transparent={true}
				visible={isEditingProfile}
			>
				<HeaderContainer>
				<HeaderDoneCancel
					withBar
					onDone={doneFunc}
					onCancel={cancelFunc}
					text="Edit Profile"
				/>
				</HeaderContainer>
				<EditUsername username={reelayDBUser.username} editUsernameOnPress={editUsernameOnPress} />
				<EditProfilePicContainer onPress={Keyboard.dismiss}>
					<EditProfileImage />
				</EditProfilePicContainer>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<EditInfoContainer>
						<EditBio bioRef={bioRef} bioInputRef={bioInputRef} currentFocus={currentFocus} />
						<EditWebsite websiteRef={websiteRef} websiteInputRef={websiteInputRef} currentFocus={currentFocus}/>
					</EditInfoContainer>
				</TouchableWithoutFeedback>
			</Modal>
		</ModalContainer>
  );
};

const EditUsername = ({ username, editUsernameOnPress }) => {
	const EditUsernameContainer = styled(View)`
		padding-top: 40px;
		flex-direction: row;
		justify-content: center;
		background-color: black;
		justify-content: center;
	`
	const UsernameText = styled(ReelayText.H6Emphasized)`
		align-self: center;
		color: #d4d4d4;
	`;
	const RightIconContainer = styled(View)`
		height: 18px;
		width: 18px;
		align-self: center;
	`
	return (
		<EditUsernameContainer>
			<UsernameText> {`@${username} `} </UsernameText>
			{/* <RightIconContainer>
				<Icon type='ionicon' name='create-outline' size={20} color={'#b5b5b5'} />
			</RightIconContainer> */}
		</EditUsernameContainer>
 	)
}

const EditBio = ({ bioRef, bioInputRef, currentFocus }) => {
	const BioInput = styled(TextInput)`
		color: white;
		font-family: Outfit-Regular;
		font-size: 16px;
		font-style: normal;
		letter-spacing: 0.15px;
		margin-left: 8px;
		padding: 10px;
		width: 87%;
  	`;
	const BioInputContainer = styled(View)`
		align-self: center;
		background-color: #1a1a1a;
		border-radius: 16px;
		flex-direction: row;
		padding: 5px;
		width: 80%;
  	`;
	const EditBioContainer = styled(View)`
		margin-top: 16px;
	`

	const changeInputText = (text) => {
		bioRef.current=text;
	};

	const bioOnPress = () => {
		bioInputRef.current.focus(); 
		currentFocus.current='bio'
	}

	return (
		<EditBioContainer>
			<SectionTitleContainer>
				<SectionTitleText>{"Bio"}</SectionTitleText>
			</SectionTitleContainer>
			<TouchableWithoutFeedback onPress={bioOnPress}>
				<BioInputContainer>
				<BioInput
					autoComplete='none'
					autoCapitalize="none"
					ref={bioInputRef}
					maxLength={250}
					multiline
					numberOfLines={4}
					defaultValue={bioRef.current}
					placeholder={"Who are you?"}
					placeholderTextColor={"gray"}
					onChangeText={changeInputText}
					onPressOut={Keyboard.dismiss()}
					returnKeyLabel="return"
					returnKeyType="default"
				/>
				
				</BioInputContainer>
			</TouchableWithoutFeedback>
		</EditBioContainer>
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
		padding-top: 15px;
		padding-bottom: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	`;
	const EditContainer = styled(View)`
		display: flex;
		flex-direction: column;
        align-items: center;
	`;
	const ProfileText = styled(ReelayText.Body2Bold)`
		color: ${({isUploading}) => isUploading ? "#4D4D4D" : "rgba(0, 165, 253, 1)"};
		text-align: center;
		padding: 5px;
	`;

    return (
		<Container>
			<EditContainer>
				<Pressable onPress={startEditPhoto}>
					<ProfilePicture user={reelayDBUser} size={96} />
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
				close={() => setIsEditingPhoto(false)}
			/>
		</Container>
	);
};

const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
const ON_UPLOAD_MESSAGE = 'Uploaded! It can take up to 24hrs for others to see the new pic';

const EditingPhotoMenuModal = ({ visible, close, setIsUploading }) => {
	const { reelayDBUser } = useContext(AuthContext);
	const s3Client = useSelector(state => state.s3Client);

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
			username: reelayDBUser?.username,
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

	const handleImagePicked = async (pickerResult) => {
        try {
			if (pickerResult.cancelled) {
				return;
			} else {
				setIsUploading(true);
				close();
				const { cloudfrontPhotoURI } = await uploadProfilePhotoToS3(pickerResult.uri);
				if (reelayDBUser?.profilePictureURI !== cloudfrontPhotoURI) {
					updateProfilePic(reelayDBUser?.sub, cloudfrontPhotoURI);					
				}
				logAmplitudeEventProd('changedProfilePic', {
					username: reelayDBUser?.username,
					sub: reelayDBUser?.sub,
				});
				await cacheProfilePic(reelayDBUser?.sub);
				setIsUploading(false);
				showMessageToast(ON_UPLOAD_MESSAGE);
			}
		} catch (e) {
			console.log("Upload Profile Picture Error: ", e);
			logAmplitudeEventProd('changedProfilePicError', {
				error: e,
				username: reelayDBUser?.username,
				sub: reelayDBUser?.sub,
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
		const photoTimestampedS3Key = `profilepic-${reelayDBUser?.sub}-${uploadTimestamp}.jpg`;
		const photoCurrentS3Key = `profilepic-${reelayDBUser?.sub}-current.jpg`;
		const { timestampedUploadResult, currentUploadResult } = await uploadProfilePicToS3(
			resizedPhotoURI,
			`public/${photoTimestampedS3Key}`,
			`public/${photoCurrentS3Key}`
		);
		console.log("S3 Timestamped Profile Picture Upload Result: ", timestampedUploadResult);
		console.log("S3 Current Profile Picture Upload Result: ", currentUploadResult);

		const currentPhotoURI = `${CLOUDFRONT_BASE_URL}/public/${photoCurrentS3Key}`;
		console.log("user current photo URI: ", currentPhotoURI);

		return {
			timestampedUploadResult,
			currentUploadResult,
			cloudfrontPhotoURI: currentPhotoURI,
		};
	};

	const uploadProfilePicToS3 = async (photoURI, timestampedS3Key, currentS3Key) => {
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

const EditWebsite = ({ websiteRef, websiteInputRef, currentFocus }) => {
	const WebsiteInput = styled(TextInput)`
		color: white;
		font-family: Outfit-Regular;
		font-size: 16px;
		font-style: normal;
		letter-spacing: 0.15px;
		margin-left: 8px;
		padding: 10px;
		width: 87%;
	`;
	const WebsiteInputContainer = styled(View)`
		align-self: center;
		background-color: #1a1a1a;
		border-radius: 16px;
		flex-direction: row;
		padding: 5px;
		width: 80%;
	`;
	const EditWebsiteContainer = styled(View)`
		margin-top: 16px;
	`

	const changeInputText = (text) => {
		websiteRef.current = text;
	};

	const websiteOnPress = () => {
		websiteInputRef.current.focus(); 
		currentFocus.current = "website";
	}

	return (
		<EditWebsiteContainer>
			<SectionTitleContainer>
				<SectionTitleText>{"Website"}</SectionTitleText>
			</SectionTitleContainer>
			<TouchableWithoutFeedback onPress={websiteOnPress}>
				<WebsiteInputContainer>
				<WebsiteInput
					autoComplete='none'
					autoCapitalize="none"
					ref={websiteInputRef}
					defaultValue={websiteRef.current}
					placeholder={"Any cool links?"}
					placeholderTextColor={"gray"}
					onChangeText={changeInputText}
					onPressOut={Keyboard.dismiss()}
					returnKeyLabel="return"
					returnKeyType="default"
				/>
				</WebsiteInputContainer>
			</TouchableWithoutFeedback>
		</EditWebsiteContainer>
	);
};