import React, { memo, useContext, useState } from 'react';
import { Pressable, TouchableOpacity, Text, View } from 'react-native';
import * as ReelayText from '../global/Text';
import ProfilePicture from '../global/ProfilePicture';
import StarRating from 'react-native-star-rating';
import { isMentionPartType, parseValue } from 'react-native-controlled-mentions';

import styled from 'styled-components/native';
import { logAmplitudeEventProd } from '../utils/EventLogger';
import FollowButton from '../global/FollowButton';

const ReelayInfo = ({ navigation, reelay }) => {
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
	`
	const ProfilePicContainer = styled(View)`
		margin-right: 8px;
	`
	const Username = styled(ReelayText.Subtitle1Emphasized)`
		color: white;
		margin-right: 8px;
	`
	const DescriptionContainer = styled(Pressable)`
		align-items: center;
		flex-direction: row;
		margin-top: 6px;
		margin-bottom: 6px;
	`
	const DescriptionText = styled(ReelayText.Caption)`
		color: white;
		line-height: 20px;
	`
	const MentionButton = styled(TouchableOpacity)`
		position: relative;
		margin-bottom: -3px;
	`
	const StarRatingContainer = styled(View)`
		margin-top: 8px;
		flex-direction: row;
		align-items: center;
		width: 10%;
	`
	const creator = reelay.creator;
	const description = reelay.description ? reelay.description: "";
	const mentionType = { trigger: '@' };
	const [expanded, setExpanded] = useState(false);
	const descriptionPartsWithMentions = (description.length > 0) 
		? parseValue(description, [mentionType]) 
		: { parts: [] };
		
	const isMention = (part) => (part.partType && isMentionPartType(part.partType));
	const starRating = reelay.starRating + (reelay.starRatingAddHalf ? 0.5 : 0);

    const advanceToMentionProfile = (mentionData) => {
        const mentionUser = {
            sub: mentionData.id,
            username: mentionData.name,
        }
        navigation.push('UserProfileScreen', { creator: mentionUser });
    }

	const goToProfile = () => {
		navigation.push('UserProfileScreen', { creator });
		logAmplitudeEventProd('viewProfile', { 
			creator: creator.username,
			reelayId: reelay.id,
			source: 'reelayInfo',
		});
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

	const renderDescriptionPart = (descriptionPart, index) => {
        if (isMention(descriptionPart)) {
            return (
                <MentionButton key={index} onPress={() => advanceToMentionProfile(descriptionPart.data)}>
                    <Text style={MentionTextStyle}>{descriptionPart.text}</Text>
                </MentionButton>
            );
        }

        return (
            <DescriptionText key={index}>
                {descriptionPart.text}
            </DescriptionText>
        );
    }

	const expandDescription = () => {
		setExpanded(!expanded);
	}

	return (
		<InfoView>
			<Pressable onPress={goToProfile}>
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
					emptyStarColor={'#c4c4c4'}
					maxStars={5}
					fullStarColor={'white'}
					halfStarEnabled={true}
					rating={starRating}
					starSize={20}
					starStyle={{ paddingRight: 4 }}
				/>
			</StarRatingContainer>}

			{(description.length > 0) && 
				<DescriptionContainer onPress={expandDescription}>
					<DescriptionText numberOfLines={(expanded) ? 0 : 1} ellipsizeMode='tail'>
						{ descriptionPartsWithMentions.parts.map(renderDescriptionPart) }
					</DescriptionText>
				</DescriptionContainer>
			}
		</InfoView>
	);
};

export default memo(ReelayInfo, (prevProps, nextProps) => {
	return (prevProps.reelay.datastoreSub === nextProps.reelay.datastoreSub);
});
