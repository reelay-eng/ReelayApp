import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, View, Text, TextInput, Pressable } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { VisibilityContext } from '../../context/VisibilityContext';
import styled from 'styled-components/native';

const { height, width} = Dimensions.get('window');

export default CommentsDrawer = ({ reelay }) => {

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const CLOSE_BUTTON_SIZE = 36;

    const DrawerContainer = styled(View)`
        background-color: black;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        height: auto;
        margin-top: auto;
        padding-bottom: 80px;
        width: 100%;
    `
    const CommentsDrawerContainer = styled(View)`
        position: absolute;
    `
    const CommentItemContainer = styled(View)`
        margin: 10px;
        width: 100%;
    `
    const UsernameText = styled(Text)`
        font-family: System;
        font-size: 20px;
        color: white;
    `
    const { commentsVisible, setCommentsVisible } = useContext(VisibilityContext);
    const closeDrawer = () => setCommentsVisible(false);

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

    const AddComment = () => {
        const AddCommentContainer = styled(View)`
            width: 100%;
        `
        const [commentText, setCommentText] = useState('');
        return (
            <AddCommentContainer>
                <TextInput 
                    multiline
                    numberOfLines={4}
                    onChangeText={setCommentText}
                    placeholder={'Start a flame war...'}
                    placeholderTextColor={'white'}
                    style={{ padding: 10 }}
                    value={commentText}
                />
            </AddCommentContainer>
        );
    }

    return (
        <CommentsDrawerContainer>
            <Modal animationType='slide' transparent={true} visible={commentsVisible} >
                <Backdrop onPress={closeDrawer} />
                <DrawerContainer>
                    <Header />
                    <Comments />
                </DrawerContainer>
            </Modal>
        </CommentsDrawerContainer>
    );
}