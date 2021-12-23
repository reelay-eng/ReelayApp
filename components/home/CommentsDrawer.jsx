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
import Constants from 'expo-constants';

import { 
    sendCommentNotificationToCreator, 
    sendCommentNotificationToThread 
} from '../../api/NotificationsApi';

import * as Amplitude from 'expo-analytics-amplitude';
import { getRegisteredUser, getUserByUsername, postCommentToDB } from '../../api/ReelayDBApi';

const { height, width } = Dimensions.get('window');

export default CommentsDrawer = ({ reelay, navigation }) => {

    // https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13
    const CLOSE_BUTTON_SIZE = 36;
    const MAX_COMMENT_LENGTH = 200;

    const FEED_VISIBILITY = Constants.manifest.extra.feedVisibility;

    const Backdrop = styled(Pressable)`
        background-color: transparent;
        height: 100%;
        position: absolute;
        width: 100%;
    `
    const DrawerContainer = styled(View)`
        background-color: #1e1e1e;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
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

    const Comments = () => {
        const CommentsContainer = styled(View)`
            width: 100%;
            padding-left: 16px;
            padding-right: 16px;
        `
        const CommentItemContainer = styled(Pressable)`
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
                    // main feed currently returns from DataStore, using userID
                    // profile feeds return from ReelayDB, using authorName
                    const username = comment.userID ?? comment.authorName;

                    const key = username + comment.postedAt;
                    const timestamp = moment(comment.postedAt).fromNow();

                    const onPress = async () => {
                        const creator = await getUserByUsername(username);
                        setCommentsVisible(false);
                        navigation.push('UserProfileScreen', {
                            creator: creator,
                        });
                    }

                    return (
                        <CommentItemContainer key={key} onPress={onPress}>
                            <CommentHeaderContainer>
                                <UsernameText>{`@${username}`}</UsernameText>
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
            borderColor: 'white',
            borderRadius: 10,
            borderWidth: 1,
            color: 'white',

            fontFamily: 'System',
            fontSize: 16,
            
            padding: 16, 
            paddingTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
            width: width - 48,
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
            <Modal animationType='slide' transparent={true} visible={commentsVisible} >
                <KeyboardAvoidingView behavior='padding' style={{flex: 1}}>
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