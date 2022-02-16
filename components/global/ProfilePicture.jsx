import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable } from 'react-native';
import Constants from 'expo-constants';
import ReelayIcon from '../../assets/icons/reelay-icon.png'
import styled from 'styled-components/native';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

const ProfileImage = styled(Image)`
    border-radius: ${(props) => props.size / 4}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

export default ProfilePicture = ({ user, navigation, size = 16 }) => {
    const [validProfileImage, setValidProfileImage] = useState(true);
    const userSub = user?.sub ?? user?.attributes?.sub;
    const uri  = `${CLOUDFRONT_BASE_URL}/public/profilepic-${userSub}-current.jpg`;

    return (
        <Pressable onPress={() => {
            navigation.push('UserProfileScreen', { creator: user });
        }}>
            { validProfileImage ? null : (<ProfileImage size={size} source={ReelayIcon}  />) }
            <ProfileImage
                size={size}
                source={{ uri }}
                style={(validProfileImage) ? {} : { display: 'none' }}
                PlaceholderContent={<ActivityIndicator />}
                onError={() => { setValidProfileImage(false) }}
            />
        </Pressable>
    )
}