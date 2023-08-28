import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components';
import * as ReelayText from '../global/Text';
import ClubPicture from '../global/ClubPicture';
import { ChatsIconSVG } from '../global/SVGs';
import { getClubsDiscover, inviteMemberToClub } from '../../api/ClubsApi';

import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import ReelayColors from '../../constants/ReelayColors';
import { firebaseCrashlyticsError, firebaseCrashlyticsLog } from '../utils/EventLogger';

const DiscoverClubsContainer = styled(View)`
    margin-bottom: 18px;
`
const ClubNameText = styled(ReelayText.H5Bold)`
    color: white;
    display: flex;
    flex-direction: row;
    font-size: 18px;
    margin-top: 6px;
    text-align: center;
`
const OptionContainer = styled(TouchableOpacity)`
    align-items: center;
    border-radius: 8px;
    background-color: #1E1F20;
    height: 200px;
    justify-content: center;
    margin: 6px;
    padding: 12px;
    width: 200px;
`
const JoinClubPressable = styled(TouchableOpacity)`
    align-items: center;
    background-color: ${ReelayColors.reelayBlue};
    border-radius: 37px;
    height: 37px;
    justify-content: center;
    margin-top: 10px;
    width: 73px;
`
const JoinClubText = styled(ReelayText.CaptionEmphasized)`
    color: white;
`
const MemberCountText = styled(ReelayText.Body1)`
    color: white;
    margin-top: 6px;
`
const RowContainer = styled(ScrollView)`
    display: flex;
    padding-top: 15px;
    padding-left: 6px;
    padding-right: 40px;
    flex-direction: row;
    width: 100%;
`
const SectionBodyText = styled(ReelayText.H6)`
    color: white;
    font-size: 16px;
    margin: 12px;
    margin-bottom: 0px;
`
const SectionHeaderText = styled(ReelayText.H6Emphasized)`
    color: white;
    font-size: 24px;
    margin: 12px;
    margin-bottom: 0px;
`

export default PopularClubs = ({ navigation, refreshCounter = 0 }) => {
    try {
        firebaseCrashlyticsLog('Discover clubs');
        const authSession = useSelector(state => state.authSession);
        const myClubs = useSelector(state => state?.myClubs ?? []);
        const dispatch = useDispatch();
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

        const JoinClubButton = ({ club }) => {
            const [joining, setJoining] = useState(false);
            const joinClub = async () => {
                if (joining) return;
                // inviting yourself => auto-accept invite
                setJoining(true);
                const joinClubResult = await inviteMemberToClub({
                    authSession,
                    clubID: club.id,
                    userSub: reelayDBUser?.sub,
                    username: reelayDBUser?.username,
                    invitedBySub: reelayDBUser?.sub,
                    invitedByUsername: reelayDBUser?.username,
                    role: 'member',
                    clubLinkID: null,
                });
                dispatch({ type: 'setMyClubs', payload: [club, ...myClubs] });
                await loadDiscoverClubs();
                console.log(joinClubResult);
                setJoining(false);
            }

            return (
                <JoinClubPressable onPress={joinClub}>
                    {joining && <ActivityIndicator />}
                    {!joining && <JoinClubText>{'Join'}</JoinClubText>}
                </JoinClubPressable>
            )
        }

        const MemberCount = ({ club }) => {
            const memberCount = club?.memberCount;
            const membersPlural = memberCount > 1 ? 's' : '';
            const membersText = `${memberCount} member${membersPlural}`;
            return (
                <MemberCountText>{membersText}</MemberCountText>
            );
        }

        const renderClubOption = (club) => {
            const advanceToClubActivityScreen = () => navigation.navigate('ClubActivityScreen', { club })
            return (
                <OptionContainer key={club?.id} onPress={advanceToClubActivityScreen}>
                    <ClubPicture border navigation={navigation} size={64} club={club} />
                    <ClubNameText numberOfLines={1}>{club?.name}</ClubNameText>
                    <MemberCount club={club} />
                    <JoinClubButton club={club} />
                </OptionContainer>
            )
        }

        useEffect(() => {
            loadDiscoverClubs();
        }, [refreshCounter]);

        if (!discoverClubs?.length > 0) return <View />;

        return (
            <DiscoverClubsContainer>
                <SectionHeaderText>{'Most Popular'}</SectionHeaderText>
                <SectionBodyText>{'join the most lively communities on Reelay'}</SectionBodyText>
                <RowContainer horizontal showsHorizontalScrollIndicator={false}>
                    {displayClubs.map(renderClubOption)}
                </RowContainer>
            </DiscoverClubsContainer>
        )
    } catch (error) {
        firebaseCrashlyticsError(error);
    }
}