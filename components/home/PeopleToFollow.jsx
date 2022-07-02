import React from 'react';
import { ScrollView, View } from 'react-native';
import { logAmplitudeEventProd } from '../utils/EventLogger'
import styled from 'styled-components';
import * as ReelayText from '../../components/global/Text';
import { useSelector } from 'react-redux';
import ProfilePicture from '../global/ProfilePicture';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

const FollowOptionContainer = styled(View)`
    align-items: center;
    height: 120px;
    margin: 6px;
`
const HeaderContainer = styled(View)`
    align-items: flex-end;
    flex-direction: row;
    margin-left: 15px;
    margin-top: 15px;
`
const HeaderText = styled(ReelayText.H5Bold)`
    color: white;
    font-size: 18px;
    margin-left: 12px;
`
const PeopleToFollowContainer = styled(View)`
    margin-bottom: 10px;
`
const RowContainer = styled(ScrollView)`
    display: flex;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 15px;
    flex-direction: row;
    width: 100%;
`
const Spacer = styled(View)`
    width: 15px;
`
const UsernameText = styled(ReelayText.Body2)`
    color: white;
    margin-top: 6px;
`

export default PeopleToFollow = ({ navigation }) => {
    const discoverCreators = useSelector(state => state.myHomeContent?.discover?.creators) ?? [];

    const renderFollowOption = (followObj) => {
        const sub = followObj?.userSub;
        const { username } = followObj;
        const user = { sub, username };
        return (
            <FollowOptionContainer key={sub}>
                <ProfilePicture border={true} navigation={navigation} size={100} user={user} />
                <UsernameText>{username}</UsernameText>
            </FollowOptionContainer>
        )
    }

    return (
        <PeopleToFollowContainer>
            <HeaderContainer>
                <FontAwesomeIcon icon={faUserPlus} color='white' size={24} />
                <HeaderText>{'New to follow'}</HeaderText>
            </HeaderContainer>
            <RowContainer horizontal showsHorizontalScrollIndicator={false}>
                { discoverCreators.map(renderFollowOption)}
                <Spacer />
            </RowContainer>
        </PeopleToFollowContainer>
    )
}