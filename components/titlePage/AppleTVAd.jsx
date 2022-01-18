import React from 'react';
import { Image, Linking, View } from 'react-native';
import { BWButton } from "../../components/global/Buttons";
import * as ReelayText from "../../components/global/Text";
import styled from 'styled-components/native';

import AppleTVAdBackground from "../../assets/images/AppleTVAdBackground.png";
import AppleTVIcon from "../../assets/icons/venues/appletv.png";
import { logAmplitudeEventProd } from '../utils/EventLogger';

export default AppleTVAd = () => {
	const Container = styled(View)`
		width: 100%;
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	`
	const AdContainer = styled(View)`
		width: 350px;
		height: 400px;
	`
	const AdBackground = styled(Image)`
		width: 100%;
		height: 100%;
		border-radius: 8px;
	`
	const AdInfoContainer = styled(View)`
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
	`;
	const AppleTVIconContainer = styled(Image)`
		width: 64px;
		height: 64px;
		border-radius: 32px;
		borderColor: white;
		borderWidth: 2px;
		margin-bottom: 20px;
	`
	const AppleTVText = styled(ReelayText.H5)`
		width: 80%;
		text-align: center;
		color: white;
		opacity: 0.9;
		margin-bottom: 25px;
		line-height: 30px;
	`
	const AppleTVHighlightSpan = styled(ReelayText.H5)`
		color: #CF5CCB;
	`
	const AppleTVButtonContainer = styled(View)`
		width: 90%;
		height: 40px;
		margin-bottom: 20px;
	`

	const handleAppleTVAdPress = () => {
		logAmplitudeEventProd('appleTVAdClicked', {
			username: '',
		});
		Linking.openURL('https://www.apple.com/tv/');
	}

	return (
		<Container>
			<AdContainer>
				<AdBackground source={AppleTVAdBackground} />
				<AdInfoContainer>
					<AppleTVIconContainer source={AppleTVIcon} />
					<AppleTVText>
						Sign up for Apple TV. {"\n"}
						Get 25,000 movies {"\n"}
						and TV shows for <AppleTVHighlightSpan>free.</AppleTVHighlightSpan>
					</AppleTVText>
					<AppleTVButtonContainer>
						<BWButton
							white
							text="More Details"
							onPress={(handleAppleTVAdPress)}
						/>
					</AppleTVButtonContainer>
				</AdInfoContainer>
			</AdContainer>
		</Container>
	);
}
