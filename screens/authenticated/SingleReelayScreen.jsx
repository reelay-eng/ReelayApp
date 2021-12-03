import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getReelay, prepareReelay } from '../../api/ReelayDBApi';

import ReelayFeed from '../../components/home/ReelayFeed';
import styled from 'styled-components/native';

export default SingleReelayScreen = ({ navigation, route }) => {
    const { reelaySub } = route.params;
    const [fixedStackList, setFixedStackList] = useState([]);

    const loadSingleReelay = async (reelaySub) => {
        const singleReelay = await getReelay(reelaySub);
        const preparedReelay = await prepareReelay(singleReelay);
        console.log('prepared reelay: ', preparedReelay);
        setFixedStackList([preparedReelay]);
    }

    useEffect(() => {
        loadSingleReelay(reelaySub);
    }, []);

    const TitleFeedContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `
    return (
        <TitleFeedContainer>
            <ReelayFeed 
                navigation={navigation} 
                initialStackPos={0} 
                fixedStackList={fixedStackList} 
            />
        </TitleFeedContainer>
    );
}