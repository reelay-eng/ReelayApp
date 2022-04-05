import React, { useState } from 'react';
import { Pressable, View, Text, Image } from 'react-native';
import styled from 'styled-components/native';
import ReelayColors from '../../constants/ReelayColors';
import * as ReelayText from './Text';

const RedAddIcon = require('../../assets/icons/red_add_icon.png');

const ButtonPressable = styled(Pressable)`
    width: 100%;
    height: 100%;
`

const ButtonBox = styled(View)`
    width: 100%;
    height: 100%;
    background-color: ${props => {
	if (props.disabled) return "transparent";
		else if (props.pressed) return props.pressedColor;
		else return props.backgroundColor;
	}
	};
    border-radius: ${props => props.borderRadius ? props.borderRadius : '10px'};
    border: ${props => {
    if (props.disabled) return 'solid 1px #5e5e5e';
        if (props.pressedBorder && props.pressed) return props.pressedBorder;
        else if (props.border) return props.border;
        else return 'none'; 
    }};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`
const ButtonText = styled(ReelayText.Subtitle2)`
	color: ${(props) => (props.disabled ? "#5e5e5e" : props.fontColor)};
	margin-left: ${(props) => (props.leftMargin ? "3px" : "0px")};
	margin-right: ${(props) => (props.rightMargin ? "3px" : "0px")};
`;

export const Button = ({
	text,
	onPress,
	pressedColor = "#0B2046",
	backgroundColor = ReelayColors.reelayBlue,
	fontColor = "white",
	borderRadius = "20px",
	border = "",
	pressedBorder = "",
	leftIcon = null,
	rightIcon = null,
	disabled = false,
}) => {
	return (
		<ButtonPressable onPress={disabled ? () => {} : onPress}>
			{({ pressed }) => {
				const isPressed = !disabled && pressed;
				return (
					<ButtonBox
						disabled={disabled}
						pressed={isPressed}
						pressedColor={pressedColor}
						backgroundColor={backgroundColor}
						borderRadius={borderRadius}
						border={border}
						pressedBorder={pressedBorder}
					>
						{leftIcon}
						<ButtonText
							leftMargin={leftIcon ? true : false}
							rightMargin={rightIcon ? true : false}
							fontColor={fontColor}
							disabled={disabled}
						>
							{text}
						</ButtonText>
						{rightIcon}
					</ButtonBox>
				);
			}}
		</ButtonPressable>
	);
};

export const ActionButton = ({
	text,
    onPress,
    disabled=false,
	color = "blue",
    borderRadius = "20px",
    leftIcon = null,
    rightIcon = null
}) => {

	if (color === "red") {
		return (
			<Button
				onPress={onPress}
				text={text}
				disabled={disabled}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
				borderRadius={borderRadius}
				backgroundColor={ReelayColors.reelayRed}
				pressedColor={"#63100a"}
			/>
		);
	} else if (color === 'blue') {
		return (
			<Button
				onPress={onPress}
				leftIcon={leftIcon}
				rightIcon={rightIcon}
				text={text}
				borderRadius={borderRadius}
				backgroundColor={ReelayColors.reelayBlue}
			/>
		);
	} else if (color === 'green') {
		return (
			<Button
				onPress={onPress}
				text={text}
				disabled={disabled}
				leftIcon={leftIcon}
				rightIcon={rightIcon}
				borderRadius={borderRadius}
				backgroundColor={ReelayColors.reelayGreen}
			/>
		);
	}
};

export const PassiveButton = ({
	text,
	onPress,
	disabled = false,
	borderRadius = "20px",
	leftIcon = null,
	rightIcon = null,
}) => (
	<Button
		onPress={onPress}
		text={text}
		leftIcon={leftIcon}
		rightIcon={rightIcon}
		disabled={disabled}
		borderRadius={borderRadius}
		backgroundColor={"#0B2046"}
		fontColor={"#7EAEFF"}
		pressedBorder={"solid 2px #2977EF"}
		pressedColor={"#2977EF"}
	/>
);
export const BWButton = ({
	text,
	onPress,
	disabled = false,
	borderRadius = "20px",
	white = false,
	leftIcon = null,
	rightIcon = null,
}) => (
	<Button
		onPress={onPress}
		text={text}
		leftIcon={leftIcon}
		rightIcon={rightIcon}
		disabled={disabled}
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

export const ToggleSelector = ({ displayOptions, options, selectedOption, onSelect, color }) => {
    const BackgroundBox = styled(View)`
		align-items: center;
		background-color: #252527;
		border-radius: 8px;
		justify-content: flex-start;
		flex-direction: row;
		height: 48px;
		padding: 2px;
		width: 100%;
	`;
    const ButtonContainer = styled(Pressable)`
        align-items: center;
        justify-content: center;
        height: 44px;
        width: ${100 / options.length}%;
    `
    const ActiveButtonContainer = styled(ButtonContainer)`
		background-color: ${color ?? ReelayColors.reelayBlue};
		border-radius: 6px;
	`;
    const OptionText = styled(ReelayText.Subtitle2)`
        color: white;
    `
    const PassiveButtonContainer = styled(ButtonContainer)`
        background-color: transparent;
    `

    return (
        <BackgroundBox>
            { options.map((option, index) => {
                if (option === selectedOption) {
                    return (
                        <ActiveButtonContainer key={option}>
							<OptionText>
								{ (displayOptions && displayOptions[index]) ?? option }
							</OptionText>
                        </ActiveButtonContainer>
                    );
                } else {
                    return (
                        <PassiveButtonContainer key={option}
                                onPress={() => onSelect(option)}>
                            <OptionText>
								{ (displayOptions && displayOptions[index]) ?? option }
							</OptionText>
                        </PassiveButtonContainer>
                    );
                }
            })}
        </BackgroundBox>
    );
}