import React, { useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';
import Constants from 'expo-constants';
import styled from 'styled-components/native';
import ReelayIcon from '../../assets/icons/reelay-icon.png'

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

const ProfileImage = styled(Image)`
	border-radius: 16px;
	border-width: 1px;
	border-color: white;
	height: 32px;
	width: 32px;
`;

const ProfilePictureContainer = styled(View)`
	margin: 10px;
	flex: 0.1;
`;

export default ProfilePicture = ({ userSub }) => {
    const [validProfileImage, setValidProfileImage] = useState(true);
    const uri  = `${CLOUDFRONT_BASE_URL}/public/profilepic-${userSub}-current.jpg`;

    return (
        <ProfilePictureContainer>
            { validProfileImage ? null : (<ProfilePicture source={ReelayIcon} />) }
            <ProfileImage
                source={{ uri }}
                style={(validProfileImage) ? {} : { display: 'none' }}
                PlaceholderContent={<ActivityIndicator />}
                onError={() => { setValidProfileImage(false) }}
            />
        </ProfilePictureContainer>
    )
}