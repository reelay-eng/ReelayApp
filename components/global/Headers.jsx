import React from "react";
import { View, Pressable } from "react-native";
import { Icon } from "react-native-elements";
import styled from "styled-components/native";
import * as ReelayText from "./Text";
import ReelayColors from "../../constants/ReelayColors";


export const HeaderWithBackButton = ({ navigation, text = "Settings" }) => {
	const HeaderContainer = styled(View)`
		width: 100%;
		padding: 20px;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
	`;
	const HeaderText = styled(ReelayText.H5Emphasized)`
		text-align: left;
		color: white;
		margin-top: 4px;
		width: 90%;
	`;
	const BackButton = styled(Pressable)`
		margin-right: 20px;
	`;
	return (
		<>
			<HeaderContainer>
				<BackButton onPress={() => navigation.goBack()}>
					<Icon type="ionicon" name="arrow-back-outline" color="white" size={24} />
				</BackButton>
				<HeaderText>{text}</HeaderText>
			</HeaderContainer>
		</>
	);
};

export const HeaderDoneCancel = ({ onDone, onCancel, text = "Settings", withBar=false}) => {
	const HeaderContainer = styled(View)`
		width: 100%;
		padding-left: 15px;
		padding-right: 15px;
		padding-top: 10px;
		padding-bottom: 10px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	`;
	const HeaderText = styled(ReelayText.H5Emphasized)`
		text-align: center;
		color: white;
	`;
	const Divider = styled(View)`
		border-bottom-width: 1px;
		border-color: white;
		opacity: 0.1;
	`
	const DoneText = styled(ReelayText.H6)`
		color: ${ReelayColors.reelayBlue};
	`
	const CancelText = styled(ReelayText.H6)`
		color: white;
		opacity: 0.9;
	`
	return (
		<>
			<HeaderContainer>
				<Pressable onPress={onCancel}>
					<CancelText>Cancel</CancelText>
				</Pressable>
				<HeaderText>{text}</HeaderText>
				<Pressable onPress={onDone}>
					<DoneText>Done</DoneText>
				</Pressable>
			</HeaderContainer>
			{withBar && <Divider />}
		</>
	);
};
