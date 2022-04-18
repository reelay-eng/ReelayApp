import React from 'react';
import { Pressable, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import ProfilePicture from '../global/ProfilePicture';

export default ProfileHeader = ({ creator }) => {
    const ProfileHeaderContainer = styled(SafeAreaView)`
		align-items: center;
		margin-top: 16px;
		margin-bottom: 8px;
		width: 100%;
	`;
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
                <ProfilePicture user={creator} size={96} />
            </ProfilePictureContainer>
        </ProfileHeaderContainer>
    );
}
