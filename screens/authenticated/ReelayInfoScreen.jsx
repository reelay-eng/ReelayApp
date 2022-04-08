import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StarRating from 'react-native-star-rating';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';

import { EncodingType, readAsStringAsync } from 'expo-file-system';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';

import { 
    CreateMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    ListPartsCommand,
    PutObjectCommand,
    UploadPartCommand,
} from '@aws-sdk/client-s3';

import ConfirmRetakeDrawer from '../../components/create-reelay/ConfirmRetakeDrawer';  

import Constants from 'expo-constants';

import PreviewVideoPlayer from '../../components/create-reelay/PreviewVideoPlayer';

import { Dimensions, Image, SafeAreaView, Pressable, TextInput, View, Keyboard } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { Icon } from 'react-native-elements';
import * as Progress from 'react-native-progress';
import { ScrollView, TouchableWithoutFeedback } from "react-native-gesture-handler";

import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { notifyOtherCreatorsOnReelayPosted } from '../../api/NotificationsApi';

import styled from 'styled-components/native';
import { postReelayToDB } from '../../api/ReelayDBApi';
import { fetchAnnotatedTitle } from '../../api/TMDbApi';
import ReelayColors from '../../constants/ReelayColors';
import { notifyOnReelayedRec } from '../../api/WatchlistNotifications';

const { height, width } = Dimensions.get('window');
const S3_UPLOAD_BUCKET = Constants.manifest.extra.reelayS3UploadBucket;
const UPLOAD_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_VISIBILITY = Constants.manifest.extra.uploadVisibility;

const CancelButtonPressable = styled(Pressable)`
    align-items: center;
    background-color: ${props => props.color}
    border-radius: 24px;
    bottom: 10px;
    justify-content: center;
    height: 48px;
    left: 18px;
    width: 150px;
`
const CancelButtonText = styled(ReelayText.H6Emphasized)`
    color: white;
    text-align: center;
`
const InfoContainer = styled(SafeAreaView)`
    align-items: center;
    justify-content: center;
    margin-top: 15px;
    width: 100%;
`
const PressableVideoContainer = styled(View)`
    align-self: center;
    height: ${height/2}px;
    margin-top: 15px;
    width: ${width/2 + 20}px;
`
const UploadButtonPressable = styled(Pressable)`
    background-color: ${props => props.color}
    border-radius: 24px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 48px;
    width: 175px;
    bottom: 10px;
    right: 18px;
`
const UploadButtonText = styled(ReelayText.H6Emphasized)`
    color: white;
    margin-left: 8px;
    text-align: center;
`
const UploadBottomArea = styled(SafeAreaView)`
    justify-content: flex-end;
`
const UploadBottomBar = styled(SafeAreaView)`
    flex-direction: row;
    justify-content: space-between;
`
const UploadProgressBarContainer = styled(View)`
    align-self: center;
    justify-content: center;
    height: 10px;
    width: ${width - 20}px;
    bottom: 30px;
`
const UploadScreenContainer = styled(SafeAreaView)`
    height: 100%;
    width: 100%;
    background-color: black;
    justify-content: space-between;
`

