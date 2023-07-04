import React from "react";
import { View, Pressable, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import styled from "styled-components/native";
import * as ReelayText from "./Text";
import ReelayColors from "../../constants/ReelayColors";

const BackButtonPressable = styled(TouchableOpacity)`
	margin-top: -6px;
	margin-bottom: -6px;
	padding: 6px;
`
const HeaderView = styled(View)`
	align-items: center;
	flex-direction: row;
	margin-top: 6px;
	margin-left: 12px;
	margin-bottom: 12px;
	width: 100%;
`
const HeaderText = styled(ReelayText.H5Bold)`
	color: white;
	font-size: 24px;
	line-height: 24px;
	margin-top: 2px;
	text-align: left;
`
const HeaderTextLight = styled(ReelayText.H5)`
	color: white;
	font-size: 24px;
	line-height: 24px;
	margin-top: 2px;
	text-align: left;
`

export const HeaderWithBackButton = ({ 
	navigation, 
	onPressOverride,
	text = "Settings", 
	light=false,
	checkMark = false,
	onDone,
	size=24
}) => {
	const onPress = onPressOverride ?? navigation?.goBack;
	return (
		<>
			<HeaderView>
				<BackButtonPressable onPress={onPress}>
					<Icon type="ionicon" name="arrow-back-outline" color="white" size={size} />
				</BackButtonPressable>
				{ light && <HeaderTextLight>{text}</HeaderTextLight> }
				{ !light && <HeaderText>{text}</HeaderText> }
				{checkMark ?<Pressable style={{position:"absolute",right:30}} onPress={onDone}>
					<Icon type='ionicon' name='checkmark-circle' color={ReelayColors.reelayBlue} style={{fontWeight:"bold"}} size={size} />
				</Pressable>:null}
			</HeaderView>
		</>
	);
};

const CancelHeaderView = styled(View)`
	width: 100%;
	padding-left: 15px;
	padding-right: 15px;
	padding-top: 10px;
	padding-bottom: 10px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`
const CancelHeaderText = styled(ReelayText.H6Emphasized)`
	text-align: center;
	color: white;
`
const CancelText = styled(ReelayText.Subtitle1Emphasized)`
	color: white;
	opacity: 0.9;
`
const SkipText = styled(ReelayText.Subtitle1Emphasized)`
	color: white;
`
const Divider = styled(View)`
	border-bottom-width: 1px;
	border-color: white;
	opacity: 0.1;
`
const DoneText = styled(ReelayText.Subtitle1Emphasized)`
	color: ${ReelayColors.reelayBlue};
`

export const HeaderDoneCancel = ({ onDone, onCancel, text = "Settings", withBar=false}) => {
	return (
		<>
			<CancelHeaderView>
				<Pressable onPress={onCancel}>
					<CancelText>Cancel</CancelText>
				</Pressable>
				<CancelHeaderText>{text}</CancelHeaderText>
				<Pressable onPress={onDone}>
					<DoneText>Done</DoneText>
				</Pressable>
			</CancelHeaderView>
			{withBar && <Divider />}
		</>
	);
};


export const HeaderSkipBack = ({ onPressOverride, onSkip, text = "Settings", light = false, size=32}) => {
	return (
		<>
			<HeaderView>
				<BackButtonPressable onPress={onPressOverride}>
					<Icon type="ionicon" name="arrow-back-outline" color="white" size={size} />
				</BackButtonPressable>
				{ light && <HeaderTextLight>{text}</HeaderTextLight> }
				{ !light && <HeaderText>{text}</HeaderText> }
				<Pressable  style={{position:"absolute",right:30}} onPress={onSkip}>
					<SkipText>Skip</SkipText>
				</Pressable>
			</HeaderView>
		</>
	);
};
