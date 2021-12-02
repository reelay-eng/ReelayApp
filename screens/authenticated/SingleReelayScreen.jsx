import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import ReelayFeed from '../../components/home/ReelayFeed';
import styled from 'styled-components/native';

export default SingleReelayScreen = ({ navigation, route }) => {
    const { reelaySub } = route.params;
    const [fixedStackList, setFixedStackList] = useState([]);

    const loadSingleReelay = async (reelaySub) => {
        const singleReelay = await getReelay(reelaySub);
        setFixedStackList([singleReelay]);
    }

    useEffect(() => {
        loadSingleReelay(reelaySub);
    })

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