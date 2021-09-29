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
import { VisibilityContext } from '../../context/VisibilityContext';
import styled from 'styled-components/native';
import moment from 'moment';

import { addComment, deleteComment, getComments } from '../../api/ReelayApi';
import { sendCommentNotificationToCreator, sendCommentNotificationToThread } from '../../api/NotificationsApi';

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
        height: auto;
        margin-top: auto;
        padding-bottom: 40px;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const { user } = useContext(AuthContext);
    const { commentsVisible, setCommentsVisible } = useContext(VisibilityContext);
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
            font-size: 16px;
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
            align-items: center;
            flex-direction: row;
            justify-content: space-between;
            margin: 12px;
        `
        const HeaderText = styled(Text)`
            font-family: System;
            font-size: 20px;
            font-weight: 500;
            color: white;
        `
        const headerText = reelay.comments.length ? `Comments (${reelay.comments.length})` : 'Comments';
        return (
            <HeaderContainer>
                <HeaderText>{headerText}</HeaderText>
                <Pressable onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE} />
                </Pressable>
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
            padding-bottom: 60px;
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
            font-size: 18px;
            font-weight: 400;
            color: white;
            margin-top: 10px;
        `
        const TimestampText = styled(Text)`
            font-family: System;
            font-size: 16px;
            font-weight: 400;
            color: white;
        `
        const UsernameText = styled(Text)`
            font-family: System;
            font-size: 16px;
            font-weight: 500;
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
        const [commentText, setCommentText] = useState('');
        const scrollViewRef = useRef();

        const CommentBoxLip = styled(View)`
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            height: 12px;
        `
        const CommentButtonContainer = styled(Pressable)`
            background-color: black;
            margin-top: 20px;
            width: 100%;
        `    
        const CommentButtonStyle = {
            alignSelf: 'center',
            backgroundColor: 'white',
            margin: 10,
            width: '50%',
        }

        const TextInputStyle = {
            borderColor: 'white',
            borderRadius: 10,
            borderWidth: 1,
            color: 'white',
            fontSize: 20,
            
            padding: 16, 
            paddingTop: 16,
            fontFamily: 'System',
        }

        const onCommentPostNotify = async () => {
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
        }

        return (
            <View>
                <ScrollView ref={scrollViewRef} style={{ 
                        maxHeight: height / 3,
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
                        onPress={onCommentPostNotify}
                        title='Post'
                        titleStyle={{ color: 'black'}} 
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
                <KeyboardAvoidingView behavior='padding' style={{flex: 1}} >
                    <DrawerContainer>
                        <Header />
                        <CommentBox />
                        <CloseButton />
                    </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
};