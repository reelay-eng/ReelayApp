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
const ChatMessageOuterView = styled(View)`
    padding-left: 16px;
    padding-right: 16px;
`
const DotMenuButtonView = styled(TouchableOpacity)`
    right: 8px;
    position: absolute;
`
const OverlineTopRowView = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-bottom: 4px;
`
const PostedMessageText = styled(ReelayText.Body2)`
    color: white;
    line-height: 20px;
`
const TimestampText = styled(ReelayText.Body2)`
    color: #9D9D9D;
    font-size: 12px;
    line-height: 14px;
`
const TitleOverlineView = styled(View)`
    align-items: center;
    flex-direction: row;
    margin-top: 8px;
    margin-bottom: 8px;
    width: ${width-32}px;
`
const TitleOverlineInfoView = styled(View)`
    margin-left: 8px;
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

const ChatMessageOverline = ({ message }) => {
    const author = { 
        username: message?.username,
        sub: message?.userSub,
    }
    const timestampString = moment(message?.createdAt).format("hh:mm A");

    return (
        <TitleOverlineView>
            <ProfilePicture user={author} size={32} />
            <TitleOverlineInfoView>
                <OverlineTopRowView>
                    <AuthorText>{author?.username}</AuthorText>
                    <TopRowSpacer />
                    <TimestampText>{timestampString}</TimestampText>
                </OverlineTopRowView>
                <PostedMessageText>{message?.text ?? ''}</PostedMessageText>
            </TitleOverlineInfoView>
            {/* <DotMenuButton message={message} /> */}
        </TitleOverlineView>
    );
}

export default ClubChatMessage = ({ message }) => {
    return (
        <ChatMessageOuterView>
            <ChatMessageOverline message={message} />
        </ChatMessageOuterView>
    )
}