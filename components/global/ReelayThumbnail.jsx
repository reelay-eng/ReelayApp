import React, { useContext, useState } from 'react';
import { 
    Image,
    Pressable, 
    View,
} from 'react-native';

import styled from 'styled-components/native';
import { LinearGradient } from "expo-linear-gradient";
import * as ReelayText from "../../components/global/Text";
import SplashImage from "../../assets/images/reelay-splash-with-dog.png";
import { generateThumbnail, getThumbnailURI, saveThumbnail } from '../../api/ThumbnailApi';
import ProfilePicture from './ProfilePicture';
import { useSelector } from 'react-redux';

export default ReelayThumbnail = ({ reelay, onPress, height = 200, margin = 6, width = 105 }) => {
	const CreatorLineContainer = styled(View)`
        align-items: center;
        flex-direction: row;
        margin-left: 5px;
        bottom: 0px;
        position: absolute;
    `
    const GradientContainer = styled(View)`
		position: absolute;
		border-radius: 8px;
		width: 100%;
		height: 65%;
		top: 35%;
		justify-content: center;
	`
	const ThumbnailContainer = styled(View)`
		justify-content: center;
		margin: ${margin}px;
	`
	const ThumbnailImage = styled(Image)`
		border-radius: 8px;
		height: ${height}px;
		width: ${width}px;
	`
	const UsernameText = styled(ReelayText.Subtitle2)`
        font-size: 12px;
		padding: 5px;
		color: white;
	`
	const cloudfrontThumbnailSource = { uri: getThumbnailURI(reelay) };
	const [thumbnailSource, setThumbnailSource] = useState(cloudfrontThumbnailSource);
	const s3Client = useSelector(state => state.s3Client);

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
                    <CreatorLine username={username} />
				</GradientContainer>
			</React.Fragment>
		)
	}

    const CreatorLine = ({ username}) => {
        const condensedUsername = (username.length > 10)
            ? username.substring(0, 10) + "..."
            : username;
        
        
        return (
            <CreatorLineContainer>
                <ProfilePicture user={reelay?.creator} size={24} border  />
                <UsernameText>
                    {`@${condensedUsername}`}
                </UsernameText>
            </CreatorLineContainer>
        );
    }

	return (
		<Pressable key={reelay.id} onPress={onPress}>
			<ThumbnailContainer>
				<GradientOverlay username={reelay?.creator?.username} />
			</ThumbnailContainer>
		</Pressable>
	);
};
