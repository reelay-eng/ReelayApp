import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getReportedReelayStacks } from '../../api/ReelayDBApi';

import ReportedReelayFeed from '../../components/home/FixedReelayStack';
import styled from 'styled-components/native';

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

    const loadReportedReelays = async () => {
        const reportedContent = await getReportedReelayStacks();
        if (reportedContent && !reportedContent.error) {
            setReportedReelayStacks(reportedContent);
        }
    }

    return (
        <ReportedContentFeedContainer>
            <ReportedReelayFeed navigation={navigation} initialFeedPos={0} fixedStackList={reportedReelayStacks} />
        </ReportedContentFeedContainer>
    );
}