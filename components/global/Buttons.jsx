import React, {useState} from 'react';
import { Pressable, View, Text, Image } from 'react-native';
import styled from 'styled-components/native';
const RedAddIcon = require('../../assets/icons/red_add_icon.png');
import * as ReelayText from './Text';

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
    flex-direction: row;
    justify-content: center;
    align-items: center;
`
const ButtonText = styled(ReelayText.Subtitle2)`
	color: ${(props) => props.fontColor};
	margin-left: ${(props) => (props.icon ? "3px" : "0px")};
`;

export const Button = ({
	text,
	onPress,
	pressedColor = "#0B2046",
	backgroundColor = "#2977EF",
	fontColor = "white",
	borderRadius = "20px",
	border = "",
    pressedBorder = "",
    icon=false,
}) => {
	return (
		<ButtonPressable onPress={onPress}>
			{({ pressed }) => (
				<ButtonBox
					pressed={pressed}
					pressedColor={pressedColor}
					backgroundColor={backgroundColor}
					borderRadius={borderRadius}
					border={border}
					pressedBorder={pressedBorder}
				>
					{icon}
                    <ButtonText icon={ icon ? true : false }fontColor={fontColor}>{text}</ButtonText>
				</ButtonBox>
			)}
		</ButtonPressable>
	);
};

export const ActionButton = ({
	text,
	onPress,
	color = "blue",
    borderRadius = "20px",
    icon=null,
}) => {
	if (color === "red")
		return (
			<Button
				onPress={onPress}
                text={text}
                icon={icon}
				borderRadius={borderRadius}
				backgroundColor={"#e8362a"}
				pressedColor={"#63100a"}
			/>
		);
	else
		return <Button onPress={onPress} icon={icon} text={text} borderRadius={borderRadius} />;
};

export const PassiveButton = ({ text, onPress, borderRadius = "20px" }) => (
	<Button
		onPress={onPress}
		text={text}
		borderRadius={borderRadius}
		backgroundColor={"#0B2046"}
		fontColor={"#7EAEFF"}
		pressedBorder={"solid 2px #2977EF"}
	/>
);
export const BWButton = ({ text, onPress, borderRadius = "20px", white = false }) => (
	<Button
		onPress={onPress}
		text={text}
		borderRadius={borderRadius}
		backgroundColor={white ? "#ffffff" : "#0D0D0D"}
        fontColor={white ? "#000000" : "#FFFFFF"}
        pressedColor={white ? "#8c8c8c" : "#2E2E2E"}
        border={white ? "solid 1px #000000" : "solid 1px white"}
	/>
);

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