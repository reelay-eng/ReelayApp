import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, View } from 'react-native';
import styled from 'styled-components/native';
import moment from 'moment';
import { AuthContext } from '../../context/AuthContext';

import * as ReelayText from '../../components/global/Text';
import BackButton from '../../components/utils/BackButton';
import { getReportedIssues } from '../../api/ReelayDBApi';
import { useSelector } from 'react-redux';
import ReelayColors from '../../constants/ReelayColors';

const { width } = Dimensions.get('window');

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
const EmailText = styled(ReelayText.H6)`
    color: white;
    font-size: 16px;
    margin-bottom: 8px;
`
const IssueText = styled(ReelayText.Body2)`
    color: white;
    margin-bottom: 8px;
`
const ReportedContentFeedContainer = styled(SafeAreaView)`
    height: 100%;
    width: 100%;
    background-color: black;
`
const IssueCardContainer = styled(View)`
    border-color: white;
    background-color: ${ReelayColors.reelayBlack};
    border-radius: 8px;
    border-width: 1px;
    margin: 8px;
    padding: 16px;
`
const IssueScrollContainer = styled(ScrollView)`
    margin-left: 16px;
    margin-right: 16px;
    padding-bottom: 80px;
    width: ${width - 40}px;
`
const TimestampText = styled(ReelayText.Body2)`
    color: white;
`
export default AdminReportedIssuesScreen = ({ navigation }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const authSession = useSelector(state => state.authSession);
    const [reportedIssues, setReportedIssues] = useState([]);

    useEffect(() => {
        loadReportedIssues();
    }, []);

    const mostRecent = (issue0, issue1) => {
        const reportedAt0 = moment(issue0.createdAt);
        const reportedAt1 = moment(issue1.createdAt);
        return reportedAt1.diff(reportedAt0, 'minutes');
    }

    const loadReportedIssues = async () => {
        const fetchedIssues = await getReportedIssues({ authSession, reqUserSub: reelayDBUser?.sub });
        if (fetchedIssues && !fetchedIssues.error) {
            setReportedIssues(fetchedIssues.sort(mostRecent));
        }
    }

    const Header = () => {
        return (
            <HeaderContainer>
                <HeaderLeftContainer>
                    <BackButton navigation={navigation} />
                    <HeaderText>{'Reported Issues'}</HeaderText>
                </HeaderLeftContainer>
            </HeaderContainer>
        );
    }    

    const ReportedIssueCard = ({ issue }) => {
        const displayEmail = (issue?.email === '') ? '[anonymous]' : issue?.email;
        const displayUsername = (issue?.email === '') ? '' : `@${issue?.username}`;
        const timeAgoReported = moment(issue?.createdAt).fromNow();
        const timestampText = `reported ${timeAgoReported} ago`;    
        return (
            <IssueCardContainer>
                { (displayUsername.length > 0) && <EmailText>{displayUsername}</EmailText> }
                <EmailText>{displayEmail}</EmailText>
                <IssueText>{issue?.issueText}</IssueText>
                <TimestampText>{timestampText}</TimestampText>
            </IssueCardContainer>
        );
    }


    return (
        <ReportedContentFeedContainer>
            <Header navigation={navigation} />
            <IssueScrollContainer showVerticalScrollIndicator={false}>
                { reportedIssues.map((issue) => {
                    return <ReportedIssueCard key={issue?.id} issue={issue} />
                })}
            </IssueScrollContainer>
        </ReportedContentFeedContainer>
    );
}