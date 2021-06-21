import React, { useState, useRef, useEffect } from "react";
import  { Storage, Auth, API, DataStore, progressCallback } from "aws-amplify";
import { User, Artist, Movie, Reelay } from '../../src/models';

import { useDispatch, useSelector } from 'react-redux';
import { setStage } from "../../components/create-reelay/CreateReelaySlice";

import { Camera } from "expo-camera";
import { Video, AVPlaybackStatus } from "expo-av";
import { Button } from 'react-native-elements';
import { ContainerStyles } from "../../styles";

import {
  StyleSheet,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import ReelayCamera from '../components/create-reelay/ReelayCamera';
import ReelayPreview from '../components/create-reelay/ReelayPreview';
import TagMovieOverlay from '../components/create-reelay/TagMovieOverlay';
import UploadPosterSplash from '../components/create-reelay/UploadPosterSplash';

const WINDOW_HEIGHT = Dimensions.get("window").height;
const closeButtonSize = Math.floor(WINDOW_HEIGHT * 0.032);
const captureSize = Math.floor(WINDOW_HEIGHT * 0.09);

export default function CreateReelayScreen({ navigation }) {
    useEffect(() => {
		const navUnsubscribe = navigation.addListener('focus', () => {
			// TODO
		});

        const cleanup = () => {
            // 
            navUnsubscribe(setStage('SELECT_TITLE'));
        }
		// return the cleanup function
		return navUnsubscribe;
	}, [navigation]);

    const CreationStages = {
        SELECT_TITLE: 'SELECT_TITLE',
        CAMERA_PREVIEW: 'CAMERA_PREVIEW',
        RECORDING: 'RECORDING',
        REVIEWING: 'REVIEWING',
        UPLOADING: 'UPLOADING',
    }

    const creationStage = useSelector((state) => state.createReelay.creationStage);
    console.log(creationStage);

    return (
        <SafeAreaView style={ContainerStyles.fillContainer}>
            <Text>{'okay'}</Text>
            {(creationStage == 'SELECT_TITLE') && <TagMovieOverlay />}
            {(creationStage == 'CAMERA_PREVIEW' || creationStage == 'RECORDING') && 
                <ReelayCamera navigation={navigation} />} 
            {creationStage == 'REVIEWING' && <ReelayPreview />}
            {creationStage == 'UPLOADING' && <UploadPosterSplash />}
        </SafeAreaView>  
    );
};