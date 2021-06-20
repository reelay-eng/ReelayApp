import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStage } from '../components/create-reelay/CreateReelaySlice';

import { Video, AVPlaybackStatus } from "expo-av";
import { ContainerStyles, TextStyles } from '../styles';
import styled from 'styled-components/native';

import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';

export default ReelayPreviewScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={ContainerStyles.fillContainer}>
            <Text style={TextStyles.whiteText}>{'Review goes here...'}</Text>
        </SafeAreaView>
    );
};