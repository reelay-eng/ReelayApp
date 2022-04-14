import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import FollowButton from '../../global/FollowButton';

const FollowContainer = styled(View)`
    width: 100%;
    display: flex;
    align-items: center;
`;

export default FollowButtonBar = ({ creator }) => {
    return (
        <FollowContainer>
            <FollowButton creator={creator} bar/>
        </FollowContainer>
    );
};
