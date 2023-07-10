import React from 'react';
import { View } from 'react-native';

import FixedReelayFeed from '../../components/feed/FixedReelayFeed';
import styled from 'styled-components/native';

export default ProfileFeedScreen = ({ navigation, route,}) => {
    const { initialFeedPos, stackList ,firstReelAfterSignup} = route.params;
    const creatorName = stackList?.[0]?.[0]?.creator?.username;
    const ProfileFeedContainer = styled(View)`
        height: 100%;
        width: 100%;
        background-color: black;
    `

    return (
        <ProfileFeedContainer>
            <FixedReelayFeed 
                headerDisplayText={creatorName}
                initialFeedPos={initialFeedPos} 
                feedSource='profile'
                fixedStackList={stackList} 
                navigation={navigation} 
                firstReelAfterSignup={firstReelAfterSignup}
            />
        </ProfileFeedContainer>
    );
}