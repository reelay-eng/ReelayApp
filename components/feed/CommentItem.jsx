import React, { useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { isMentionPartType, parseValue } from 'react-native-controlled-mentions';
import { postCommentLikeToDB, removeCommentLike } from '../../api/ReelayDBApi';

import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import moment from 'moment';
import * as ReelayText from '../global/Text';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import ProfilePicture from '../global/ProfilePicture';
import { TouchableOpacity } from 'react-native-gesture-handler';

const CommentTextStyled = styled(ReelayText.Body2)`
    color: white;
`;
const CommentTimestampText = styled(ReelayText.Body2)`
    color: #86878b;
`;

const MentionButton = styled(TouchableOpacity)`
    align-items: flex-end;
`
const MentionTextStyle = {
    alignItems: 'flex-end',
    color: ReelayColors.reelayBlue,
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    fontStyle: "normal",
    letterSpacing: 0.25,
}

const CommentTextWithMentions = ({ comment, navigation }) => {
    const dispatch = useDispatch();
    const mentionFollowType = {
        trigger: '@',
        textStyle: MentionTextStyle,
    };

    const commentPartsWithMentions = parseValue(comment.content, [mentionFollowType]);
    const isMention = (part) => (part.partType && isMentionPartType(part.partType));
    const timestamp = moment(comment.postedAt).fromNow();

    const advanceToMentionProfile = (mentionData) => {
        const mentionUser = {
            sub: mentionData.id,
            username: mentionData.name,
        }

        dispatch({ type: 'setCommentsVisible', payload: false });
        navigation.push('UserProfileScreen', { creator: mentionUser });
    }

    const renderCommentPart = (commentPart, index) => {
        if (isMention(commentPart)) {
            return (
                <MentionButton key={index} onPress={() => advanceToMentionProfile(commentPart.data)}>
                    <Text style={MentionTextStyle}>{commentPart.text}</Text>
                </MentionButton>
            );
        }

        return (
            <CommentTextStyled key={index}>
                {commentPart.text}
            </CommentTextStyled>
        );
    }

    return (
        <React.Fragment>
            <CommentTextStyled>
                { commentPartsWithMentions.parts.map(renderCommentPart) }
                <CommentTimestampText>
                    {`  ${timestamp}`}
                </CommentTimestampText>
            </CommentTextStyled>
        </React.Fragment>
    )
}

export default CommentItem = ({ comment, navigation }) => {
    const CommentItemContainer = styled(Pressable)`
        background-color: #1a1a1a;
        padding-left: 16px;
        padding-right: 16px;
        padding-bottom: 13px;
        display: flex;
        flex-direction: row;
    `;
    const LeftCommentIconContainer = styled(View)`
        width: 10%;
        align-items: center;
        margin-right: 12px;
        margin-top: 4px;
    `;
    const CommentTextContainer = styled(View)`
        display: flex;
        flex-direction: column;
        width: 80%;
    `;
    const UsernameText = styled(ReelayText.CaptionEmphasized)`
        color: #86878b;
    `;

    // main feed currently returns from DataStore, using userID
    // profile feeds return from ReelayDB, using authorName
    const author = { username: comment.authorName, sub: comment.authorSub };
    
    return (
        <CommentItemContainer>
            <LeftCommentIconContainer>
                <ProfilePicture navigation={navigation} user={author} size={32} />
            </LeftCommentIconContainer>
            <CommentTextContainer>
                <UsernameText>{`@${author.username}`}</UsernameText>
                <CommentTextWithMentions comment={comment} navigation={navigation} />
            </CommentTextContainer>
            <View />
            <CommentLikes comment={comment} />
        </CommentItemContainer>
    );
};

const CommentLikes = ({ comment }) => {
    const RightCommentIconContainer = styled(Pressable)`
        align-items: center;
        justify-content: center;
        top: 3px;
        right: 10px;
        padding: 10px;
        padding-bottom: 0px;
    `;
    const CommentIconText = styled(ReelayText.Caption)`
        color: #86878b;
        font-size: 12px;
    `;

    const { reelayDBUser } = useContext(AuthContext);
    const [commentLiked, setCommentLiked] = useState(comment?.likes?.userLiked); // alter to make default state the database value for whether you've liked that comment yet or not.
    const [numCommentLikes, setNumCommentLikes] = useState(comment?.likes?.numberOfLikes ?? 0); // similarly alter to make default state the database value for the number of comment likes currently

    const toggleCommentLike = () => {
        const commentIsNowLiked = !commentLiked;
        if (commentIsNowLiked) {
            setNumCommentLikes(numCommentLikes + 1);
            postCommentLikeToDB(comment?.id, comment?.authorSub, reelayDBUser?.sub);
            if (comment.likes) {
                comment.likes.numberOfLikes++;
                comment.likes.userLiked = true;
            } else {
                comment.likes = {
                    numberOfLikes: 1,
                    userLiked: true,
                }
            }
        } else {
            setNumCommentLikes(numCommentLikes - 1);
            removeCommentLike(comment?.id, reelayDBUser?.sub);
            comment.likes.numberOfLikes--;
            comment.likes.userLiked = false;
        }
        setCommentLiked(commentIsNowLiked);
    };

    return (
        <RightCommentIconContainer onPress={toggleCommentLike}>
            <Icon
                type="ionicon"
                name={commentLiked ? "heart" : "heart-outline"}
                color={commentLiked ? "#FF4848" : "#FFFFFF"}
                size={15}
            />
            <CommentIconText>{(numCommentLikes>0) ? numCommentLikes : " "}</CommentIconText>
        </RightCommentIconContainer>
    );
}