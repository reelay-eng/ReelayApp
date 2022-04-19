import React, { useContext, useRef, useState, memo} from 'react';
import { 
    Dimensions,
    Keyboard, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    ScrollView, 
    View,
    Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import moment from 'moment';
import Constants from 'expo-constants';
import { BWButton } from '../global/Buttons';
import * as ReelayText from '../global/Text';
import SwipeableComment from './SwipeableComment';

import { 
	notifyCreatorOnComment,
	notifyMentionsOnComment,
	notifyThreadOnComment,
} from '../../api/NotificationsApi';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { getRegisteredUser, getUserByUsername, postCommentLikeToDB, postCommentToDB, removeCommentLike } from '../../api/ReelayDBApi';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;
import CommentItem from './CommentItem';
import TextInputWithMentions from './TextInputWithMentions';
import ProfilePicture from '../global/ProfilePicture';
import { notifyUserOnCommentLike } from '../../api/NotificationsApi';

const { height, width } = Dimensions.get('window');
const COMMENT_TEXT_INPUT_WIDTH = width - 146;

moment.updateLocale("en", {
	relativeTime: {
		future: "in %s",
		past: "%s",
		s: "just now",
		ss: "%ss",
		m: "1m",
		mm: "%dm",
		h: "1h",
		hh: "%dh",
		d: "1d",
		dd: "%dd",
		M: "1mo",
		MM: "%dmo",
		y: "1y",
		yy: "%dY",
	},
});

const CommentInputContainer = styled(View)`
	align-items: flex-end;
	flex-direction: row;
`

export default CommentsDrawer = ({ reelay, navigation }) => {
    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13
    const CLOSE_BUTTON_SIZE = 25;
    const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const DrawerContainer = styled(View)`
        background-color: #1a1a1a;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        margin-top: auto;
        width: 100%;
    `
    const ModalContainer = styled(Pressable)`
        position: absolute;
    `
    const { reelayDBUser } = useContext(AuthContext);

    const commentsVisible = useSelector(state => state.commentsVisible);
    const dispatch = useDispatch();
	const likedComments = useRef([]);

    const closeDrawer = () => {
        console.log('Closing drawer');
        Keyboard.dismiss();
        dispatch({ type: 'setCommentsVisible', payload: false });
		
		likedComments.current.forEach((userSub) => {
			notifyUserOnCommentLike({ authorSub: userSub, user: reelayDBUser, reelay: reelay });
		})
    }

    const Header = () => {
        const HeaderContainer = styled(View)`
            justify-content: center;
            margin-left: 12px;
            margin-right: 20px;
            padding-top: 10px;
            padding-bottom: 10px;
            border-bottom-color: #2D2D2D;
            border-bottom-width: 1px;
        `
        const HeaderText = styled(ReelayText.CaptionEmphasized)`
            position: absolute;
            align-self: center;
            color: white;
        `
        const CloseButtonContainer = styled(Pressable)`
            align-self: flex-end;
        `
		const headerText = (reelay.comments.length) ? `${reelay.comments.length} comments` : "No comments... be the first!"
		
        return (
            <HeaderContainer>
                <HeaderText>{headerText}</HeaderText>
                <CloseButtonContainer onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE}/>
                </CloseButtonContainer>
            </HeaderContainer>
        );
    }

    const CommentList = ({ comments, rerender }) => {
        const CommentsContainer = styled(View)`
			width: 100%;
			padding-top: 13px;
		`;

		const onCommentDelete = async (comment) => {
			console.log('comment length before delete: ', reelay.comments.length);
			const removeOnCommentID = (nextComment) => (comment.id !== nextComment.id);
			reelay.comments = reelay.comments.filter(removeOnCommentID);
			console.log('comment length after delete: ', reelay.comments.length);
            rerender(); // for comment to be removed

			logAmplitudeEventProd("deletedComment", {
				user: reelayDBUser?.username,
				creator: reelay.creator.username,
				title: reelay.title.display,
				reelayID: reelay.id,
				commentText: comment.content,
			});
		};

        return (
            <CommentsContainer>
                {comments.map((comment, i) => {
					const commentKey = (comment.userID ?? comment.authorName) + comment.postedAt;
					if (comment.authorSub === reelayDBUser.sub)  {
						return (
							<SwipeableComment key={commentKey} comment={comment} onCommentDelete={onCommentDelete}>
								<CommentItem comment={comment} navigation={navigation} likedComments={likedComments} />
							</SwipeableComment>
						);
					} else {
						return <CommentItem key={commentKey} comment={comment} navigation={navigation} likedComments={likedComments} />;
					}
				})}
            </CommentsContainer>
        );
	};

    const CommentBox = () => {
        const [render, setRender] = useState(false);
        const scrollViewRef = useRef();
        const [maxDrawerHeight, setMaxDrawerHeight] = useState(height);

        const rerender = () => {
            setRender(!render);
        }

        const Spacer = styled(View)`
            height: ${props => props.height ? props.height : '0px'};
        `
        const BlackBoxContainerStyle = {
			backgroundColor: "#0d0d0d",
			minHeight: 70,
			paddingBottom: 24,
			paddingTop: 12,
			paddingLeft: 16,
			paddingRight: 12,
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
		};
        const ProfilePictureContainer = styled(View)`
			justify-content: flex-end;
			margin-right: 6px;
		`;

        const AuthorImage = ({ user }) => {
            return (
				<ProfilePictureContainer>
					<ProfilePicture size={40} user={user} />
				</ProfilePictureContainer>
			);
        };
		
        return (
			<View>
				<Header />
				{reelay.comments.length > 0 && (
					<>
						<ScrollView
							ref={scrollViewRef}
							style={{ maxHeight: maxDrawerHeight / 2 }}
							keyboardShouldPersistTaps={'handled'}
						>
                            <CommentList comments={reelay.comments} rerender={rerender} />
						</ScrollView>
						<Spacer height="12px" />
					</>
				)}
				
				<View style={BlackBoxContainerStyle}>
                    <AuthorImage user={reelayDBUser}/>
					<CommentInput
						setMaxDrawerHeight={setMaxDrawerHeight}
                        scrollViewRef={scrollViewRef}
                        rerender={rerender}
					/>
				</View>
			</View>
		);
    };

    // CommentInput extracted to not rerender comments on every CommentBox state update. 
    const CommentInput = ({ setMaxDrawerHeight, scrollViewRef, rerender }) => {
		const PostButtonContainer = styled(View)`
			width: 70px;
			height: 40px;
		`;

		const TextBoxStyle = {
			justifyContent: 'flex-start',
			alignItems: 'flex-start',
			width: COMMENT_TEXT_INPUT_WIDTH,
		};

		const [commentText, setCommentText] = useState("");
		const [commentPosting, setCommentPosting] = useState(false);

		const keyboardWillShow = async (e) => {
			const keyboardHeight = e.endCoordinates.height;
			const shortHeight = height - keyboardHeight;
			setMaxDrawerHeight(shortHeight);
		};

		const keyboardWillHide = async (e) => {
			setMaxDrawerHeight(height);
		};

		Keyboard.addListener("keyboardWillShow", keyboardWillShow);
		Keyboard.addListener("keyboardWillHide", keyboardWillHide);

		const onCommentPost = async () => {
			setCommentPosting(true);
			const commentBody = {
				authorName: reelayDBUser?.username,
				authorSub: reelayDBUser?.sub,
				content: commentText,
				creatorName: reelay.creator.username,
				creatorSub: reelay.creator.sub,
				postedAt: new Date().toISOString(),
				reelaySub: reelay.sub,
				visibility: FEED_VISIBILITY,
			};
			console.log(commentBody);

			const postResult = await postCommentToDB(commentBody, reelay.sub);
			commentBody.id = postResult.id;
			console.log("Comment posted: ", postResult);

			await notifyCreatorOnComment({
				creatorSub: reelay.creator.sub,
				author: reelayDBUser,
				reelay: reelay,
				commentText: commentText,
			});
			await notifyThreadOnComment({
				creator: reelay.creator,
				author: reelayDBUser,
				reelay: reelay,
				commentText: commentText,
			});
			await notifyMentionsOnComment({
				creator: reelay.creator,
				author: reelayDBUser,
				reelay: reelay,
				commentText: commentText,
			})

			setCommentText("");
            setCommentPosting(false);
            reelay.comments.push(commentBody);
            rerender(); // for new comment to show up
			if (scrollViewRef?.current) {
				scrollViewRef.current.scrollToEnd({ animated: false });
			}

			logAmplitudeEventProd("commentedOnReelay", {
				user: reelayDBUser?.username,
				creator: reelay.creator.username,
				title: reelay.title.display,
				reelayID: reelay.id,
				commentText: commentText,
			});
		};

        return (
			<CommentInputContainer>
				<View style={TextBoxStyle}>
					<TextInputWithMentions 
						boxWidth={COMMENT_TEXT_INPUT_WIDTH}
						commentText={commentText}
						setCommentText={setCommentText}
						scrollViewRef={scrollViewRef}
					/>
				</View>
				<PostButtonContainer>
					<BWButton
						disabled={!commentText.length || commentPosting}
						text={"Post"}
						onPress={onCommentPost}
					/>
				</PostButtonContainer>
			</CommentInputContainer>
		);
	};

    return (
		<ModalContainer>
			<ScrollView keyboardShouldPersistTaps={"handled"}>
				<Modal animationType="slide" transparent={true} visible={commentsVisible}>
					<KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
						<Backdrop onPress={closeDrawer} />
						<DrawerContainer>
							<CommentBox />
						</DrawerContainer>
					</KeyboardAvoidingView>
				</Modal>
			</ScrollView>
		</ModalContainer>
    );
};