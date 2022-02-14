import React, { useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import Constants from 'expo-constants';
import ReelayIcon from '../../assets/icons/reelay-icon.png'
import styled from 'styled-components/native';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

const ProfileImage = styled(Image)`
    border-radius: ${(props) => props.size / 4}px;
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
`

export default ProfilePicture = ({ userSub, size = 16 }) => {
    const [validProfileImage, setValidProfileImage] = useState(true);
    const uri  = `${CLOUDFRONT_BASE_URL}/public/profilepic-${userSub}-current.jpg`;

    return (
        <React.Fragment>
            { validProfileImage ? null : (<ProfileImage size={size} source={ReelayIcon}  />) }
            <ProfileImage
                size={size}
                source={{ uri }}
                style={(validProfileImage) ? {} : { display: 'none' }}
                PlaceholderContent={<ActivityIndicator />}
                onError={() => { setValidProfileImage(false) }}
            />
        </React.Fragment>
    )
}