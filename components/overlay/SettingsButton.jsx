import React, { useContext } from 'react';
import { Pressable } from 'react-native';
import styled from 'styled-components/native';

import { VisibilityContext } from '../../context/VisibilityContext';

export default SettingsButton = () => {

    const visibilityContext = useContext(VisibilityContext);

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
    const AvatarPressable = styled.Pressable`
        width: 100%;
        height: 100%;
    `

    const onPress = () => {
        visibilityContext.setOverlayData({
            type: 'SETTINGS',
        });
        visibilityContext.setOverlayVisible(true);
        console.log('pressed');
    }

    return (
        <AvatarView style={{ margin: 10 }}>
            <AvatarPressable onPress={onPress}>
                <AvatarImage resizeMode='cover' source={require('../../assets/images/icon.png')} />
            </AvatarPressable>
        </AvatarView>
    );

}