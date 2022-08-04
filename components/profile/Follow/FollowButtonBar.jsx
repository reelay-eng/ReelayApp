import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import FollowButton from '../../global/FollowButton';

const FollowContainer = styled(View)`
    align-items: center;
    margin: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
`;

export default FollowButtonBar = ({ creator }) => {
    return (
        <FollowContainer>
            <FollowButton creator={creator} bar/>
        </FollowContainer>
    );
};
