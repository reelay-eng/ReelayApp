import React, { useContext } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

import { VisibilityContext } from '../../context/VisibilityContext';

export default SettingsButton = () => {

    const visibilityContext = useContext(VisibilityContext);

    const AvatarView = styled(View)`
        width: 30px;
        height: 30px;
        margin: 10px;
    `
    const AvatarPressable = styled(Pressable)`
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
        <AvatarView>
            <AvatarPressable onPress={onPress}>
                <Icon type='ionicons' name='settings' color={'white'} size={30} />
            </AvatarPressable>
        </AvatarView>
    );

}