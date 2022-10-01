import React, { useState, memo } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import ReelayIcon from '../../assets/icons/reelay-icon-with-dog-black.png'
import styled from 'styled-components/native';
import { cacheProfilePic, checkRefreshProfilePic, getProfilePicURI } from '../../api/ReelayLocalImageCache';
import Constants from 'expo-constants';
import FastImage from 'react-native-fast-image'

const CAN_USE_FAST_IMAGE = (Constants.appOwnership !== 'expo');

const DefaultProfileImageView = styled(View)`
    position: absolute;
`
const ProfileImage = styled(Image)`
    border-color: white;
    border-radius: ${(props) => props.size/2}px;
    border-width: ${(props) => (props.border) ? 1 : 0}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

export default ProfilePicture = memo(({ 
    user, 
    size = 16, 
    border = null, 
    navigation, 
}) => {
    const advanceToProfileScreen = () => {
        if (navigation) {
            navigation.push('UserProfileScreen', { creator: user });
        }
    }

    const userSub = user?.sub ?? user?.attributes?.sub;
    const source = {
        uri: getProfilePicURI(userSub, false),
        priority: FastImage.priority.normal,
    }

    const style = {
        width: size, 
        height: size,
        borderColor: 'white',
        borderRadius: size / 2,
        borderWidth: border ? 1 : 0,
    };
    
    if (CAN_USE_FAST_IMAGE) {
        return (
            <Pressable onPress={advanceToProfileScreen}>
                <DefaultProfileImageView>
                    <FastImage source={ReelayIcon} style={style} />
                </DefaultProfileImageView>
                <FastImage source={source} style={style} />
            </Pressable>
        );    
    }

    const [loadState, setLoadState] = useState('local');

    const getProfilePicSource = () => {
        if (loadState === 'local') {
            return { uri: getProfilePicURI(userSub, true) };
        } else if (loadState === 'remote') {
            return { uri: getProfilePicURI(userSub, false) };
        } else {
            return ReelayIcon;
        }
    }

    const onLoad = () => {
        // if we can only load the default club pic, cache that one
        // else, cache the one in cloudfront
        if (loadState === 'local') {
            checkRefreshProfilePic(user?.sub);
        } else if (loadState === 'remote') {
            cacheProfilePic(user?.sub, false);
        } else if (loadState === 'default') {
            cacheProfilePic(user?.sub, true);
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
        <Pressable onPress={advanceToProfileScreen}>
            { (loadState === 'default') && 
                <ProfileImage border size={size} source={ReelayIcon} /> 
            }
            <ProfileImage
                border={border}
                size={size}
                source={getProfilePicSource()}
                style={(loadState === 'default') ? { display: 'none' } : {}}
                PlaceholderContent={<ActivityIndicator />}
                onLoad={onLoad}
                onError={onLoadError}
            />
        </Pressable>
    );
}, (prevProps, nextProps) => {
    return (prevProps?.user?.sub === nextProps?.user?.sub);
});