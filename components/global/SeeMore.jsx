import React from 'react';
import { 
    Pressable, 
    View,
} from 'react-native';

import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import * as ReelayText from "../../components/global/Text";

export default SeeMore = ({ reelay, onPress, height = 200, width = 105 }) => {
    const GradientContainer = styled(View)`
		position: absolute;
		border-radius: 8px;
		width: 100%;
		height: 100%;
		justify-content: center;
	`
	const SeeMoreContainer = styled(View)`
        align-items: center;
		justify-content: center;
        height: ${height}px;
        width: ${width}px;
	`
    const SeeMoreText = styled(ReelayText.H5)`
        color: white;
    `

	const GradientOverlay = () => {
		return (
			<React.Fragment>
				<GradientContainer>
					<LinearGradient
						colors={["#36454F", "#0B1424"]}
						style={{
							flex: 1,
							opacity: 0.7,
							width: "100%",
							height: "100%",
							borderRadius: "8px",
						}}
					/>
				</GradientContainer>
				<SeeMoreText> {'See More...'} </SeeMoreText>
			</React.Fragment>
		)
	}

	return (
		<Pressable key={reelay.id} onPress={onPress}>
			<SeeMoreContainer>
				<GradientOverlay />
			</SeeMoreContainer>
		</Pressable>
	);
};
