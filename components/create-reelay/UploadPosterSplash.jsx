import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStage } from './CreateReelaySlice';

import { Video, AVPlaybackStatus } from "expo-av";
import styled from 'styled-components/native';

import {
    StyleSheet,
    Dimensions,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';

export default UploadPosterSplash = () => {
    return (<Text>{'Splash goes here...'}</Text>);
};