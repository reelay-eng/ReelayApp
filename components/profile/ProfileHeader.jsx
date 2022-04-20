import React from 'react';
import { Pressable, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import ProfilePicture from '../global/ProfilePicture';

export default ProfileHeader = ({ creator, shouldCenter=false }) => {
    const ProfileHeaderContainer = styled(SafeAreaView)`
        flex: 1;
		align-items: center;
		margin-left: 8px;
		width: 90px;
        align-self: ${(shouldCenter) ? 'center' : 'flex-start'};
	`;
    const ProfilePictureContainer = styled(Pressable)`
        border-color: white;
        border-radius: 50px;
        border-width: 2px;
        margin: 16px;
        height: 84px;
        width: 84px;
    `
    return (
        <ProfileHeaderContainer>
            <ProfilePictureContainer>
                <ProfilePicture user={creator} size={80} />
            </ProfilePictureContainer>
        </ProfileHeaderContainer>
    );
}
