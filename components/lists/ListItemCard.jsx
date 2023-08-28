import React, { memo, useContext, useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Linking, Pressable, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import TitlePoster from '../global/TitlePoster';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { logAmplitudeEventProd, firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../utils/EventLogger';
import * as ReelayText from '../global/Text';
import { useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'expo-camera';
import ProfilePicture from '../global/ProfilePicture';
import { AuthContext } from '../../context/AuthContext';
import { getProfilePicURI } from '../../api/ReelayLocalImageCache';
import { ActivityIndicator } from 'react-native';
import DogWithGlasses from '../../assets/images/dog-with-glasses.png';

const { height, width } = Dimensions.get('window');
const CARD_SIDE_MARGIN = 6;

const ListTitleText = styled(ReelayText.H5Bold)`
    text-align: left;
	font-size: 22px;
    color:#fff;
    width:100%;
`
const ListUserText = styled(ReelayText.H6)`
    text-align: left;
    color:#fff;
    width:100%;
`
const ListCardView = styled(Pressable)`
    margin: ${CARD_SIDE_MARGIN}px;
    height: 160px;
    margin-bottom:0px;
    flex-direction:row;
    align-item:center;
`
const ListCardImage = styled(Image)`
    height: 145px;
    width: 120px;
    margin-right:10px;
    border-radius:10px;
    background-color:#2c2c2c;
`
const ListCardFlexView = styled(View)`
    margin-top:10px;
    width:65%;
`
const DogWithGlassesImage = styled(Image)`
    height: 145px;
    width: 120px;
    margin-right:10px;
    border-radius:10px;
    `

const ListItemCard = ({ navigation, listItem }) => {
    try {
        firebaseCrashlyticsLog('List item card screen');
        const { reelayDBUser } = useContext(AuthContext);
        const [load, setLoad] = useState(false)
        return (
            <ListCardView onPress={() => navigation.navigate('ListMovieScreen', { listData: listItem, fromList: true, fromDeeplink: listItem.Flag == 2 ? true : false })}>

                {listItem?.profilePictureURI ?
                    <ListCardImage resizeMode='cover'
                        source={{ uri: listItem?.profilePictureURI }}
                    /> :
                    <DogWithGlassesImage resizeMode='center' source={DogWithGlasses} />}

                <ListCardFlexView>
                    <ListTitleText numberOfLines={2}>{listItem?.listName}</ListTitleText>
                    <ListUserText>{listItem?.creatorName}</ListUserText>
                </ListCardFlexView>
            </ListCardView>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}

export default memo(ListItemCard, (prevProps, nextProps) => true);
