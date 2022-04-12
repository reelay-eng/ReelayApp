import React, { useContext, useRef, useState, useEffect, memo} from 'react';
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

import { Button, Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components/native';
import moment from 'moment';
import Constants from 'expo-constants';
import { BWButton } from '../global/Buttons';
import * as ReelayText from '../global/Text';

import { 
	notifyCreatorOnComment,
	notifyThreadOnComment,
} from '../../api/NotificationsApi';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { postCommentToDB } from '../../api/ReelayDBApi';
import CommentItem from './CommentItem';
import TextInputWithMentions from './TextInputWithMentions';

const CLOUDFRONT_BASE_URL = Constants.manifest.extra.cloudfrontBaseUrl;

const { height, width } = Dimensions.get('window');
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

export default CommentsDrawer = ({ reelay, navigation, commentsCount }) => {
    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13
    const CLOSE_BUTTON_SIZE = 25;
    const MAX_COMMENT_LENGTH = 200;

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
    const closeDrawer = () => {
        console.log('Closing drawer');
        Keyboard.dismiss();
        dispatch({ type: 'setCommentsVisible', payload: false });
    }

    const Header = () => {

        // comments are for Gray Bar indicating slide-to-close, if we ever put it in. 
        const HeaderContainer = styled(View)`
            justify-content: center;
            margin-left: 12px;
            margin-right: 12px;
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
		const headerText = commentsCount.current ? `${commentsCount.current} comments` : "No comments... be the first!"
		
        return (
            <HeaderContainer>
                {/* <GrayBar /> */}
                <HeaderText>{headerText}</HeaderText>
                <CloseButtonContainer onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE}/>
                </CloseButtonContainer>
            </HeaderContainer>
        );
    }

    const CommentProfilePhoto = styled(Image)`
		width: 32px;
		height: 32px;
		border-radius: 16px;
	`;

    const Comments = ({ comments }) => {
        const CommentsContainer = styled(View)`
			width: 100%;
			padding-top: 13px;
		`;
		
        return (
            <CommentsContainer>
                {comments.map((comment, i) => (
                    <CommentItem 
						key={(comment.userID ?? comment.authorName) + comment.postedAt}
						comment={comment} 
						navigation={navigation}
					/>
                ))}
            </CommentsContainer>
        );
	};

    const CommentBox = () => {
        const [render, setRender] = useState(false);
        const scrollViewRef = useRef();
        const [maxDrawerHeight, setMaxDrawerHeight] = useState(height);

        const rerender = () => {
			commentsCount.current = reelay.comments.length;
            setRender(!render);
        }

        const Spacer = styled(View)`
            height: ${props => props.height ? props.height : '0px'};
        `
        const BlackBoxContainerStyle = {
			backgroundColor: "#0d0d0d",
			minHeight: 80,
			paddingBottom: 24,
			paddingTop: 12,
			paddingLeft: 16,
			paddingRight: 12,
			display: "flex",
			flexDirection: "row",
			justifyContent: "space-between",
		};
        const CommentProfilePhotoContainer = styled(View)`
			justify-content: flex-end;
			width: 32px;
		`;

        const AuthorImage = memo(({user}) => {
            const authorImageSource = {
				uri: `${CLOUDFRONT_BASE_URL}/public/profilepic-${user?.sub}-current.jpg`,
			};
            return (
				<CommentProfilePhotoContainer>
					<CommentProfilePhoto source={authorImageSource} />
				</CommentProfilePhotoContainer>
			);
        })
		
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
                            <Comments comments={reelay.comments}/>
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
			width: width - 138,
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
				{/* Setting up TextInput as a styled component forces the keyboard to disappear... */}
				<View style={TextBoxStyle}>
					<TextInputWithMentions 
						commentText={commentText}
						setCommentText={setCommentText}
						scrollViewRef={scrollViewRef}
					/>
				</View>
				<PostButtonContainer>
					<BWButton
						disabled={!commentText.length || commentPosting}
						text={"Post"}
						onPress={(commentText) => {
							onCommentPost(commentText);
							// Keyboard.dismiss();
						}}
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
							{/* <CloseButton /> */}
						</DrawerContainer>
					</KeyboardAvoidingView>
				</Modal>
			</ScrollView>
		</ModalContainer>
    );
};