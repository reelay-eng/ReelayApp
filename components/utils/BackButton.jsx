import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

export default BackButton = ({ navigation }) => {
    const BackButtonContainer = styled(Pressable)`
        height: 30px;
        width: 30px;
        margin: 10px;
    `
    return (
        <View>
            <BackButtonContainer onPress={() => { navigation.goBack() }}>
                <Icon type='ionicon' name='chevron-back-outline' color={'white'} size={30} />
            </BackButtonContainer>
        </View>
    );
}