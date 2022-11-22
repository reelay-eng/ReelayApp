import React, { Fragment, useEffect, useState } from 'react';
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

// Media
import GRating from "../../assets/images/MPAA_Ratings/GRating.png";
import PGRating from "../../assets/images/MPAA_Ratings/PGRating.png";
import PG13Rating from "../../assets/images/MPAA_Ratings/PG13Rating.png";
import NC17Rating from "../../assets/images/MPAA_Ratings/NC17Rating.png";
import RRating from "../../assets/images/MPAA_Ratings/RRating.png";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClapperboard, faStar } from '@fortawesome/free-solid-svg-icons';

const ArtistBadgeView = styled(View)`
    align-items: center;
    border-radius: 8px;
    justify-content: center;
    margin-right: 8px;
    padding: 4px;
    display: flex;
    flex-direction: row;
`
const ArtistRow = styled(View)`
    align-items: center;
    flex-direction: row;
    padding-top: 12px;
`
const ArtistText = styled(ReelayText.CaptionEmphasized)`
    color: white;
    height: 16px;
`
const DescriptionText = styled(ReelayText.Body1)`
	color: white;
	opacity: 1;
`
const MIExternalView = styled(View)`
	margin-right: 4%;
	margin-left: 4%;
	border-radius: 16px;
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

export default MovieInformation = ({ titleObj }) => {
	const description = titleObj?.overview;	
	const displayActors = titleObj?.displayActors;
	const rating = titleObj?.rating;
	const showRating = rating && Object.keys(ratingSources).includes(rating);

	const ActorLine = () => {
        const actorName0 = displayActors[0]?.name;
        const actorName1 = displayActors[1]?.name;
        if (!actorName0) return <View />;

        return (
            <ArtistRow>
                <FontAwesomeIcon icon={faStar} color='white' size={18} />
                <ArtistBadgeView>
                    <ArtistText>{actorName0}</ArtistText>
                </ArtistBadgeView>
                { actorName1 && (
                    <Fragment>
                        <FontAwesomeIcon icon={faStar} color='white' size={18} />
                        <ArtistBadgeView>
                            <ArtistText>{actorName1}</ArtistText>
                        </ArtistBadgeView>
                    </Fragment>
                )}
            </ArtistRow>
        );
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

	const DirectorLine = () => {
        const directorName = titleObj?.director?.name;
        if (!directorName) return <View />;
        return (
            <ArtistRow>
                <FontAwesomeIcon icon={faClapperboard} color='white' size={18} />
                <ArtistBadgeView>
                    <ArtistText>{directorName}</ArtistText>
                </ArtistBadgeView>
            </ArtistRow>
        );
    }        
	
    return (
		<MIExternalView>
			<MIInternalView>
				{description?.length > 0 && (
					<>
						<DescriptionCollapsible description={description} />
						<Spacer height={12} />
					</>
				)}
				<DirectorLine />
				<ActorLine />
				{showRating && (
					<>
						<Spacer height={24} />
						<RatingView>
							<RatingImage source={ratingSources[rating]} />
						</RatingView>
					</>
				)}
			</MIInternalView>
		</MIExternalView>
	);
}
