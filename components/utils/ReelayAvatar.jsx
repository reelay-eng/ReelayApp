import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'react-native-elements';
import styled from 'styled-components/native';


export default ReelayAvatar = ({ onPress }) => {
    const AvatarView = styled(View)`
        width: 48px;
        height: 48px;
        margin-top: 15px;
    `
    const AvatarImage = styled(Image)`
        width: 100%;
        height: 100%;
        border-radius: 48px;
        border-width: 2px;
        border-color: #ffffff;
    `

    return (
        <AvatarView>
            <Pressable onPress={onPress}>
                <AvatarImage resizeMode='cover' source={require('../../assets/images/icon.png')} />
            </Pressable>
        </AvatarView>
    );
}