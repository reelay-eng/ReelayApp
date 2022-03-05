import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getReportedReelayStacks } from '../../api/ReelayDBApi';

import ReportedReelayFeed from '../../components/feed/FixedReelayStack';
import styled from 'styled-components/native';
import moment from 'moment';

export default ReportedContentFeedScreen = ({ navigation }) => {
    const ReportedContentFeedContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `
    const [reportedReelayStacks, setReportedReelayStacks] = useState([]);

    useEffect(() => {
        loadReportedReelays();
    }, []);

    const sortReportedReelays = (stack0, stack1) => {
        const lastReported0 = moment(stack0[0].reportedContent.lastReportedAt);
        const lastReported1 = moment(stack1[0].reportedContent.lastReportedAt);
        console.log('reported 0: ', lastReported0);
        console.log('reported 1: ', lastReported1);
        return lastReported1.diff(lastReported0, 'minutes');
    }

    const loadReportedReelays = async () => {
        const reportedContent = await getReportedReelayStacks();
        console.log('reported content: ', reportedContent);
        if (reportedContent && !reportedContent.error) {
            setReportedReelayStacks(reportedContent.sort(sortReportedReelays));
        }
    }

    return (
        <ReportedContentFeedContainer>
            <ReportedReelayFeed navigation={navigation} initialFeedPos={0} fixedStackList={reportedReelayStacks} />
        </ReportedContentFeedContainer>
    );
}