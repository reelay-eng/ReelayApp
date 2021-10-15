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
    View 
} from 'react-native';

import { Button, Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import styled from 'styled-components/native';
import moment from 'moment';

import { addComment, deleteComment, getComments } from '../../api/ReelayApi';
import { sendCommentNotificationToCreator, sendCommentNotificationToThread } from '../../api/NotificationsApi';

import * as Amplitude from 'expo-analytics-amplitude';

const { height, width } = Dimensions.get('window');

export default CommentsDrawer = ({ reelay }) => {

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13
    const CLOSE_BUTTON_SIZE = 36;
    const MAX_COMMENT_LENGTH = 200;

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const DrawerContainer = styled(View)`
        background-color: black;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        margin-top: auto;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const { user } = useContext(AuthContext);
    const { commentsVisible, setCommentsVisible } = useContext(FeedContext);
    const closeDrawer = () => {
        Keyboard.dismiss();
        setCommentsVisible(false);
    }

    const CharacterCounter = ({ commentTextLength }) => {
        const CounterContainer = styled(View)`
            flex-direction: row;
            justify-content: flex-end;
            margin-top: 10px;
            right: 10px;
            width: 100%;
        `
        const CounterText = styled(Text)`
            font-family: System;
            font-size: 14px;
            color: white;
        `
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
        `
        const HeaderText = styled(Text)`
            font-family: System;
            font-size: 20px;
            font-weight: 500;
            position: absolute;
            align-self: center;
            color: white;
        `
        const CloseButtonContainer = styled(Pressable)`
            align-self: flex-end;
        `
        const headerText = reelay.comments.length ? `Comments (${reelay.comments.length})` : 'Comments';
        return (
            <HeaderContainer>
                <HeaderText>{headerText}</HeaderText>
                <CloseButtonContainer onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE} />
                </CloseButtonContainer>
            </HeaderContainer>
        );
    }

    const CloseButton = () => {
        const ButtonContainer = styled(Pressable)`
            align-self: center;
            margin: 20px;
            width: 100%;
        `
        const CloseText = styled(Text)`
            align-self: center;
            font-family: System;
            font-size: 20px;
            font-weight: 400;
            color: white;
        `
        return (
            <ButtonContainer onPress={closeDrawer}>
                <CloseText>{'Close'}</CloseText>
            </ButtonContainer>
        );
    }

    const Comments = () => {
        const CommentsContainer = styled(View)`
            width: 100%;
        `
        const CommentItemContainer = styled(View)`
            margin-left: 10px;
            margin-right: 10px;
            margin-bottom: 30px;
        `
        const CommentHeaderContainer = styled(View)`
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
        `
        const CommentText = styled(Text)`
            font-family: System;
            font-size: 16px;
            font-weight: 400;
            color: white;
            margin-top: 10px;
        `
        const TimestampText = styled(Text)`
            font-family: System;
            font-size: 16px;
            font-weight: 300;
            color: white;
        `
        const UsernameText = styled(Text)`
            font-family: System;
            font-size: 16px;
            font-weight: 700;
            color: white;
        `
        return (
            <CommentsContainer>
                { reelay.comments.map(comment => {
                    const key = comment.userID + comment.postedAt;
                    const timestamp = moment(comment.postedAt).fromNow();
                    return (
                        <CommentItemContainer key={key}>
                            <CommentHeaderContainer>
                                <UsernameText>{`@${comment.userID}`}</UsernameText>
                                <TimestampText>{timestamp}</TimestampText>
                            </CommentHeaderContainer>
                            <CommentText>{comment.content}</CommentText>
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
            background-color: black;
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
        }

        const TextInputStyle = {
            borderColor: 'white',
            borderRadius: 10,
            borderWidth: 1,
            color: 'white',
            fontSize: 16,
            
            padding: 16, 
            paddingTop: 16,
            fontFamily: 'System',
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
            addComment(reelay, commentText, user);
            await sendCommentNotificationToCreator({
                creatorSub: reelay.creator.id,
                author: user,
                reelay: reelay,
                commentText: commentText,
            });
            await sendCommentNotificationToThread({
                creator: reelay.creator,
                author: user,
                reelay: reelay,
                commentText: commentText,
            });
            setCommentText('');
            scrollViewRef.current.scrollToEnd({ animated: true });

            Amplitude.logEventWithPropertiesAsync('commentedOnReelay', {
				user: user.username,
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
                    placeholder={'Start a flame war...'}
                    placeholderTextColor={'gray'}
                    style={TextInputStyle}
                    defaultValue={commentText}
                />
                <CharacterCounter commentTextLength={commentText.length} />
                <CommentButtonContainer onPress={Keyboard.dismiss}>
                    <Button buttonStyle={CommentButtonStyle} 
                        disabled={!commentText.length}
                        onPress={onCommentPost}
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
            <Modal animationType='slide' transparent={true} visible={commentsVisible} >
                <Backdrop onPress={closeDrawer} />
                <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
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