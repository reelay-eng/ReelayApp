import React, { useContext, useRef, useState } from 'react';
import { 
    Dimensions, 
    Keyboard, 
    KeyboardAvoidingView, 
    Modal, 
    Pressable, 
    ScrollView, 
    Text, 
    TextInput, 
    View,
    Image
} from 'react-native';

import { Button, Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import styled from 'styled-components/native';
import moment from 'moment';
import Constants from 'expo-constants';
import { BWButton } from '../../components/global/Buttons';
import * as ReelayText from '../../components/global/Text';
import ReelayIcon from '../../assets/icons/reelay-icon.png';

import { 
    sendCommentNotificationToCreator, 
    sendCommentNotificationToThread 
} from '../../api/NotificationsApi';

import { logAmplitudeEventProd } from '../utils/EventLogger';
import { getRegisteredUser, getUserByUsername, postCommentToDB } from '../../api/ReelayDBApi';

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

export default CommentsDrawer = ({ reelay, navigation }) => {

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
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const { cognitoUser } = useContext(AuthContext);
    const { commentsVisible, setCommentsVisible } = useContext(FeedContext);
    const closeDrawer = () => {
        console.log('Closing drawer');
        Keyboard.dismiss();
        setCommentsVisible(false);
    }

    const CharacterCounter = ({ commentTextLength }) => {
        const CounterContainer = styled(View)`
            flex-direction: row;
            justify-content: flex-end;
            margin-top: 10px;
            right: 18px;
            width: 100%;
        `
        const CounterText = styled(ReelayText.CaptionEmphasized)`
			color: #86878b;
		`;
        return (
            <CounterContainer>
                <CounterText>{`${commentTextLength} / ${MAX_COMMENT_LENGTH}`}</CounterText>
            </CounterContainer>
        );
    }

    const Header = () => {

        // comments are for Gray Bar indicating slide-to-close, if we ever put it in. 
        const HeaderContainer = styled(View)`
            justify-content: center;
            margin-left: 12px;
            margin-right: 12px;
            padding-top: 6px;
            padding-bottom: 6px;
            ${
            //margin - top: 12px;
            ""
            }
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
        const headerText = reelay.comments.length
			? `${reelay.comments.length} comments`
			: "No comments... be the first!";
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

    const Comments = () => {
        const CommentsContainer = styled(View)`
            width: 100%;
            padding-top: 13px;
        `
        return (
            <CommentsContainer>
                {reelay.comments.map((comment, i) => (
                    <Comment comment={comment} key={(comment.userID ?? comment.authorName) + comment.postedAt} />
                ))}
            </CommentsContainer>
        );
    }

    const Comment = ({ comment }) => {
        const [commentLiked, setCommentLiked] = useState(false); // alter to make default state the database value for whether you've liked that comment yet or not.
		const [numCommentLikes, setNumCommentLikes] = useState(0); // similarly alter to make default state the database value for the number of comment likes currently
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
		const username = comment.userID ?? comment.authorName;
		const timestamp = moment(comment.postedAt).fromNow();

		const onPress = async () => {
			const creator = await getUserByUsername(username);
			setCommentsVisible(false);
			navigation.push("UserProfileScreen", {
				creator: creator,
			});
		};

		return (
            <CommentItemContainer onPress={onPress}>
				<LeftCommentIconContainer>
					<CommentProfilePhoto source={ReelayIcon} />
				</LeftCommentIconContainer>
				<CommentTextContainer>
					<UsernameText>{`@${username}`}</UsernameText>
					<CommentText>
						{comment.content} <CommentTimestampText>{timestamp}</CommentTimestampText>
					</CommentText>
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
	};;


    const CommentBox = () => {
        const Spacer = styled(View)`
            height: ${props => props.height ? props.height : '0px'};
        `
        const CommentButtonContainer = styled(Pressable)`
            margin-top: 16px;
            margin-bottom: 32px;
            width: 100%;
        `    
        const CommentButtonStyle = {
            alignSelf: 'center',
            borderRadius: 48,
            backgroundColor: '#db1f2e',
            height: 48,
            width: '80%',
            zIndex: 4,
        }

        const CommentProfilePhotoContainer = styled(View)`
			width: 32px;
		`;
        const PostButtonContainer = styled(View)`
            width: 70px;
            height: 40px;
        `

        const BlackBoxContainerStyle = {
			backgroundColor: "#0d0d0d",
			minHeight: 80,
			paddingBottom: 24,
            paddingTop: 12,
            paddingLeft: 16,
            paddingRight: 12,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
		};

        const TextBoxStyle = {
            width: width - 138,
        }

        const TextInputStyle = {
            alignSelf: 'center',
            color: 'white',
            fontFamily: 'Outfit-Regular',
            fontSize: 18,
            fontStyle: 'normal',
            lineHeight: 24,
            letterSpacing: 0.25,
            textAlign: 'left',
            paddingLeft: 16,
            paddingRight: 16,
            width: '100%',
        }

        const [commentText, setCommentText] = useState('');
        const [maxDrawerHeight, setMaxDrawerHeight] = useState(height);
        const scrollViewRef = useRef();

        const keyboardWillShow = async (e) => {
            const keyboardHeight = e.endCoordinates.height;
            const shortHeight = height - keyboardHeight;
            setMaxDrawerHeight(shortHeight);
        }
    
        const keyboardWillHide = async (e) => {
            setMaxDrawerHeight(height);
        }
    
        Keyboard.addListener('keyboardWillShow', keyboardWillShow);
        Keyboard.addListener('keyboardWillHide', keyboardWillHide);

        const onCommentPost = async () => {
            const commentBody = {
                authorName: cognitoUser.username,
                authorSub: cognitoUser?.attributes?.sub,        
                content: commentText,        
                creatorName: reelay.creator.username,
                creatorSub: reelay.creator.sub,
                postedAt: new Date().toISOString(),
                reelaySub: reelay.sub,
                visibility: FEED_VISIBILITY,
            }
            reelay.comments.push(commentBody);

			const postResult = await postCommentToDB(commentBody, reelay.sub);
			console.log('Comment posted: ', postResult);

            await sendCommentNotificationToCreator({
                creatorSub: reelay.creator.sub,
                author: cognitoUser,
                reelay: reelay,
                commentText: commentText,
            });
            await sendCommentNotificationToThread({
                creator: reelay.creator,
                author: cognitoUser,
                reelay: reelay,
                commentText: commentText,
            });
            setCommentText('');
            scrollViewRef.current.scrollToEnd({ animated: true });

            logAmplitudeEventProd('commentedOnReelay', {
				user: cognitoUser.username,
				creator: reelay.creator.username,
				title: reelay.title.display,
				reelayID: reelay.id,
                commentText: commentText,
			});
        }

        return (
			<View>
				{reelay.comments.length > 0 && (
					<>
						<ScrollView
							ref={scrollViewRef}
							style={{
								maxHeight: maxDrawerHeight / 3,
							}}
						>
							<Comments />
						</ScrollView>
						<Spacer height="12px" />
					</>
				)}

				{/* Setting up TextInput as a styled component forces the keyboard to disappear... */}
				<View style={BlackBoxContainerStyle}>
					<CommentProfilePhotoContainer>
						<CommentProfilePhoto source={ReelayIcon} />
					</CommentProfilePhotoContainer>
					<View style={TextBoxStyle}>
						<TextInput
							maxLength={MAX_COMMENT_LENGTH}
							multiline
                            numberOfLines={4}
                            blurOnSubmit={true}
							onChangeText={(text) => setCommentText(text)}
							placeholder={"Add comment..."}
							placeholderTextColor={"gray"}
							returnKeyType="done"
							style={TextInputStyle}
							defaultValue={commentText}
						/>
						<CharacterCounter commentTextLength={commentText.length} />
                    </View>
                    <PostButtonContainer>
                        <BWButton disabled={!commentText.length} text={"Post"} onPress={commentText => {
                            onCommentPost(commentText);
                            Keyboard.dismiss();
                        }} />
                    </PostButtonContainer>

					{/* <CommentButtonContainer>
                    <Button buttonStyle={CommentButtonStyle} 
                        disabled={!commentText.length}
                        
                        title='Post'
                        titleStyle={{ color: 'white', fontSize: 18 }} 
                        type='solid' 
                    />
                </CommentButtonContainer> */}
				</View>
			</View>
		);
    };

    return (
		<ModalContainer>
            <Modal animationType="slide" transparent={true} visible={commentsVisible}>
				<KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
					<Backdrop onPress={closeDrawer} />
					
                    <DrawerContainer>
							<Header />
							<CommentBox />
                        {/* <CloseButton /> */}
					</DrawerContainer>
				</KeyboardAvoidingView>
			</Modal>
		</ModalContainer>
	);
};