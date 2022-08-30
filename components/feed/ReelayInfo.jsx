import React, { memo, useContext, useState } from 'react';
import { Pressable, TouchableOpacity, Text, View, Dimensions } from 'react-native';
import * as ReelayText from '../global/Text';
import ProfilePicture from '../global/ProfilePicture';
import StarRating from '../global/StarRating';
import { isMentionPartType, parseValue } from 'react-native-controlled-mentions';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import FollowButton from '../global/FollowButton';

import { LinearGradient } from "expo-linear-gradient";

import { animate } from "../../hooks/animations";

const InfoView = styled(View)`
		justify-content: flex-end;
		position: absolute;
		bottom: 86px;
		margin-left: 15px;
		width: 80%;
	`
	const PostInfo = styled(View)`
		flex-direction: row;
		align-items: center;
		z-index: 100;
	`
	const ProfilePicContainer = styled(View)`
		margin-right: 8px;
	`
	const Username = styled(ReelayText.Subtitle1Emphasized)`
		color: white;
		margin-right: 8px;
	`
	const StarRatingContainer = styled(View)`
		margin-top: 8px;
		flex-direction: row;
		align-items: center;
		z-index: 90;
	`

const ReelayInfo = ({ navigation, reelay }) => {
	const creator = reelay.creator;
	const description = reelay.description ? reelay.description: "";
	const mentionType = { trigger: '@' };
	const descriptionPartsWithMentions = (description.length > 0) 
		? parseValue(description, [mentionType]) 
		: { parts: [] };
		
	const starRating = reelay.starRating + (reelay.starRatingAddHalf ? 0.5 : 0);

	const goToProfile = () => {
		navigation.push('UserProfileScreen', { creator });
		logAmplitudeEventProd('viewProfile', { 
			creator: creator.username,
			reelayId: reelay.id,
			source: 'reelayInfo',
		});
	}	

	return (
		<InfoView>
			<Pressable style={{zIndex: 100}} onPress={goToProfile}>
				<PostInfo>
					<ProfilePicContainer>
						<ProfilePicture navigation={navigation} border circle user={creator} size={30} />
					</ProfilePicContainer>
					<Username>@{creator?.username}</Username>
					<FollowButton creator={creator} />
				</PostInfo>
			</Pressable>

			{(starRating>0) && <StarRatingContainer>
				<StarRating 
					disabled={true}
					rating={starRating}
					starSize={20}
					starStyle={{ paddingRight: 4 }}
				/>
			</StarRatingContainer>}

			{(description.length > 0) && 
				<Description descriptionPartsWithMentions={descriptionPartsWithMentions} navigation={navigation} />
			}
		</InfoView>
	);
};

const DescriptionContainer = styled(Pressable)`
	align-items: center;
	flex-direction: row;
	padding-top: 8px;
	padding-bottom: 8px;
	padding-right: 15px;
	z-index: 1;
`
const DescriptionText = styled(ReelayText.Caption)`
	color: white;
	line-height: 20px;
`
const MentionButton = styled(TouchableOpacity)`
	position: relative;
	margin-bottom: -3px;
`

const Description = ({ descriptionPartsWithMentions, navigation }) => {
	const [expanded, setExpanded] = useState(false);
	const [componentDimensions, setComponentDimensions] = useState({});
	const expandDescription = () => {
		animate(100, "linear", "opacity")
		setExpanded(prev => !prev)
	}

	const isMention = (part) => (part.partType && isMentionPartType(part.partType));

	const advanceToMentionProfile = (mentionData) => {
        const mentionUser = {
            sub: mentionData.id,
            username: mentionData.name,
        }
        navigation.push('UserProfileScreen', { creator: mentionUser });
    }

	const MentionTextStyle = {
		alignItems: 'flex-end',
		color: ReelayColors.reelayBlue,
		fontFamily: "Outfit-Regular",
		fontSize: 14,
		fontStyle: "normal",
		letterSpacing: 0.25,
		lineHeight: 20
	}

	const renderDescriptionPart = ({ descriptionPart, index }) => {
        if (isMention(descriptionPart)) {
            if (expanded || (descriptionPart.position.end < 50)) { // Forgive me father, for I have sinned.
				return (
					<MentionButton key={index} onPress={() => advanceToMentionProfile(descriptionPart.data)}>
						<Text style={MentionTextStyle}>{descriptionPart.text}</Text>
					</MentionButton>
				);
			}
        }

        return (
            <DescriptionText key={index}>
                {descriptionPart.text}
            </DescriptionText>
        );
    }

	const gradientWidth = Dimensions.get('window').width;
	const gradientHeight = componentDimensions.height + 200;

	const DescriptionGradient = styled(LinearGradient)`
		position: absolute;
		margin-top: auto;
		left: -15px;
		opacity: 0.5;
		height: ${gradientHeight}px;
		width: ${gradientWidth}px;
	`

	const onLayout = (event) => {
		const {height, width} = event.nativeEvent.layout;
		setComponentDimensions({height, width});
	}

	return (
		<DescriptionContainer onPress={expandDescription} onLayout={onLayout}>
			{(expanded) && (
                <DescriptionGradient colors={["transparent", "#000000", "transparent"]}>
                    <Pressable style={{width: '100%', height: '100%', position: 'relative' }} onPress={() => setExpanded(false)} />
                </DescriptionGradient>
                )
            }
			<DescriptionText numberOfLines={(expanded) ? 0 : 1} ellipsizeMode='tail'>
				{ descriptionPartsWithMentions.parts.map((descriptionPart, index) => {
					return renderDescriptionPart({ descriptionPart, index })
				}) }
			</DescriptionText>
		</DescriptionContainer>
	)
}

export default memo(ReelayInfo, (prevProps, nextProps) => {
	return (prevProps.reelay.datastoreSub === nextProps.reelay.datastoreSub);
});