export default ReelayUploadScreen = ({ navigation, route }) => {

    const { titleObj, videoURI, venue } = route.params;

    const uploadStages = [
        'preview',
        'uploading',
        'upload-complete',
        'upload-failed-retry',
    ];

    const [playing, setPlaying] = useState(true);
    const [uploadProgress, setUploadProgress] = useState(0.0);
    const [uploadStage, setUploadStage] = useState(uploadStages[0]);
    const [starCount, setStarCount] = useState(0);
    const [confirmRetakeDrawerVisible, setConfirmRetakeDrawerVisible] = useState(false);

    const { cognitoUser, reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
	const s3Client = useSelector(state => state.s3Client);
    const myWatchlistItems = useSelector(state => state.myWatchlistItems);

    const descriptionRef = useRef("");
    const descriptionInputRef = useRef(null);

    const uploadReelayToS3 = async (videoURI, videoS3Key) => {
        setUploadProgress(0.2);
        const videoStr = await readAsStringAsync(videoURI, { encoding: EncodingType.Base64 });
        const videoBuffer = Buffer.from(videoStr, 'base64');
        setUploadProgress(0.4);

        let result;
        if (videoBuffer.byteLength < UPLOAD_CHUNK_SIZE) {
            result = await uploadToS3SinglePart(videoBuffer, videoS3Key);
        } else {
            result = await uploadToS3Multipart(videoBuffer, videoS3Key);
        }

        setUploadProgress(0.8);
        console.log('S3 upload complete');
        return result;
    }

    const uploadToS3SinglePart = async (videoBuffer, videoS3Key) => {
        const uploadResult = await s3Client.send(new PutObjectCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            ContentType: 'video/mp4',
            Body: videoBuffer,
        }));

        return uploadResult;
    }

    const uploadToS3Multipart = async (videoBuffer, videoS3Key) => {
        /**
         * AWS requires each part must be at least 5MB. In this method, each part
         * is exactly 5MB except the last chunk, which can be up to 10MB
         */

        const numParts = Math.floor(videoBuffer.byteLength / UPLOAD_CHUNK_SIZE);
        const partNumberRange = Array.from(Array(numParts), (empty, index) => index);

        const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            ContentType: 'video/mp4',
        }));

        setUploadProgress(0.6);

        const uploadPartResults = await Promise.all(partNumberRange.map(async (partNumber) => {
            console.log('PART NUMBER: ', partNumber);

            // byteEnd rounds to the end of the file, so its buffer is normally > 5MB
            const byteBegin = partNumber * UPLOAD_CHUNK_SIZE;
            const byteEnd = (partNumber === numParts - 1)
                ? videoBuffer.byteLength
                : byteBegin + UPLOAD_CHUNK_SIZE;

            const result = await s3Client.send(new UploadPartCommand({
                Bucket: S3_UPLOAD_BUCKET,
                Key: videoS3Key,
                ContentType: 'video/mp4',
                Body: videoBuffer.slice(byteBegin, byteEnd),
                PartNumber: partNumber + 1, // part numbers must be between 1 and 10,000
                UploadId: UploadId,
            }));

            console.log('result completed');
            return result;
        }));

        console.log(uploadPartResults);

        const uploadParts = await s3Client.send(new ListPartsCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            UploadId: UploadId,
        }));
        
        console.log('UPLOAD PARTS: ', uploadParts);
        console.log('about to complete upload');

        const uploadCompleteStatus = await s3Client.send(new CompleteMultipartUploadCommand({
            Bucket: S3_UPLOAD_BUCKET,
            Key: videoS3Key,
            UploadId: UploadId,
            MultipartUpload: uploadParts,
        }));

        return uploadCompleteStatus;
    }

    const publishReelay = async () => {
        if (!videoURI) {
            console.log('No video to upload.');
            return;
        }

        logAmplitudeEventProd('publishReelayStarted', {
            username: cognitoUser.username,
            title: titleObj.display,
        });

        try {
            console.log('Upload dialog initiated.');
            setUploadStage('uploading');

            // Adding the file extension directly to the key seems to trigger S3 getting the right content type,
            // not setting contentType as a parameter in the Storage.put call.
            const uploadTimestamp = Date.now();
            const videoS3Key = `reelayvid-${cognitoUser?.attributes?.sub}-${uploadTimestamp}.mp4`;
            const s3UploadResult = await uploadReelayToS3(videoURI, `public/${videoS3Key}`);
            console.log(s3UploadResult);

            // Post Reelay object to ReelayDB
            // not checking for dupes on uuidv4(), 
            // but a collision is less than a one in a quadrillion chance
            
            const reelayDBBody = {
                creatorSub: cognitoUser?.attributes?.sub,
                creatorName: cognitoUser.username,
                datastoreSub: uuidv4(), 
                description: descriptionRef.current,
                isMovie: titleObj.isMovie,
                isSeries: titleObj.isSeries,
                postedAt: uploadTimestamp,
                starRating: starCount,
                tmdbTitleID: titleObj.id,
                venue: venue,
                videoS3Key: videoS3Key,
                visibility: UPLOAD_VISIBILITY,
            }

            const postResult = await postReelayToDB(reelayDBBody);
            console.log('Saved Reelay to DB: ', postResult);
            
            setUploadProgress(1.0);
            setUploadStage('upload-complete');

            console.log('saved new Reelay');
            console.log('Upload dialog complete.');

            logAmplitudeEventProd('publishReelayComplete', {
                username: cognitoUser.username,
                userSub: cognitoUser?.attributes?.sub,
                title: titleObj.display,
            });

            // janky, but this gets the reelay into the format we need, so that
            // we can reuse fetchReelaysForStack from ReelayDBApi

            const annotatedTitle = await fetchAnnotatedTitle(reelayDBBody.tmdbTitleID, reelayDBBody.isSeries);
            await notifyOtherCreatorsOnReelayPosted({
                creator: cognitoUser,
                reelay: { 
                    ...reelayDBBody, 
                    title: annotatedTitle,
                },
            });

            notifyOnReelayedRec({ 
                creatorSub: cognitoUser?.attributes?.sub,
                creatorName: cognitoUser?.username,
                reelay: reelayDBBody,
                watchlistItems: myWatchlistItems,
            });

			dispatch({ type: 'setRefreshOnUpload', payload: true });
            navigation.popToTop();
            navigation.navigate("Global", { forceRefresh: true });

        } catch (error) {
            // todo: better error catching
            console.log('Error uploading file: ', error);
            setUploadProgress(0.0);
            setUploadStage('upload-failed-retry');
            
            logAmplitudeEventProd('uploadFailed', {
                username: cognitoUser.username,
                title: titleObj.display,
            });
        }
    }

    const CancelButton = () => {
        const openConfirmRetakeDrawer = async () => {
            if (uploadStage !== 'uploading' || uploadStage !== 'upload-complete') {
                setConfirmRetakeDrawerVisible(true);
            }
        }
    
        return (
            <CancelButtonPressable onPress={openConfirmRetakeDrawer} color={ReelayColors.reelayRed}>
                <CancelButtonText>{"Cancel"}</CancelButtonText>
            </CancelButtonPressable>  
        );
    }

    const Header = ({ navigation }) => {
        const HeaderContainer = styled(View)`
            width: 100%;
            padding: 20px;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
        `;
        const HeaderText = styled(ReelayText.H5Emphasized)`
            text-align: center;
            color: white;
            margin-top: 4px;
            width: 90%;
            margin-right: 18px;
        `;
        const BackButton = styled(Pressable)`
            margin-right: 20px;
        `;
        return (
            <>
                <HeaderContainer>
                    <BackButton onPress={() => setConfirmRetakeDrawerVisible(true)}>
                        <Icon type="ionicon" name="arrow-back-outline" color="white" size={24} />
                    </BackButton>
                    <HeaderText>{"Upload"}</HeaderText>
                </HeaderContainer>
            </>
        );
    };

    const UploadButton = () => {
        
        const getCurrentButtonColor = () => {
            if (uploadStage === 'preview') {
                return ReelayColors.reelayBlue;
            } else if (uploadStage === 'uploading') {
                return ReelayColors.reelayBlue;
            } else if (uploadStage === 'upload-complete') {
                return 'green';
            } else if (uploadStage === 'upload-failed-retry') {
                return ReelayColors.reelayBlue;
            } else {
                return ReelayColors.reelayRed;
            }
        }

        // https://ionic.io/ionicons
        const getCurrentIconName = () => {
            if (uploadStage === 'preview') {
                return 'paper-plane';
            } else if (uploadStage === 'uploading') {
                return 'ellipsis-horizontal';
            } else if (uploadStage === 'upload-complete') {
                return 'checkmark-done';
            } else if (uploadStage === 'upload-failed-retry') {
                return 'reload';
            } else {
                return 'help';
            }
        }

        const getCurrentText = () => {
            if (uploadStage === 'preview') {
                return 'Publish';
            } else if (uploadStage === 'uploading') {
                return 'Uploading';
            } else if (uploadStage === 'upload-complete') {
                return 'Complete';
            } else if (uploadStage === 'upload-failed-retry') {
                return 'Upload Failed - Retry?';
            } else {
                return 'Something went wrong';
            }
        }

        const onPress = () => {
            if (uploadStage === 'preview') {
                publishReelay();
            } else if (uploadStage === 'uploading') {
                // do nothing
            } else if (uploadStage === 'upload-complete') {
                navigation.popToTop();
                navigation.navigate('Global', { forceRefresh: true });  
            } else if (uploadStage === 'upload-failed-retry') {
                publishReelay();
            }
        }

        return (
            <UploadButtonPressable onPress={onPress} color={getCurrentButtonColor()}>
                <Icon type='ionicon' name={getCurrentIconName()} color={'white'} size={30} />
                <UploadButtonText>{getCurrentText()}</UploadButtonText>
            </UploadButtonPressable>
        );
    }

    const UploadProgressBar = () => {
        const indeterminate = (uploadProgress < 0.1) && (uploadStage === 'uploading');
        const progressBarColor = (uploadStage === 'upload-complete') 
            ? 'green' 
            : 'white';
    
        return (
            <UploadProgressBarContainer>
                { ((uploadStage === 'uploading') || (uploadStage === 'upload-complete')) && 
                    <Progress.Bar 
                        color={progressBarColor} 
                        indeterminate={indeterminate} 
                        progress={uploadProgress} 
                        width={width - 20} 
                        height={8}
                        borderRadius={8}
                    />
                }
            </UploadProgressBarContainer>
        );
    }


    const EditDescription = ({ descriptionRef, descriptionInputRef }) => {
        const DescriptionInput = styled(TextInput)`
            color: white;
            font-family: Outfit-Regular;
            font-size: 16px;
            font-style: normal;
            letter-spacing: 0.15px;
            margin-left: 8px;
            padding: 10px;
            width: 95%;
          `;
        const DescriptionInputContainer = styled(View)`
            align-self: center;
            background-color: #1a1a1a;
            border-radius: 16px;
            flex-direction: row;
            padding: 5px;
            width: 80%;
            margin: 25px;
        `;

        const changeInputText = (text) => {
            descriptionRef.current=text;
        };    

        return (
            <>
		    <TouchableWithoutFeedback onPress={() => {descriptionInputRef.current.focus();}}>
                <DescriptionInputContainer>
                    <DescriptionInput
                        clearButtonMode={'while-editing'}
				        ref={descriptionInputRef}
                        maxLength={250}
                        defaultValue={descriptionRef.current}
                        placeholder={"Add a description..."}
                        placeholderTextColor={"gray"}
                        onChangeText={changeInputText}
                        onPressOut={Keyboard.dismiss()}
                        returnKeyType="done"
                    />
                </DescriptionInputContainer>
            </TouchableWithoutFeedback>
            </>
        );
    };

    const posterStyle = {
        borderRadius: 4, 
        height: 70, 
        width: 50, 
        position: "absolute",
        right: 8,
        top: 8,
    }

    const onStarRatingPress = (rating) => {
        setStarCount(rating)
    }

    return (
        <UploadScreenContainer>
            <Header navigation={navigation} />
            <KeyboardAwareScrollView extraScrollHeight={60}>
            <ScrollView>
                <PressableVideoContainer>
                    <PreviewVideoPlayer videoURI={videoURI} playing={playing} />
                    <Image source={titleObj.posterSource} style={posterStyle} />
                </PressableVideoContainer>
                <InfoContainer>
                    <EditDescription descriptionRef={descriptionRef} descriptionInputRef={descriptionInputRef} />
                    <StarRating 
                        disabled={false}
                        maxStars={5}
                        fullStarColor={'#f1c40f'}
                        halfStarEnabled={true}
                        rating={starCount}
                        selectedStar={onStarRatingPress}
                        starStyle={{width: 50, height: 50}}
                    />
                </InfoContainer>
            </ScrollView>
            </KeyboardAwareScrollView>
            <UploadBottomArea>
                <UploadProgressBar />
                <UploadBottomBar>
                    <CancelButton />
                    <UploadButton />
                </UploadBottomBar>
            </UploadBottomArea>
            <ConfirmRetakeDrawer 
                navigation={navigation} titleObj={titleObj} 
                confirmRetakeDrawerVisible={confirmRetakeDrawerVisible}
                setConfirmRetakeDrawerVisible={setConfirmRetakeDrawerVisible}
                lastState={"Upload"}
            />
        </UploadScreenContainer>
    );
};