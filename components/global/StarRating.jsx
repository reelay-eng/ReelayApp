import React from 'react';
import { Pressable, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/native';

const faStarOutline = require('@fortawesome/free-regular-svg-icons').faStar;

const StarPressableHalf = styled(Pressable)`
    height: 100%;
    position: absolute;
    width: 50%;
`
const StarPressablesRow = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
`
const StarRatingRow = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
`

export default StarRating = ({
    disabled,
    rating=0,
    onStarRatingPress,
    starSize=30,
    starStyle={ paddingRight: 8 },
}) => {
    const renderStar = (index) => {
        const numStars = Math.floor(rating);
        const addHalfStar = (rating - numStars) > 0.4; // floating point rounding
        const isFullStar = (numStars > index);
        const isHalfStar = (numStars === index && addHalfStar);
        const isEmptyStar = !isFullStar && !isHalfStar;
        const starIconColor = (isFullStar || isHalfStar) ? 'white' : '#c4c4c4';

        const onPressLeftHalf = () => {
            if (disabled) return;
            onStarRatingPress(index + 0.5);
        }

        const onPressRightHalf = () => {
            if (disabled) return;
            onStarRatingPress(index + 1);
        }

        // two pressables, absolute on top of star

        return (
            <View style={starStyle}>
                { isFullStar && <FontAwesomeIcon icon={faStar} color={starIconColor} size={starSize} /> }
                { isHalfStar && <FontAwesomeIcon icon={faStarHalfStroke} color={starIconColor} size={starSize} /> }
                { isEmptyStar && <FontAwesomeIcon icon={faStarOutline} color={starIconColor} size={starSize} /> }
                <StarPressablesRow>
                    <StarPressableHalf onPress={onPressLeftHalf} />
                    <StarPressableHalf onPress={onPressRightHalf} />
                </StarPressablesRow>
            </View>
        );
    }

    return (
        <StarRatingRow>
            { renderStar(0) }
            { renderStar(1) }
            { renderStar(2) }
            { renderStar(3) }
            { renderStar(4) }
        </StarRatingRow>
    );
}