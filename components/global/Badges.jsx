import React, {useState} from 'react';
import { Pressable, View, Text, Image } from 'react-native';
import styled from 'styled-components/native';
import * as ReelayText from "./Text";

const NameBadge = ({ text, borderRadius = '11px', backgroundColor = "#7c7c7c", color = "white", fontSize = '20px', fontWeight = '600', photoURL = null}) => {
    const BadgeContainer = styled(View)`
        height: 42px;
        background-color: ${props => props.backgroundColor};
        border-radius: ${props => props.borderRadius};
        padding-left: ${photoURL ? "4px" : "12px"};
        padding-right: 12px;
        padding-top: 4px;
        padding-bottom: 4px;
        margin-right: 10px;
        margin-top: 12px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    `
    const BadgeText = styled(ReelayText.Subtitle2)`
        color: ${props => props.color};
        margin-left: ${photoURL ? "8px" : "0px"};
    `
    const BadgeImage = styled(Image)`
        width: 24px;
        height: 24px;
        border-radius: 12px;
    `
    return (
		<BadgeContainer backgroundColor={backgroundColor} borderRadius={borderRadius}>
			{photoURL && <BadgeImage source={{ uri: photoURL }} />}
			<BadgeText color={color} fontSize={fontSize} fontWeight={fontWeight}>
				{text}
			</BadgeText>
		</BadgeContainer>
	);
}

export const DirectorBadge = ({ text }) => (
    <NameBadge backgroundColor="#393939" color="#FFFFFF" text={text} />
);

export const ActorBadge = ({ text, photoURL }) => (
	<NameBadge backgroundColor="#393939" color="#FFFFFF" text={text} photoURL={photoURL} />
);