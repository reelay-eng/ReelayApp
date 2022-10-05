import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MentionInput } from 'react-native-controlled-mentions'

import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import ProfilePicture from '../global/ProfilePicture';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';
import { searchUsers } from '../../api/ReelayDBApi';

const MAX_COMMENT_LENGTH = 300;
const MAX_SUGGESTIONS = 6;

const MentionTextStyle = {
    color: ReelayColors.reelayBlue,
    fontFamily: "Outfit-Bold",
    fontSize: 14,
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.25,
}

const Spacer = styled(View)`
    height: 24px;
`
const SuggestionContainer = styled(View)`
    background-color: #1a1a1a;
    border-bottom-right-radius: 20px;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    bottom: 40px;
    left: 8px;
    position: absolute;
    shadow-offset: 4px 4px;
    shadow-color: black;
    shadow-opacity: 0.5;
    width: 300px;
    zIndex: 5;
`
const SuggestionItem = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    padding: 12px;
`
const SuggestionUsernameText = styled(ReelayText.Body2)`
    color: white;
    margin-left: 8px;
`

export default TextInputWithMentions = ({ 
    commentText, 
    inputRef = null, 
    placeholder = 'Add comment...',
    setCommentText, 
    scrollViewRef,
    boxWidth,
}) => {
    const searchUsersQueryRef = useRef(0);
    const suggestedUsersRef = useRef([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);

    let TextInputStyle = {
        alignSelf: "center",
        color: "white",
        fontFamily: "Outfit-Regular",
        fontSize: 14,
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 0.25,
        textAlign: "left",
        paddingLeft: 12,
        paddingRight: 18, // az – right side padding is off by 6px, for some weird reason.
        paddingBottom: 6,
    };

    let TextInputContainerStyle = {
        paddingTop: 5,
        paddingBottom: 5,
        alignItems: 'center',
        justifyContent: 'center'
    }

    
    if (boxWidth) TextInputStyle.width = boxWidth;

    const onFocus = () => {
        if (scrollViewRef?.current) {
            scrollViewRef.current.scrollToEnd({ animated: false });
        }
    }

    const updateSuggestions = async (keyword) => {
        searchUsersQueryRef.current += 1;
        const curQuery = searchUsersQueryRef?.current;
        const suggestedUsers = await searchUsers(keyword);
        if (curQuery === searchUsersQueryRef.current) {
            suggestedUsersRef.current = suggestedUsers;
        }
    }

    const renderSuggestions = ({ keyword, onSuggestionPress }) => {
        if (!keyword) return <View />;
        updateSuggestions(keyword);

        const renderSuggestionItem = (suggestedUser) => {
            const onPressUser = {
                id: suggestedUser?.sub,
                name: suggestedUser?.username,
            }
            const onPress = () => onSuggestionPress(onPressUser);
            return (
                <SuggestionItem key={suggestedUser.sub} onPress={onPress}>
                    <ProfilePicture size={32} user={suggestedUser} />
                    <SuggestionUsernameText>{suggestedUser.username}</SuggestionUsernameText>
                </SuggestionItem>
            );
        }    

        if (suggestedUsers?.length === 0) {
            return (
                <SuggestionContainer>
                    <Spacer />
                </SuggestionContainer>
            )
        }

        return (
            <SuggestionContainer>
                { suggestedUsers.map(renderSuggestionItem).slice(0, MAX_SUGGESTIONS) }
            </SuggestionContainer>
        );
    };

    const mentionFollowType = {
        trigger: '@',
        renderSuggestions,
        textStyle: MentionTextStyle,
    };

    useEffect(() => {
        const suggestionsInterval = setInterval(() => {
            const stateSuggestions = JSON.stringify(suggestedUsers);
            const refSuggestions = JSON.stringify(suggestedUsersRef?.current);
            if (stateSuggestions !== refSuggestions) {
                setSuggestedUsers(suggestedUsersRef?.current);
            };
        }, 250);
        return () => clearInterval(suggestionsInterval)
    }, []);

    return (
        <MentionInput
            maxLength={MAX_COMMENT_LENGTH}
            multiline
            numberOfLines={4}
            onFocus={onFocus}
            placeholder={placeholder}
            placeholderTextColor={"gray"}
            inputRef={inputRef}
            style={TextInputStyle}
            containerStyle={TextInputContainerStyle}
            value={commentText}
            onChange={setCommentText}
            partTypes={[ mentionFollowType ]}
        />
    );
}