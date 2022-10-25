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
import ClubPicture from '../global/ClubPicture';

const ClubOrProfilePicContainer = styled(View)`
	margin-right: 8px;
`
const ClubOrProfileLineView = styled(View)`
	align-items: center;
	flex-direction: row;
	margin-bottom: 8px;
	z-index: 100;
`
const DescriptionContainer = styled(Pressable)`
	align-items: center;
	flex-direction: row;
	padding-bottom: 8px;
	padding-right: 15px;
	z-index: 1;
`
const DescriptionText = styled(ReelayText.Caption)`
	color: white;
	line-height: 20px;
	text-shadow-color: rgba(0, 0, 0, 0.5);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`
const InfoView = styled(View)`
	bottom: 86px;
	justify-content: flex-end;
	margin-left: 15px;
	position: absolute;
	width: 80%;
`
const MentionButton = styled(TouchableOpacity)`
	position: relative;
	margin-bottom: -3px;
`
const MentionTextStyle = {
	alignItems: 'flex-end',
	color: ReelayColors.reelayBlue,
	fontFamily: "Outfit-Regular",
	fontSize: 14,
	fontStyle: "normal",
	letterSpacing: 0.25,
	lineHeight: 20,
	textShadowColor: 'rgba(0, 0, 0, 0.5)',
	textShadowOffset: { width: 1, height: 1 },
	textShadowRadius: 1,
}

const StarRatingContainer = styled(View)`
	align-items: center;
	flex-direction: row;
	padding-bottom: 8px;
	z-index: 90;
`
const UsernameText = styled(ReelayText.Subtitle1Emphasized)`
	color: white;
	margin-right: 8px;
	text-shadow-color: rgba(0, 0, 0, 0.5);
    text-shadow-offset: 1px 1px;
    text-shadow-radius: 1px;
`

const ReelayInfo = ({ clubStub, feedSource, navigation, reelay }) => {
	const creator = reelay.creator;
	const description = reelay.description ? reelay.description: "";
	const mentionType = { trigger: '@' };
	const descriptionPartsWithMentions = (description.length > 0) 
		? parseValue(description, [mentionType]) 
		: { parts: [] };
	
	const showClubLine = (clubStub && feedSource === 'discover');
	const starRating = reelay.starRating + (reelay.starRatingAddHalf ? 0.5 : 0);

	const ClubLine = () => {
		// todo: add join button ?
		const goToClub = () => { 
			// todo: after refactoring all the club state, screens, and components
		}	

		return (
			<Pressable style={{zIndex: 100}} onPress={goToClub}>
				<ClubOrProfileLineView>
					<ClubOrProfilePicContainer>
						<ClubPicture border club={clubStub} navigation={navigation} size={30} />
					</ClubOrProfilePicContainer>
					<UsernameText>{clubStub?.name}</UsernameText>
				</ClubOrProfileLineView>
			</Pressable>
		);
	}

	const CreatorLine = () => {
		const goToProfile = () => {
			navigation.push('UserProfileScreen', { creator });
			logAmplitudeEventProd('viewProfile', { 
				creator: creator.username,
				reelayId: reelay.id,
				source: 'reelayInfo',
			});
		}	
	
		return (
			<Pressable style={{zIndex: 100}} onPress={goToProfile}>
				<ClubOrProfileLineView>
					{ !showClubLine && (
						<ClubOrProfilePicContainer>
							<ProfilePicture navigation={navigation} border circle user={creator} size={30} />
						</ClubOrProfilePicContainer>
					)}
					<UsernameText>{creator?.username}</UsernameText>
					<FollowButton creator={creator} />
				</ClubOrProfileLineView>
			</Pressable>
		);
	}

	const StarRatingLine = () => {
		return (
			<StarRatingContainer>
				<StarRating 
					disabled={true}
					rating={starRating}
					starSize={20}
					starStyle={{ paddingRight: 4 }}
				/>
			</StarRatingContainer>
		);
	}

	return (
		<InfoView>
			{ showClubLine && <ClubLine /> }
			<CreatorLine />
			{ (starRating > 0) && <StarRatingLine /> }
			{ (description.length > 0) && 
				<Description partsWithMentions={descriptionPartsWithMentions} />
			}
		</InfoView>
	);
};

const Description = ({ partsWithMentions }) => {
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

	const renderDescriptionPart = (descriptionPart, index) => {
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
				{ partsWithMentions.parts.map(renderDescriptionPart) }
			</DescriptionText>
		</DescriptionContainer>
	)
}

export default ReelayInfo;