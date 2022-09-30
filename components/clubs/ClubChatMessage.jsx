import React, { useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import ProfilePicture from '../global/ProfilePicture';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';
import moment from 'moment';

const { height, width } = Dimensions.get('window');

const AuthorText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 14px;
    line-height: 20px;
`
const ChatMessageBodyView = styled(View)`
    margin-left: 12px;
`
const ChatMessageView = styled(View)`
    flex-direction: row;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width-32}px;
`
const ChatMessageOuterView = styled(View)`
    padding-left: 16px;
    padding-right: 16px;
`
const DotMenuButtonView = styled(TouchableOpacity)`
    right: 8px;
    position: absolute;
`
const MessageText = styled(ReelayText.Body2)`
    color: white;
    line-height: 20px;
`
const MessageTextView = styled(View)`
    width: ${width - 80}px;
`
const OverlineView = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-bottom: 4px;
`
const ProfilePictureView = styled(View)`
    margin-top: 6px;
`
const TimestampText = styled(ReelayText.Body2)`
    color: #9D9D9D;
    font-size: 12px;
    line-height: 14px;
`
const TopRowSpacer = styled(View)`
    width: 6px;
`

const DotMenuButton = ({ message }) => {
    const [dotMenuVisible, setDotMenuVisible] = useState(false);
    const openDrawer = () => setDotMenuVisible(true);
    return (
        <DotMenuButtonView onPress={openDrawer}>
            <Icon type='ionicon' name='ellipsis-vertical' size={20} color='white' />
            { dotMenuVisible && ( <View /> )}
        </DotMenuButtonView>
    );
}

export default ClubChatMessage = ({ message }) => {
    const timestampString = moment(message?.createdAt).format("hh:mm A");
    const author = { 
        username: message?.username,
        sub: message?.userSub,
    }

    const ChatMessageBody = () => {
        return (
            <ChatMessageBodyView>
                <OverlineView>
                    <AuthorText>{author?.username}</AuthorText>
                    <TopRowSpacer />
                    <TimestampText>{timestampString}</TimestampText>
                </OverlineView>
                <MessageTextView>
                    <MessageText>{message?.text ?? ''}</MessageText>
                </MessageTextView>
            </ChatMessageBodyView>
        );
    }

    return (
        <ChatMessageOuterView>
            <ChatMessageView>
                <ProfilePictureView>
                    <ProfilePicture user={author} size={32} />
                </ProfilePictureView>
                <ChatMessageBody />
                {/* <DotMenuButton message={message} /> */}
            </ChatMessageView>
        </ChatMessageOuterView>
    );
}