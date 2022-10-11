import React, { useContext, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

import styled from 'styled-components/native';
import moment from 'moment';
import { getReportedChatMessages } from '../../api/ClubsApi';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderWithBackButton } from '../../components/global/Headers';
import ClubChatMessage from '../../components/clubs/ClubChatMessage';

const HeaderView = styled(View)`
    top: ${props => props.topOffset}px;
    position: absolute;
    width: 100%;
`
const ReportedContentFeedContainer = styled(View)`
    background-color: black;
    height: 100%;
    width: 100%;
`

export default ReportedChatMessagesScreen = ({ navigation }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [reportedMessages, setReportedMessages] = useState([]);
    const topOffset = useSafeAreaInsets().top;

    useEffect(() => {
        loadReportedMessages();
    }, []);

    const sortReportedMessages = (message0, message1) => {
        const lastReported0 = moment(message0.lastReportedAt);
        const lastReported1 = moment(message1.lastReportedAt);
        return lastReported1.diff(lastReported0, 'minutes');
    }

    const loadReportedMessages = async () => {
        const reportedContent = await getReportedChatMessages({ authSession, reqUserSub: reelayDBUser?.sub });
        if (reportedContent && !reportedContent.error) {
            setReportedMessages(reportedContent.sort(sortReportedMessages));
        }
    }

    const renderReportedMessage = ({ item, index }) => {
        const message = item;
        return (
            <ClubChatMessage 
                loadChatMessageHistory={() => {}}  // don't need to
                message={message} 
                navigation={navigation} 
                socketRef={null} // not entering the chat
            /> 
        );
    }

    return (
        <ReportedContentFeedContainer>
            <FlatList
                contentContainerStyle={{ top: topOffset + 40, paddingBottom: 300 }}
                data={reportedMessages}
                renderItem={renderReportedMessage}
                showsVerticalScrollIndicator={false}
            />
            <HeaderView topOffset={topOffset}>
                <HeaderWithBackButton navigation={navigation} text='Reported messages' />
            </HeaderView>
        </ReportedContentFeedContainer>
    );
}