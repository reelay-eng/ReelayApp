import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { LinearGradient } from "expo-linear-gradient";

import styled from 'styled-components/native';
import ReelayThumbnail from './ReelayThumbnail';
import * as ReelayText from "../../components/global/Text";
import TitlePoster from './TitlePoster';

export default SeeMore = ({ reelay, display='thumbnail', onPress, height = 200, width = 105 }) => {
    const GradientContainer = styled(View)`
		position: absolute;
		border-radius: 8px;
		width: 100%;
		height: 100%;
		justify-content: center;
	`
	const IconContainer = styled(View)`
		margin: 10px;
	`
	const SeeMoreContainer = styled(View)`
        align-items: center;
		justify-content: center;
        height: ${height}px;
        width: ${width}px;
	`
    const SeeMoreText = styled(ReelayText.CaptionEmphasized)`
        color: white;
    `

	const GradientOverlay = () => {
		return (
			<React.Fragment>
				<GradientContainer>
				{ display === 'thumbnail' &&
					<ReelayThumbnail 
						height={height} 
						margin={0}
						onPress={onPress} 
						reelay={reelay} 
						showIcons={false}
						width={width} 
					/>
				}
				{ display === 'poster' &&
					<React.Fragment>
						<TitlePoster title={reelay?.title} width={width} />
						<LinearGradient
							colors={["transparent", "#0B1424"]}
							style={{
								opacity: 1,
								width: width,
								height: height,
								borderRadius: 6,
								position: 'absolute',
							}}
						/>
					</React.Fragment>
				}
				</GradientContainer>
				<IconContainer>
					<Icon type='ionicon' name='caret-forward-circle' size={24} color='white' />
				</IconContainer>
				<SeeMoreText> {'See More'} </SeeMoreText>
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
