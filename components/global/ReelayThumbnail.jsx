import React, { useContext, useState } from 'react';
import { 
    Image,
    Pressable, 
    View,
} from 'react-native';

import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import * as ReelayText from "../../components/global/Text";
import { UploadContext } from '../../context/UploadContext'; 
import SplashImage from "../../assets/images/reelay-splash-with-dog.png";
import { generateThumbnail, getThumbnailURI, saveThumbnail } from '../../api/ThumbnailApi';

export default ReelayThumbnail = ({ reelay, onPress }) => {
	const GradientContainer = styled(View)`
		position: absolute;
		width: 100%;
		height: 65%;
		top: 35%;
		bottom: 0;
		left: 0;
		right: 0;
		justify-content: center;
		align-items: center;
		border-radius: 8px;
	`
	const ThumbnailContainer = styled(View)`
		justify-content: center;
		margin: 6px;
		height: 202px;
		width: 107px;
	`
	const ThumbnailImage = styled(Image)`
		border-radius: 8px;
		height: 200px;
		width: 105px;
	`
	const UsernameText = styled(ReelayText.Subtitle2)`
		padding: 5px;
		position: absolute;
		bottom: 5%;
		color: white;
	`
	const cloudfrontThumbnailSource = { uri: getThumbnailURI(reelay) };
	const [thumbnailSource, setThumbnailSource] = useState(cloudfrontThumbnailSource);
	const { s3Client } = useContext(UploadContext);

	const generateAndSaveThumbnail = async () => {
		console.log('ON ERROR TRIGGERED: ', getThumbnailURI(reelay));
		const thumbnailObj = await generateThumbnail(reelay);
		if (thumbnailObj && !thumbnailObj.error) {
			saveThumbnail(reelay, s3Client, thumbnailObj);
			setThumbnailSource({ uri: thumbnailObj?.uri });
		} else {
			setThumbnailSource(SplashImage);
		}
		return thumbnailObj;
	}

	const GradientOverlay = ({ username }) => {
		return (
			<React.Fragment>
				<ThumbnailImage 
					onError={generateAndSaveThumbnail} 
					source={thumbnailSource} 
				/>
				<GradientContainer>
					<LinearGradient
						colors={["transparent", "#0B1424"]}
						style={{
							flex: 1,
							opacity: 1,
							width: "100%",
							height: "100%",
							borderRadius: "8px",
						}}
					/>
					<UsernameText>
						{`@${ username.length > 13
							? username.substring(0, 10) + "..."
							: username
						}`}
					</UsernameText>
				</GradientContainer>
			</React.Fragment>
		)
	}

	return (
		<Pressable key={reelay.id} onPress={onPress}>
			<ThumbnailContainer>
				<GradientOverlay username={reelay?.creator?.username} />
			</ThumbnailContainer>
		</Pressable>
	);
};
