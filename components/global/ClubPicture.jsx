import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import Constants from 'expo-constants';
import ReelayIcon from '../../assets/icons/reelay-icon-with-dog-black.png'
import styled from 'styled-components/native';
import { cacheClubPic, checkRefreshClubPic, getClubPicURI } from '../../api/ReelayLocalImageCache';
import FastImage from 'react-native-fast-image';

const CAN_USE_FAST_IMAGE = (Constants.appOwnership !== 'expo');

const ProfileImage = styled(CAN_USE_FAST_IMAGE ? FastImage: Image)`
    border-color: white;
    border-radius: ${(props) => props.size/2}px;
    border-width: ${(props) => (props.border) ? 1 : 0}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

export default ClubPicture = ({ border = null, club, size = 16 }) => {
    const [loadState, setLoadState] = useState('local');

    const getClubPicSource = () => {
        if (loadState === 'local') {
            return { uri: getClubPicURI(club.id, true) };
        } else if (loadState === 'remote') {
            return { uri: getClubPicURI(club.id, false) };
        } else {
            return ReelayIcon;
        }
    }

    const onLoad = () => {
        // if we can only load the default club pic, cache that one
        // else, cache the one in cloudfront
        if (loadState === 'local') {
            checkRefreshClubPic(club.id);
        } else if (loadState === 'remote') {
            cacheClubPic(club.id, false);
        } else if (loadState === 'default') {
            cacheClubPic(club.id, true);
        }
    }

    const onLoadError = () => {
        if (loadState === 'local') {
            setLoadState('remote');
        } else if (loadState === 'remote') {
            setLoadState('default');
        }
    }

    return (
        <View>
            { (loadState === 'default') && 
                <ProfileImage border size={size} source={ReelayIcon} /> 
            }
            <ProfileImage
                border={border}
                size={size}
                source={getClubPicSource()}
                style={(loadState === 'default') ? { display: 'none' } : {}}
                PlaceholderContent={<ActivityIndicator />}
                onLoad={onLoad}
                onError={onLoadError}
            />
        </View>
    );
};