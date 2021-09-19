import React, { useContext, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, View, Text, TextInput, Pressable } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';
import styled from 'styled-components/native';

export default CommentsDrawer = ({ reelay }) => {

    console.log('comments drawer is rendering');

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13
    const CLOSE_BUTTON_SIZE = 36;
    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const CommentItemContainer = styled(View)`
        margin: 10px;
        width: 100%;
    `
    const DrawerContainer = styled(View)`
        background-color: black;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        padding-bottom: 80px;
        width: 100%;
    `
    const ModalContainer = styled(View)`
        position: absolute;
    `
    const UsernameText = styled(Text)`
        font-family: System;
        font-size: 20px;
        color: white;
    `
    const { commentsVisible, setCommentsVisible } = useContext(VisibilityContext);
    const closeDrawer = () => {
        Keyboard.dismiss();
        setCommentsVisible(false);
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
        return (
            <HeaderContainer>
                <HeaderText>{'Comments'}</HeaderText>
                <Pressable onPress={closeDrawer}>
                    <Icon color={'white'} type='ionicon' name='close' size={CLOSE_BUTTON_SIZE} />
                </Pressable>
            </HeaderContainer>
        );
    }

    const Comments = () => {
        const CommentsContainer = styled(View)`
            width: 100%;
        `
        console.log('comments keep rendering');
        return (
            <CommentsContainer>
                { reelay.comments.map(comment => {
                    return (
                        <CommentItemContainer key={comment.userID}>
                            <UsernameText>{comment.userID}</UsernameText>
                        </CommentItemContainer>
                    );
                })}
                <CommentItemContainer >
                    <UsernameText>{'Test comment'}</UsernameText>
                </CommentItemContainer>
            </CommentsContainer>
        );
    }


    const CommentBox = () => {
        const [commentText, setCommentText] = useState('');
        const CommentButtonContainer = styled(View)`
            background-color: black;
            width: 100%;
        `    
        return (
            <View>
                <TextInput 
                    onChangeText={text => setCommentText(text)}
                    placeholder={'Start a flame war...'}
                    placeholderTextColor={'gray'}
                    style={{ 
                        color: 'white',
                        fontSize: 20,
                        padding: 10, 
                        fontFamily: 'System',
                    }}
                    defaultValue={commentText}
                />
                <CommentButtonContainer>
                    <Button title='Post' type='solid' buttonStyle={{ 
                        alignSelf: 'center',
                        backgroundColor: 'white',
                        margin: 10,
                        width: '50%',
                    }} titleStyle={{ color: 'black'}} />
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
                        <Pressable onPress={Keyboard.dismiss}>
                            <Header />
                            <Comments />
                        </Pressable>
                        <CommentBox />
                    </DrawerContainer>
                </KeyboardAvoidingView>
            </Modal>
        </ModalContainer>
    );
};