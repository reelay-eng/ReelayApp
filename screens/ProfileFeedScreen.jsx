import React, { useContext } from 'react';
import { View } from 'react-native';

import ReelayFeed from '../components/home/ReelayFeed';
import styled from 'styled-components/native';

export default ProfileFeedScreen = ({ navigation, route }) => {
    const { initialFeedPos, stackList } = route.params;
    const ProfileFeedContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `
    console.log('Rendering profile feed screen');
    console.log(stackList.length);

    console.log(stackList[0]);

    return (
        <ProfileFeedContainer>
            <ReelayFeed navigation={navigation} initialFeedPos={initialFeedPos} fixedStackList={stackList} />
        </ProfileFeedContainer>
    );
}