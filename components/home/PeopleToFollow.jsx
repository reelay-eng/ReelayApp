import React, { Fragment, useContext, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
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
const RowContainer = styled(ScrollView)`
    display: flex;
    padding-left: 15px;
    padding-top: 15px;
    flex-direction: row;
    width: 100%;
`
const UsernameText = styled(ReelayText.Body2)`
    color: white;
    margin-top: 6px;
`

export default PeopleToFollow = ({ navigation }) => {
    const myFollowing = useSelector(state => state.myFollowing);
    const peopleToFollowList = myFollowing.slice(0, 10);

    const renderFollowOption = (followObj) => {
        const user = { sub: followObj?.creatorSub, username: followObj?.creatorName };
        return (
            <FollowOptionContainer key={user?.sub}>
                <ProfilePicture border={true} navigation={navigation} size={100} user={user} />
                <UsernameText>{user?.username}</UsernameText>
            </FollowOptionContainer>
        )
    }

    return (
        <Fragment>
            <HeaderContainer>
                <FontAwesomeIcon icon={faUserPlus} color='white' size={24} />
                <HeaderText>{'New to follow'}</HeaderText>
            </HeaderContainer>
            <RowContainer horizontal showsHorizontalScrollIndicator={false}>
                { peopleToFollowList.map(renderFollowOption)}
            </RowContainer>
        </Fragment>
    )
}