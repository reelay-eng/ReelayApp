import React, {useState} from 'react';
import { Pressable, View, Text, Image } from 'react-native';
import styled from 'styled-components/native';
const RedAddIcon = require('../../assets/icons/red_add_icon.png');

const ButtonPressable = styled(Pressable)`
    width: 100%;
    height: 100%;
`

const ButtonBox = styled(View)`
    width: 100%;
    height: 100%;
    background-color: ${props => props.pressed ? props.pressedColor : props.backgroundColor};
    border-radius: ${props => props.borderRadius ? props.borderRadius : '10px'};
    border: ${props => {
        if (props.pressedBorder && props.pressed) return props.pressedBorder;
        if (props.border) return props.border;
        else return 'none'; 
    }};
    display: flex;
    justify-content: center;
    align-items: center;
`
const ButtonText = styled(Text)`
    font-size: ${props => props.fontSize};
    font-weight: bold;
    color: ${props => props.fontColor};
`

export const Button = ({
    text, 
    onPress, 
    pressedColor='#0B2046', 
    backgroundColor='#2977EF', 
    fontColor='white', 
    fontSize='24px', 
    borderRadius='20px', 
    border='',
    pressedBorder='',
}) => {
    return (
    <ButtonPressable
        onPress={onPress}
    >
        {({pressed}) => (
            <ButtonBox
                pressed={pressed}
                pressedColor={pressedColor}
                backgroundColor={backgroundColor}
                borderRadius={borderRadius}
                border={border}
                pressedBorder={pressedBorder}
            >
                <ButtonText 
                    fontColor={fontColor}
                    fontSize={fontSize}
                >
                        {text}
                </ButtonText>
            </ButtonBox>
        )}
    </ButtonPressable>
    )
}

export const ActionButton = ({text, onPress, fontSize, color='blue', borderRadius='20px'}) => {
    if (color === 'red') return (
        <Button 
            onPress={onPress}
            text={text}
            fontSize={fontSize}
            borderRadius={borderRadius}
            backgroundColor={'#e8362a'}
            pressedColor={'#63100a'}
        />
    )
    else return (
        <Button 
            onPress={onPress}
            text={text}
            fontSize={fontSize}
            borderRadius={borderRadius}
        />
    )
}

export const PassiveButton = ({text, onPress, fontSize, borderRadius='20px'}) => (
    <Button 
        onPress={onPress}
        text={text}
        fontSize={fontSize}
        borderRadius={borderRadius}
        backgroundColor={'#0B2046'}
        fontColor={'#7EAEFF'}
        pressedBorder={'solid 2px #2977EF'}
    />
)

export const RedPlusButton = ({onPress}) => {
    const IconBox = styled(Pressable)`
        width: 100%;
        height: 100%;
    `
    const IconImage = styled(Image)`
        width: 100%;
        height: 100%;
    `
    return (
        <IconBox onPress={onPress}>
            <IconImage source={RedAddIcon} />
        </IconBox>
    )
}