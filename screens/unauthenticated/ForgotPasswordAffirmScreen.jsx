import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';

import { AuthButton, AuthHeaderCenter } from '../../components/utils/AuthComponents';

export default ForgotPasswordAffirmScreen = ({ navigation }) => {
    const InputContainer = styled(View)`
        margin-bottom: 60px;
    `
    const CTAButton = styled(Button)`
        align-self: center;
        margin-top: 10px;
        width: 75%;
    `
    const TitleContainer = styled(View)`
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    `
    const TitleText = styled(Text)`
        font-size: 32px;
        color: white;
    `
    
    return (
        <SafeAreaView style={{
            backgroundColor: 'black',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly'
        }}>
            <TitleContainer>
                <TitleText>Password successfully reset!</TitleText>
            </TitleContainer>
            <CTAButton title="Return to Sign In" type='solid' 
                onPress={() => {
                    navigation.popToTop();
                    navigation.push('SignInScreen');
                }}
                buttonStyle={{ 
                    backgroundColor: ReelayColors.reelayRed,
                    borderRadius: 36,
                    height: 56,
                }} 
                titleStyle={{
                    fontWeight: 'bold',
                }} />
        </SafeAreaView>
    );
}