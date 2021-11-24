import React, {useState} from 'react';
import { Pressable, View, Text, Image } from 'react-native';
import styled from 'styled-components/native';

const NameBadge = ({text, borderRadius='11px', backgroundColor="#7c7c7c", color="white", fontSize='20px', fontWeight='600'}) => {
    const BadgeContainer = styled(View)`
        height: 42px;
        background-color: ${props => props.backgroundColor};
        border-radius: ${props => props.borderRadius};
        padding-left: 25px;
        padding-right: 25px;
        margin-right: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
    `
    const BadgeText = styled(Text)`
        color: ${props => props.color};
        font-size: ${props => props.fontSize};
        font-weight: ${props => props.fontWeight};
    `
    return (
        <BadgeContainer backgroundColor={backgroundColor} borderRadius={borderRadius}>
            <BadgeText color={color} fontSize={fontSize} fontWeight={fontWeight}>
                {text}
            </BadgeText>
        </BadgeContainer>
    )
}

export const DirectorBadge = ({text}) => (
    <NameBadge
        backgroundColor='rgba(255, 255, 255, 0.1)'
        color='#7EAEFF'
        text={text.toUpperCase()}
    />
)

export const ActorBadge = ({text}) => (
    <NameBadge
        backgroundColor='rgba(11, 32, 71, 0.7)'
        color='#7EAEFF'
        text={text.toUpperCase()}
    />
)