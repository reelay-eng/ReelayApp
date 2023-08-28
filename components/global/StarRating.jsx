import React from 'react';
import { Pressable, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/native';
import { firebaseCrashlyticsLog, firebaseCrashlyticsError } from '../utils/EventLogger';

const faStarOutline = require('@fortawesome/free-regular-svg-icons').faStar;

const StarPressableHalf = styled(Pressable)`
    height: 100%;
    padding-left: ${props => props.onLeftSide ? 4 : 0}px;
    padding-right: ${props => props.onLeftSide ? 0 : 4}px;
    width: 50%;
`
const StarPressablesRow = styled(View)`
    align-items: center;
    flex-direction: row;
    height: ${props => props.starSize}px;
    width: ${props => props.starSize}px;
    position: absolute;
`
const StarRatingRow = styled(View)`
    align-items: center;
    justify-content: center;
    flex-direction: row;
`

export default StarRating = ({
    disabled,
    rating = 0,
    onStarRatingPress,
    starSize = 30,
    starStyle = { paddingRight: 8, borderColor: 'green', borderWidth: 1 },
}) => {
    try {
        firebaseCrashlyticsLog('Star rating section');
        const renderStar = (index) => {
            const numStars = Math.floor(rating);
            const addHalfStar = (rating - numStars) > 0.4; // floating point rounding
            const isFullStar = (numStars > index);
            const isHalfStar = (numStars === index && addHalfStar);
            const isEmptyStar = !isFullStar && !isHalfStar;
            const starIconColor = (isFullStar || isHalfStar) ? 'white' : '#c4c4c4';

            const onPressLeftHalf = () => {
                if (disabled) return;
                console.log('pressing left half: ', index);
                onStarRatingPress(index + 0.5);
            }

            const onPressRightHalf = () => {
                if (disabled) return;
                console.log('pressing right half: ', index);
                onStarRatingPress(index + 1);
            }

            // two pressables, absolute on top of star
            return (
                <View style={starStyle}>
                    {isFullStar && <FontAwesomeIcon icon={faStar} color={starIconColor} size={starSize} />}
                    {isHalfStar && <FontAwesomeIcon icon={faStarHalfStroke} color={starIconColor} size={starSize} />}
                    {isEmptyStar && <FontAwesomeIcon icon={faStarOutline} color={starIconColor} size={starSize} />}
                    <StarPressablesRow starSize={starSize}>
                        <StarPressableHalf onPress={onPressLeftHalf} onLeftSide={true} />
                        <StarPressableHalf onPress={onPressRightHalf} onLeftSide={false} />
                    </StarPressablesRow>
                </View>
            );
        }

        return (
            <StarRatingRow>
                {renderStar(0)}
                {renderStar(1)}
                {renderStar(2)}
                {renderStar(3)}
                {renderStar(4)}
            </StarRatingRow>
        );
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}