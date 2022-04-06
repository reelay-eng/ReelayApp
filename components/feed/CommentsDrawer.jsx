import React, { useContext, useRef, useState, useEffect, memo} from 'react';
import { 
    Dimensions,
    Keyboard, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    ScrollView, 
    TextInput, 
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
import ReelayIcon from '../../assets/icons/reelay-icon-with-dog-black.png';

import { 
	notifyCreatorOnComment,
	notifyThreadOnComment,
} from '../../api/NotificationsApi';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { getRegisteredUser, getUserByUsername, postCommentLikeToDB, postCommentToDB, removeCommentLike } from '../../api/ReelayDBApi';

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
        // const GrayBar = styled(View)`
        //     border-radius: 10px;
        //     opacity: 0.2;
        //     border: solid 2px white;
        //     width: 70px;
        //     align-self: center;
        // `
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
                    <Comment comment={comment} key={(comment.userID ?? comment.authorName) + comment.postedAt} />
                ))}
            </CommentsContainer>
        );
	};

    const AsyncProfilePhoto = ({ source }) => {
		return (
			<>
				<CommentProfilePhoto
					style={{ zIndex: 2 }}
					source={source}
				/>
				<CommentProfilePhoto
					style={{ position: "absolute", zIndex: 1 }}
					source={ReelayIcon}
				/>
			</>
		);
	};

    const Comment = ({ comment }) => {
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
		const RightCommentIconContainer = styled(Pressable)`
			width: 10%;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		`;
		const CommentIconText = styled(ReelayText.Caption)`
			color: #86878b;
		`;
		const CommentTextContainer = styled(View)`
			display: flex;
			flex-direction: column;
			width: 80%;
		`;
		const CommentText = styled(ReelayText.Body2)`
			color: white;
		`;
		const CommentTimestampText = styled(ReelayText.Body2)`
			color: #86878b;
		`;
		const UsernameText = styled(ReelayText.CaptionEmphasized)`
			color: #86878b;
		`;

		const toggleCommentLike = () => {
			const commentIsNowLiked = !commentLiked;
			if (commentIsNowLiked) {
				setNumCommentLikes(numCommentLikes + 1);
				postCommentLikeToDB(comment?.id, comment?.authorSub, reelayDBUser?.sub)
			} else {
				setNumCommentLikes(numCommentLikes - 1);
				removeCommentLike(comment?.id, reelayDBUser?.sub);
			}
			setCommentLiked(commentIsNowLiked);
		};

		// main feed currently returns from DataStore, using userID
		// profile feeds return from ReelayDB, using authorName
		const username = comment.userID ?? comment.authorName;
		const timestamp = moment(comment.postedAt).fromNow();

		const onPress = async () => {
			const creator = await getUserByUsername(username);
			dispatch({ type: 'setCommentsVisible', payload: false });
			navigation.push("UserProfileScreen", {
				creator: creator,
			});
			logAmplitudeEventProd('viewProfile', {
				username: username,
				source: 'commentDrawer',
			});
		};
		
		return (
            <CommentItemContainer onPress={onPress}>
				<LeftCommentIconContainer>
					<AsyncProfilePhoto source={commentImageSource} />
				</LeftCommentIconContainer>
				<CommentTextContainer>
					<UsernameText>{`@${username}`}</UsernameText>
					<CommentText>
						{comment.content} <CommentTimestampText>{timestamp}</CommentTimestampText>
					</CommentText>
				</CommentTextContainer>

				{/* On implementing comment likes, remove the view below and uncomment the snippet below. */}
				<View />
				<RightCommentIconContainer onPress={toggleCommentLike}>
					<Icon
						type="ionicon"
						name={commentLiked ? "heart" : "heart-outline"}
						color={commentLiked ? "#FF4848" : "#FFFFFF"}
						size={16}
					/>
					{numCommentLikes > 1 && (
						<CommentIconText>{numCommentLikes}</CommentIconText>
					)}
				</RightCommentIconContainer>
			</CommentItemContainer>
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
			<>
				{/* Setting up TextInput as a styled component forces the keyboard to disappear... */}
				<View style={TextBoxStyle}>
					<TextInput
						maxLength={MAX_COMMENT_LENGTH}
						multiline
						numberOfLines={4}
						blurOnSubmit={true}
						onChangeText={(text) => setCommentText(text)}
						onFocus={() => {
							if (scrollViewRef?.current) {
								scrollViewRef.current.scrollToEnd({ animated: false });
							}
						}}
						placeholder={"Add comment..."}
						placeholderTextColor={"gray"}
						returnKeyType="done"
						style={TextInputStyle}
						defaultValue={commentText}
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
			</>
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