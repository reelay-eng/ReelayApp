import React, { useState, memo } from 'react';
import { ActivityIndicator, Image, Pressable } from 'react-native';
import Constants from 'expo-constants';
import ReelayIcon from '../../assets/icons/reelay-icon.png'
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

const ProfileImage = styled(Image)`
    border-color: white;
    border-radius: ${(props) => props.size/2}px;
    border-width: ${(props) => (props.border) ? 1 : 0}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

export default ProfilePicture = memo(({ border = null, user, navigation, size = 16 }) => {
    const [validProfileImage, setValidProfileImage] = useState(true);
    const userSub = user?.sub ?? user?.attributes?.sub;
    const uri  = `${CLOUDFRONT_BASE_URL}/public/profilepic-${userSub}-current.jpg`;

    return (
        <Pressable onPress={() => {
            navigation.push('UserProfileScreen', { creator: user });
        }}>
            { validProfileImage ? null : (
                <ProfileImage border size={size} source={ReelayIcon} />) 
            }
            <ProfileImage
                border={border}
                size={size}
                source={{ uri }}
                style={(validProfileImage) ? {} : { display: 'none' }}
                PlaceholderContent={<ActivityIndicator />}
                onError={() => { setValidProfileImage(false) }}
            />
        </Pressable>
    )
}, (prevProps, nextProps) => {
    return (prevProps?.user?.sub === nextProps?.user?.sub);
});