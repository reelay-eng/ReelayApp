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
import * as ReelayText from '../../components/global/Text';
import ReelayIcon from '../../assets/icons/reelay-icon.png';

import { 
    sendCommentNotificationToCreator, 
    sendCommentNotificationToThread 
} from '../../api/NotificationsApi';

import * as Amplitude from 'expo-analytics-amplitude';
import { getRegisteredUser, getUserByUsername, postCommentToDB } from '../../api/ReelayDBApi';

const { height, width } = Dimensions.get('window');

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
            right: 24px;
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
        const HeaderContainer = styled(View)`
            justify-content: center;
            margin: 12px;
            border-bottom-color: #2D2D2D;
            border-bottom-width: 1px;
        `
        const GrayBar = styled(View)`
            border-radius: 10px;
            opacity: 0.2;
            border: solid 2px white;
            width: 70px;
            align-self: center;
        `
        const HeaderText = styled(ReelayText.CaptionEmphasized)`
            position: absolute;
            align-self: center;
            color: white;
        `
        const CloseButtonContainer = styled(Pressable)`
            align-self: flex-end;
            margin-bottom: 5px;
        `
        const headerText = reelay.comments.length
			? `${reelay.comments.length} comments`
			: "Comments";
        return (
            <HeaderContainer>
                <GrayBar />
                <HeaderText>{headerText}</HeaderText>
                <CloseButtonContainer onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE}/>
                </CloseButtonContainer>
            </HeaderContainer>
        );
    }

    const Comments = () => {
        const CommentsContainer = styled(View)`
            width: 100%;
        `
        const CommentItemContainer = styled(Pressable)`
            padding-left: 16px;
            padding-right: 16px;
            padding-bottom: 13px;
            display: flex;
            flex-direction: row;
        `
        const LeftCommentIconContainer = styled(View)`
            width: 10%;
            align-items: center;
            margin-right: 12px;
        `
        const RightCommentIconContainer = styled(Pressable)`
			width: 10%;
            flex-direction: column;
			align-items: center;
            justify-content: center;
		`;
        const CommentIconText = styled(ReelayText.Caption)`
			color: #86878b;
		`;
        const CommentProfilePhoto = styled(Image)`
            width: 32px;
            height: 32px;
            border-radius: 16px;
        `
        const CommentTextContainer = styled(View)`
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            width: 80%;
        `
        const CommentText = styled(ReelayText.Body2)`
            color: white;
        `
        const CommentTimestampText = styled(ReelayText.Body2)`
			color: #86878b;
		`;
        const UsernameText = styled(ReelayText.CaptionEmphasized)`
			color: #86878b;
            margin-bottom: 5px;
		`;
        return (
            <CommentsContainer>
                {reelay.comments.map(comment => {
                    const [commentLiked, setCommentLiked] = useState(false); // alter to make default state: 
                                                                            // the database value for whether you've liked that comment yet or not.
                    const [numCommentLikes, setNumCommentLikes] = useState(0); // similarly alter to make default state: 
                                                                                // the database value for the number of comment likes currently

                    const toggleCommentLike = () => {
                        const commentIsNowLiked = !commentLiked;
                        if (commentIsNowLiked) {
                            setNumCommentLikes(numCommentLikes + 1);
							/**
							 * Here, put logic for liking comment in DB and incrementing number of comment likes. React state updates automatically.
							 */
                        }
                        else {
							setNumCommentLikes(numCommentLikes - 1);
							/**
							 * Here, put logic for liking comment in DB and incrementing number of comment likes. React state updates automatically.
							 */
                        }
                        setCommentLiked(commentIsNowLiked);
                    }

                    // main feed currently returns from DataStore, using userID
                    // profile feeds return from ReelayDB, using authorName
                    const username = comment.userID ?? comment.authorName;
                    const key = username + comment.postedAt;
                    const timestamp = moment(comment.postedAt)
						.fromNow()
						.substr(0, 3)
						.replace(/\s/g, "");


                    const onPress = async () => {
                        const creator = await getUserByUsername(username);
                        setCommentsVisible(false);
                        navigation.push('UserProfileScreen', {
                            creator: creator,
                        });
                    }

                    return (
						<CommentItemContainer key={key} onPress={onPress}>
							<LeftCommentIconContainer>
								<CommentProfilePhoto source={ReelayIcon} />
							</LeftCommentIconContainer>
							<CommentTextContainer>
								<UsernameText>{`@${username}`}</UsernameText>
                                <CommentText>
                                    {comment.content}{" "}
                                    <CommentTimestampText>{timestamp}</CommentTimestampText>
                                </CommentText>
							</CommentTextContainer>
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
                })}
            </CommentsContainer>
        );
    }


    const CommentBox = () => {
        const CommentBoxLip = styled(View)`
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            height: 12px;
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

        const TextInputStyle = {
            alignSelf: 'center',
            color: 'white',
            fontFamily: 'Outfit-Regular',
            fontSize: 18,
            fontStyle: 'normal',
            lineHeight: 24,
            letterSpacing: 0.5,
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
                authorSub: cognitoUser.attributes.sub,        
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

            Amplitude.logEventWithPropertiesAsync('commentedOnReelay', {
				user: cognitoUser.username,
				creator: reelay.creator.username,
				title: reelay.title.display,
				reelayID: reelay.id,
                commentText: commentText,
			});
        }

        return (
            <View>
                <ScrollView ref={scrollViewRef} style={{ 
                    maxHeight: maxDrawerHeight / 3 
                }}>
                    <Comments />
                </ScrollView>
                <CommentBoxLip />

                {/* Setting up TextInput as a styled component forces the keyboard to disappear... */}
                <TextInput
                    maxLength={MAX_COMMENT_LENGTH}
                    multiline
                    numberOfLines={4}
                    onChangeText={text => setCommentText(text)}
                    placeholder={'Write something...'}
                    placeholderTextColor={'gray'}
                    returnKeyType='done'
                    style={TextInputStyle}
                    defaultValue={commentText}
                />
                <CharacterCounter commentTextLength={commentText.length} />
                <CommentButtonContainer>
                    <Button buttonStyle={CommentButtonStyle} 
                        disabled={!commentText.length}
                        onPress={commentText => {
                            onCommentPost(commentText);
                            Keyboard.dismiss();
                        }}
                        title='Post'
                        titleStyle={{ color: 'white', fontSize: 18 }} 
                        type='solid' 
                    />
                </CommentButtonContainer>
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