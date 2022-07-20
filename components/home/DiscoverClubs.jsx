import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import ClubPicture from '../global/ClubPicture';
import { ClubsIconSVG } from '../global/SVGs';
import { getClubsDiscover } from '../../api/ClubsApi';

import moment from 'moment';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';

const ActiveClubsContainer = styled(View)`
    margin-bottom: 10px;
`
const ClubNameText = styled(ReelayText.Body2)`
    color: white;
    margin-top: 6px;
`
const OptionContainer = styled(TouchableOpacity)`
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

export default PopularClubs = ({ navigation }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const [discoverClubs, setDiscoverClubs] = useState([]);
    const displayClubs = discoverClubs.sort(byMostRecent);

    const byMostRecent = (club0, club1) => {
        try {
            const lastActivity0 = moment(club0.lastActivityAt);
            const lastActivity1 = moment(club1.lastActivityAt); 
            return lastActivity1.diff(lastActivity0, 'seconds');
        } catch (error) {
            console.log(error);
            return 1;
        }
    }

    const loadDiscoverClubs = async () => {
        if (discoverClubs?.length > 0) return;
        const nextDiscoverClubs = await getClubsDiscover({
            authSession,
            page: 0,
            reqUserSub: reelayDBUser?.sub,
        });
        setDiscoverClubs(nextDiscoverClubs);
    }
    
    const renderClubOption = (club) => {
        const advanceToClubActivityScreen = () => navigation.navigate('ClubActivityScreen', { club })
        return (
            <OptionContainer key={club?.id} onPress={advanceToClubActivityScreen}>
                <ClubPicture navigation={navigation} size={100} club={club} />
                <ClubNameText>{club?.name}</ClubNameText>
            </OptionContainer>
        )
    }

    useEffect(() => {
        loadDiscoverClubs();
    }, []);

    if (!discoverClubs?.length > 0) return <View />;

    return (
        <ActiveClubsContainer>
            <HeaderContainer>
                <ClubsIconSVG size={24} />
                <HeaderText>{'Discover clubs'}</HeaderText>
            </HeaderContainer>
            <RowContainer horizontal showsHorizontalScrollIndicator={false}>
                { displayClubs.map(renderClubOption) }
            </RowContainer>
        </ActiveClubsContainer>
    )
}