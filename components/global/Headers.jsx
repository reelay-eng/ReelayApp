import React from "react";
import { View, Pressable } from "react-native";
import { Icon } from "react-native-elements";
import styled from "styled-components/native";
import * as ReelayText from "./Text";

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
