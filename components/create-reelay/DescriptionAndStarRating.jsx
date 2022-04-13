import React, { useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import StarRating from 'react-native-star-rating';
import { useDispatch, useSelector } from 'react-redux';

import { Dimensions, SafeAreaView, Pressable, TextInput, View } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import TextInputWithMentions from '../feed/TextInputWithMentions';
import styled from 'styled-components/native';

const { height, width } = Dimensions.get('window');

const InfoContainer = styled(SafeAreaView)`
    align-items: flex-start;
    justify-content: center;
    margin-top: 15px;
    margin-bottom: 15px;
    width: 100%;
`
const RatingText = styled(ReelayText.Subtitle1)`
    color: #c4c4c4;
    text-align: left;
    margin-bottom: 8px;
    margin-left: 12px;
`
const ClearRatingText = styled(ReelayText.Subtitle1)`
    color: #c4c4c4;
    font-size: 15px;
    text-align: right;
`
const ClearRatingContainer = styled(Pressable)`
    align-items: center;
    justify-content: center;
    padding: 3px;
    width: 25%;
`
const DescriptionInput = styled(TextInput)`
    color: white;
    font-family: Outfit-Regular;
    font-size: 16px;
    font-style: normal;
    letter-spacing: 0.15px;
    padding: 10px;
    width: 100%;
`
const DescriptionInputContainer = styled(View)`
    background-color: rgba(0,0,0,0.5);
    border-radius: 8px;
    border-color: white;
    border-width: 1px;
    flex-direction: row;
    padding: 5px;
    padding-bottom: 15px;
    margin: 12px;
    width: 100%;
`
const StarRatingContainer = styled(View)`
    flex-direction: row;
    justify-content: space-between;
    margin-left: 12px;
    margin-bottom: 12px;
`

export default DescriptionAndStarRating = ({ starCountRef, descriptionRef }) => {
    const [renderCount, setRenderCount] = useState(0);

    const onStarRatingPress = (rating) => {
        starCountRef.current = rating;
        setRenderCount(renderCount + 1);
    }
    const onClearRatingPress = () => {
        starCountRef.current = 0;
        setRenderCount(renderCount + 1);
    }

    return (
        <InfoContainer>
            { (starCountRef.current === 0) && <RatingText>{"Want to rate it?"}</RatingText> }
            <StarRatingContainer>
                <StarRating 
                    disabled={false}
                    emptyStarColor={'#c4c4c4'}
                    maxStars={5}
                    fullStarColor={'white'}
                    halfStarEnabled={true}
                    rating={starCountRef.current}
                    selectedStar={onStarRatingPress}
                    starSize={30}
                    starStyle={{ paddingRight: 8 }}
                />
                { (starCountRef.current > 0) && 
                    <ClearRatingContainer onPress={onClearRatingPress}>
                        <ClearRatingText>{"Clear"}</ClearRatingText>
                    </ClearRatingContainer>                        
                }
            </StarRatingContainer>
            <EditDescription descriptionRef={descriptionRef} />
        </InfoContainer>
    );
}

const EditDescription = ({ descriptionRef }) => {
    const descriptionInputRef = useRef(null);
    const [inputText, setInputText] = useState('');
    const changeInputTextWithRef = (text) => {
        setInputText(text);
        descriptionRef.current = text;
    };

    return (
        <>
        <Pressable 
            style={{ width: width - 24 }}
            onPress={() => descriptionInputRef.current.focus()}>
            <DescriptionInputContainer>
                <TextInputWithMentions 
                    commentText={inputText}
                    setCommentText={changeInputTextWithRef}
                    inputRef={descriptionInputRef}
                    placeholder='Add a description, tag people...'
                />
            </DescriptionInputContainer>
        </Pressable>
        </>
    );
};

