import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import ClubPicture from '../global/ClubPicture';
import { ChatsIconSVG } from '../global/SVGs';
import { getClubsDiscover } from '../../api/ClubsApi';

import moment from 'moment';
import { useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const DiscoverClubsContainer = styled(View)`
    margin-bottom: 10px;
`
const ClubNameText = styled(ReelayText.Body2)`
    color: white;
    display: flex;
    flex-direction: row;
    margin-top: 6px;
    text-align: center;
`
const OptionContainer = styled(TouchableOpacity)`
    align-items: center;
    width: 120px;
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
const HeaderSubText = styled(ReelayText.Body2Emphasized)`
    color: white;
    line-height: 20px;
    margin-top: 8px;
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
                <ClubPicture border navigation={navigation} size={100} club={club} />
                <ClubNameText numberOfLines={2}>{club?.name}</ClubNameText>
            </OptionContainer>
        )
    }

    useEffect(() => {
        loadDiscoverClubs();
    }, []);

    if (!discoverClubs?.length > 0) return <View />;

    return (
        <DiscoverClubsContainer>
            <HeaderContainer>
                {/* <FontAwesomeIcon icon={faUsers} size={27} color='white' />
                <HeaderText>{'Public chat groups'}</HeaderText> */}
                <HeaderSubText>{'We think your contribution would be appreciated in these public chats'}</HeaderSubText>
            </HeaderContainer>
            <RowContainer contentContainerStyle={{ paddingRight: 40 }} horizontal showsHorizontalScrollIndicator={false}>
                { displayClubs.map(renderClubOption) }
            </RowContainer>
        </DiscoverClubsContainer>
    )
}