import React from 'react';
import { Image, Pressable, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';

export default ProfileHeader = () => {
    const ProfileHeaderContainer = styled(SafeAreaView)`
		align-items: center;
		margin-top: 16px;
		margin-bottom: 8px;
		width: 100%;
	`;
    const ProfilePicture = styled(Image)`
        border-radius: 48px;
        height: 96px;
        width: 96px;
    `
    const ProfilePictureContainer = styled(Pressable)`
        border-color: white;
        border-radius: 50px;
        border-width: 2px;
        margin: 16px;
        height: 100px;
        width: 100px;
    `
    return (
        <ProfileHeaderContainer>
            <ProfilePictureContainer>
                <ProfilePicture source={require('../../assets/icons/reelay-icon.png')} />
            </ProfilePictureContainer>
        </ProfileHeaderContainer>
    );
}
