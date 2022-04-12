import React, { useContext, useRef, useState, useEffect, memo} from 'react';
import { Pressable, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { isMentionPartType, parseValue, MentionInput } from 'react-native-controlled-mentions'

import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import moment from 'moment';
import Constants from 'expo-constants';
import * as ReelayText from '../global/Text';


import { logAmplitudeEventProd } from '../utils/EventLogger';
import { getUserByUsername } from '../../api/ReelayDBApi';
import ProfilePicture from '../global/ProfilePicture';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

const CommentTextStyled = styled(ReelayText.Body2)`
    color: white;
`;
const CommentTimestampText = styled(ReelayText.Body2)`
    color: #86878b;
`;

const MentionTextStyle = {
    color: ReelayColors.reelayBlue,
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    fontStyle: "normal",
    lineHeight: 24,
    letterSpacing: 0.25,
}

const CommentTextWithMentions = ({ comment }) => {
    const mentionFollowType = {
        trigger: '@',
        textStyle: MentionTextStyle,
    };

    const timestamp = moment(comment.postedAt).fromNow();
    const commentPartsWithMentions = parseValue(comment.content, [mentionFollowType]);
    console.log('comment parts with mentions: ', commentPartsWithMentions);

    return (
        <React.Fragment>
            <CommentTextStyled>
                {commentPartsWithMentions.plainText} 
                <CommentTimestampText>
                    {`  ${timestamp}`}
                </CommentTimestampText>
            </CommentTextStyled>
        </React.Fragment>
    )
}

export default CommentItem = ({ comment, navigation }) => {
    const [commentLiked, setCommentLiked] = useState(false); // alter to make default state the database value for whether you've liked that comment yet or not.
    const [numCommentLikes, setNumCommentLikes] = useState(0); // similarly alter to make default state the database value for the number of comment likes currently
    const commentImageSource = {
        uri: `${CLOUDFRONT_BASE_URL}/public/profilepic-${comment.authorSub}-current.jpg`,
    }
    
    const CommentItemContainer = styled(Pressable)`
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

    const toggleCommentLike = () => {
        const commentIsNowLiked = !commentLiked;
        if (commentIsNowLiked) {
            setNumCommentLikes(numCommentLikes + 1);
            /**
             * Here, put logic for liking comment in DB and incrementing number of comment likes. React state updates automatically.
             */
        } else {
            setNumCommentLikes(numCommentLikes - 1);
            /**
             * Here, put logic for liking comment in DB and incrementing number of comment likes. React state updates automatically.
             */
        }
        setCommentLiked(commentIsNowLiked);
    };

    // main feed currently returns from DataStore, using userID
    // profile feeds return from ReelayDB, using authorName
    const author = { username: comment.authorName, sub: comment.authorSub };

    const onPress = async () => {
        const creator = await getUserByUsername(author.username);
        dispatch({ type: 'setCommentsVisible', payload: false });
        navigation.push("UserProfileScreen", {
            creator: creator,
        });
        logAmplitudeEventProd('viewProfile', {
            username: author.username,
            source: 'commentDrawer',
        });
    };
    
    return (
        <CommentItemContainer onPress={onPress}>
            <LeftCommentIconContainer>
                <ProfilePicture navigation={navigation} user={author} size={32} />
            </LeftCommentIconContainer>
            <CommentTextContainer>
                <UsernameText>{`@${author.username}`}</UsernameText>
                <CommentTextWithMentions comment={comment} />
            </CommentTextContainer>

            {/* On implementing comment likes, remove the view below and uncomment the snippet below. */}
            <View />
            {/* <RightCommentIconContainer onPress={toggleCommentLike}>
                        <Icon
                            type="ionicon"
                            name={commentLiked ? "heart" : "heart-outline"}
                            color={commentLiked ? "#FF4848" : "#FFFFFF"}
                            size={16}
                        />
                        {numCommentLikes > 1 && (
                            <CommentIconText>{numCommentLikes}</CommentIconText>
                        )}
                    </RightCommentIconContainer> */}
        </CommentItemContainer>
    );
};
