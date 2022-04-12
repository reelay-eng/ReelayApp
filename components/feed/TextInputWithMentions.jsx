import React, { useContext } from 'react';
import { 
    Dimensions,
    Keyboard, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    ScrollView, 
    TextInput, 
    Text,
    View,
    Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MentionInput } from 'react-native-controlled-mentions'

import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import * as ReelayText from '../global/Text';
import ReelayColors from '../../constants/ReelayColors';

import { logAmplitudeEventProd } from '../utils/EventLogger';

const MAX_COMMENT_LENGTH = 300;
const MAX_SUGGESTIONS = 6;

const MentionTextStyle = {
    color: ReelayColors.reelayBlue,
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.25,
}

const SuggestionContainer = styled(View)`
    background-color: #1a1a1a;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    width: 100%;
`
const SuggestionItem = styled(Pressable)`
    align-items: center;
    flex-direction: row;
    padding: 12px;
`
const SuggestionUsernameText = styled(ReelayText.Body2)`
    color: white;
`
const TextInputStyle = {
    alignSelf: "center",
    color: "white",
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.25,
    textAlign: "left",
    paddingLeft: 12,
    paddingRight: 12,
    width: "100%",
};

const getFollowSuggestions = (myFollowers, myFollowing, reelayDBUser) => {
    const iAmFollowing = (followObj) => (followObj.followerName === reelayDBUser?.username);
    const getFollowName = (followObj) => iAmFollowing(followObj) ? followObj.creatorName : followObj.followerName;
    const getFollowSub = (followObj) => iAmFollowing(followObj) ? followObj.creatorSub : followObj.followerSub;
    const sortByFollowName = (followObj0, followObj1) => (followObj0.followName > followObj1.followName);

    const allFollowsConcat = [...myFollowers, ...myFollowing].map((followObj) => {
        // allows us to treat the object the same whether it's a creator or a follower
        return {
            followName: getFollowName(followObj),
            followSub: getFollowSub(followObj),
        }
    });

    const allFollowsUnique = (allFollowsConcat.filter((followObj, index) => {
        // const followUsername = getFollowName(followObj);
        const prevFollowIndex = allFollowsConcat.slice(0, index).findIndex((prevFollowObj) => {
            return (followObj.followName === prevFollowObj.followName);
        });
        return (prevFollowIndex === -1);
    })).sort(sortByFollowName);

    const suggestions = allFollowsUnique.map((followObj) => {
        const { followSub, followName } = followObj;
        return { id: followSub, name: followName };
    });

    return suggestions;
}

export default TextInputWithMentions = ({ commentText, setCommentText, scrollViewRef }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const myFollowers = useSelector(state => state.myFollowers);
    const myFollowing = useSelector(state => state.myFollowing);
    const suggestions = getFollowSuggestions(myFollowers, myFollowing, reelayDBUser);

    const onFocus = () => {
        if (scrollViewRef?.current) {
            scrollViewRef.current.scrollToEnd({ animated: false });
        }
    }

    const renderSuggestions = ({ keyword, onSuggestionPress }) => {
        if (!keyword) return <View />;

        const matchOnKeyword = (suggestion) => {
            const usernameToMatch = suggestion.name.toLocaleLowerCase();
            const keywordToMatch = keyword.toLocaleLowerCase();
            return usernameToMatch.includes(keywordToMatch);
        }

        const renderSuggestionItem = (suggestion) => {
            const onPress = () => onSuggestionPress(suggestion);
            return (
                <SuggestionItem key={suggestion.name} onPress={onPress}>
                    <SuggestionUsernameText>@{suggestion.name}</SuggestionUsernameText>
                </SuggestionItem>
            );
        }    
      
        return (
            <SuggestionContainer>
                { suggestions
                    .filter(matchOnKeyword)
                    .map(renderSuggestionItem)
                    .slice(0, MAX_SUGGESTIONS)
                }
            </SuggestionContainer>
        );
    };

    const mentionFollowType = {
        trigger: '@',
        renderSuggestions,
        textStyle: MentionTextStyle,
    };

    return (
        <MentionInput
            maxLength={MAX_COMMENT_LENGTH}
            multiline
            numberOfLines={4}
            blurOnSubmit={true}
            onFocus={onFocus}
            placeholder={"Add comment..."}
            placeholderTextColor={"gray"}
            returnKeyType="done"
            style={TextInputStyle}
            value={commentText}
            onChange={setCommentText}
            partTypes={[ mentionFollowType ]}
        />
    );
}