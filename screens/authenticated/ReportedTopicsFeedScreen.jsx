import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';
import moment from 'moment';
import { AuthContext } from '../../context/AuthContext';

import * as ReelayText from '../../components/global/Text';
import { getReportedTopics } from '../../api/TopicsApi';
import BackButton from '../../components/utils/BackButton';
import TopicCard from '../../components/topics/TopicCard';

const HeaderContainer = styled(View)`
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 10px;
    margin-bottom: 16px;
`
const HeaderLeftContainer = styled(View)`
    align-items: center;
    flex-direction: row;
`
const HeaderText = styled(ReelayText.H5Emphasized)`
    color: white;
    margin-left: 20px;
    margin-top: 4px;
`
const PolicyViolationTicketContainer = styled(View)`
    background-color: #1a1a1a;
    border-radius: 6px;
    flex-direction: row;
    margin-top: 6px;
    padding: 6px;
    width: 100%;
`
const PolicyViolationText = styled(ReelayText.Body2)`
    color: white;
`
const ReportedContentFeedContainer = styled(SafeAreaView)`
    height: 100%;
    width: 100%;
    background-color: black;
`
const TopicCardContainer = styled(View)`
    margin: 18px;
    margin-left: 0px;
`
const TopicScrollContainer = styled(ScrollView)`
    padding-left: 15px;
    padding-bottom: 80px;
    width: 100%;
`
const Header = ({ navigation }) => {
    return (
        <HeaderContainer>
            <HeaderLeftContainer>
                <BackButton navigation={navigation} />
                <HeaderText>{'Reported Topics'}</HeaderText>
            </HeaderLeftContainer>
        </HeaderContainer>
    );
}

const PolicyViolationTicket = ({ policyViolationCode, reportedAt }) => {
    const timestampText = moment(reportedAt).fromNow();
    const violationText = `${policyViolationCode}, reported ${timestampText} ago`;
    return (
        <PolicyViolationTicketContainer>
            <PolicyViolationText>
                {violationText}
            </PolicyViolationText>
        </PolicyViolationTicketContainer>
    );
}

const ReportedTopic = ({ navigation, topic }) => {
    const userReports = JSON.parse(topic.userReportsJSON);
    return (
        <TopicCardContainer key={topic.id}>
            <TopicCard navigaton={navigation} topic={topic} />
            { userReports.map(({ policyViolationCode, reportedAt }) => {
                return <PolicyViolationTicket 
                    key={reportedAt}
                    policyViolationCode={policyViolationCode} 
                    reportedAt={reportedAt} />;
            })}
        </TopicCardContainer>
    )
}

export default ReportedTopicsFeedScreen = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const [reportedTopics, setReportedTopics] = useState([]);

    useEffect(() => {
        loadReportedTopics();
    }, []);

    const sortReportedTopics = (topic0, topic1) => {
        const lastReported0 = moment(topic0.lastReportedAt);
        const lastReported1 = moment(topic1.lastReportedAt);
        console.log('reported 0: ', lastReported0);
        console.log('reported 1: ', lastReported1);
        return lastReported1.diff(lastReported0, 'minutes');
    }

    const loadReportedTopics = async () => {
        const reportedContent = await getReportedTopics({ reqUserSub: reelayDBUser?.sub });
        console.log('reported content: ', reportedContent);
        if (reportedContent && !reportedContent.error) {
            setReportedTopics(reportedContent.sort(sortReportedTopics));
        }
    }

    return (
        <ReportedContentFeedContainer>
            <Header navigation={navigation} />
            <TopicScrollContainer showVerticalScrollIndicator={false}>
                { reportedTopics.map((topic) => {
                    return <ReportedTopic navigation={navigation} topic={topic} />
                })}
            </TopicScrollContainer>
        </ReportedContentFeedContainer>
    );
}