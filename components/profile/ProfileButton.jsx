import React from 'react';
import { Pressable } from 'react-native';
import styled from 'styled-components/native';

export default ProfileButton = ({ onPress }) => {

    const AvatarView = styled.View`
        width: 48px;
        height: 48px;
    `
    const AvatarImage = styled.Image`
        width: 100%;
        height: 100%;
        border-radius: 48px;
        border-width: 2px;
        border-color: #ffffff;
    `

    return (
        <AvatarView style={{ margin: 20 }}>
            <Pressable onPress={onPress}>
                <AvatarImage resizeMode='cover' source={require('../../assets/images/icon.png')} />
            </Pressable>
        </AvatarView>
    );

}