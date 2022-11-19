import React, { useEffect, useState } from 'react';
import { 
    Image,
    Pressable, 
    Text, 
    View,
} from 'react-native';

// Styling
import ReelayColors from "../../constants/ReelayColors";
import styled from 'styled-components/native';

// Components
import * as ReelayText from "../../components/global/Text";
import { DirectorBadge, ActorBadge } from "../../components/global/Badges";

// Media
import GRating from "../../assets/images/MPAA_Ratings/GRating.png";
import PGRating from "../../assets/images/MPAA_Ratings/PGRating.png";
import PG13Rating from "../../assets/images/MPAA_Ratings/PG13Rating.png";
import NC17Rating from "../../assets/images/MPAA_Ratings/NC17Rating.png";
import RRating from "../../assets/images/MPAA_Ratings/RRating.png";

const ActorBadgesView = styled(View)`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
`
const BadgeWrapper = styled(View)`
	align-self: flex-start;
`
const DescriptionText = styled(ReelayText.Body1)`
	color: white;
	opacity: 1;
`
const HeadingText = styled(ReelayText.H5Emphasized)`
	color: white;
`
const MIExternalView = styled(View)`
	margin-right: 4%;
	margin-left: 4%;
	border-radius: 8px;
	background-color: #191919;
`
const MIInternalView = styled(View)`
	display: flex;
	flex-direction: column;
	margin-left: 20px;
	margin-right: 20px;
	margin-bottom: 30px;
	margin-top: 30px;
`
const MoreButton = styled(Pressable)`
	margin-top: -3px;
`
const MoreText = styled(ReelayText.Subtitle1Emphasized)`
	color: ${ReelayColors.reelayBlue};
`
const RatingView = styled(View)`
	display: flex;
	flex-direction: row;
	align-items: flex-start;
`
const RatingImage = styled(Image)`
	width: 58px;
	height: 36px;
`
let ratingSources = {
	"PG-13": PG13Rating,
	"G": GRating,
	"PG": PGRating,
	"R": RRating,
	"NC-17": NC17Rating
}

const Spacer = styled(View)`
	height: ${(props) => props.height}px;
`


const tmdbImageApiBaseUrl = `http://image.tmdb.org/t/p/w500/`;

export default MovieInformation = ({ description, director, actors, rating }) => {
	const showRating = rating && Object.keys(ratingSources).includes(rating);
	const showNoInformation = (
		!rating && 
		!(Object.keys(ratingSources).includes(rating)) && 
		!(actors?.length > 0) && 
		!director && 
		!(description?.length > 0)
	);

	const ActorBadgeWrapper = ({ actor }) => {
		const photoURL = actor?.profile_path 
			? `${tmdbImageApiBaseUrl}${actor?.profile_path}` 
			: null;
		return (
			<BadgeWrapper>
				<ActorBadge
					text={actor.name}
					photoURL={photoURL}
				/>
			</BadgeWrapper>
		)
	}

    const DescriptionCollapsible = ({description}) => {
        const [descriptionIsCut, setDescriptionIsCut] = useState(true);
		const [moreShouldBeVisible, setMoreShouldBeVisible] = useState(true);
		const minCharsToDisplayMore = 215;

        useEffect(() => {
            if (description.length < minCharsToDisplayMore) setMoreShouldBeVisible(false);
        }, [])

        return (
			<Text>
				<DescriptionText>
					{descriptionIsCut
						? description.length >= minCharsToDisplayMore
							? description.substring(0, minCharsToDisplayMore) + "...  "
							: description + "  "
						: description + "  "}
				</DescriptionText>
				{moreShouldBeVisible && (
					<MoreButton onPress={() => setDescriptionIsCut(!descriptionIsCut)}>
						<MoreText>{descriptionIsCut ? "See More" : "See Less"}</MoreText>
					</MoreButton>
				)}
			</Text>
		);
    }
	
    return (
		<MIExternalView>
			<MIInternalView>
				{description?.length > 0 && (
					<>
						<Spacer height={10} />
						<DescriptionCollapsible description={description} />
						<Spacer height={30} />
					</>
				)}
				{director && (
					<>
						<HeadingText>Director</HeadingText>
						<BadgeWrapper>
							<DirectorBadge text={director} />
						</BadgeWrapper>
						<Spacer height={30} />
					</>
				)}
				{actors?.length > 0 && (
					<>
						<HeadingText>Cast</HeadingText>
						<ActorBadgesView>
							{ actors.map(actor => <ActorBadgeWrapper actor={actor} key={actor.name} /> )}
						</ActorBadgesView>
						<Spacer height={30} />
					</>
				)}
				{showRating && (
					<>
						<HeadingText>Rated</HeadingText>
						<Spacer height={10} />
						<RatingView>
							<RatingImage source={ratingSources[rating]} />
						</RatingView>
					</>
				)}
				{showNoInformation && (
					<HeadingText>No Information Found</HeadingText>
				)}
			</MIInternalView>
		</MIExternalView>
	);
}
