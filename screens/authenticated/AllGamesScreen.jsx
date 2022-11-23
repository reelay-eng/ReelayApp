import React, { useContext, useState } from 'react';
import { Dimensions, FlatList, View, Text, Pressable, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import moment from 'moment';
import { HeaderWithBackButton } from '../../components/global/Headers';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ReelayText from '../../components/global/Text';
import GuessingGamePreview from '../../components/home/GuessingGamePreview';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { getGuessingGamesPublished } from '../../api/GuessingGameApi';

const { height, width } = Dimensions.get('window');

const AdminControlsButtonPressable = styled(TouchableOpacity)`
    padding: 6px;
    position: absolute;
    top: ${props => props.topOffset}px;
    right: 16px;
`
const ScreenView = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    padding-top: ${props => props.topOffset}px;
    width: 100%;
`

export default AllGamesScreen = ({ navigation, route }) => {
    const authSession = useSelector(state => state.authSession);
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();
    const displayGames = useSelector(state => state?.homeGuessingGames?.content ?? []);
    const nextPage = useSelector(state => state?.homeGuessingGames?.nextPage ?? 1);
    const topOffset = useSafeAreaInsets().top;

    const [endReached, setEndReached] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const canShowAdminControls = (reelayDBUser?.role === 'admin');

    const extendGuessingGames = async () => {
        if (endReached) return;
        const nextGuessingGames = await getGuessingGamesPublished({
            authSession,
            reqUserSub: reelayDBUser?.sub,
            page: nextPage,
        });

        if (!nextGuessingGames || nextGuessingGames?.length === 0) {
            setEndReached(true);
            return;
        }

        const allGuessingGames = [...displayGames, ...nextGuessingGames];
        dispatch({ type: 'setHomeGuessingGames', payload: {
            content: allGuessingGames,
            nextPage: nextPage + 1,
        }});
    }

    const ShowAdminControlsButton = () => {
        return (
            <AdminControlsButtonPressable topOffset={topOffset} onPress={() => setShowAdmin(!showAdmin)}>
                <FontAwesomeIcon icon={faEye} color='white' size={24} />
            </AdminControlsButtonPressable>
        );
    }

    return (
        <ScreenView topOffset={topOffset}>
            <HeaderWithBackButton navigation={navigation} text={'all games'} />
            { canShowAdminControls && <ShowAdminControlsButton /> }
            <FlatList
                contentContainerStyle={{ paddingBottom: 180 }}
                data={displayGames}
                numColumns={3}
                renderItem={({ item, index }) => <GuessingGamePreview 
                    game={item} 
                    index={index} 
                    navigation={navigation} 
                    showAdmin={showAdmin} 
                    showGuessMarkers={true}
                /> }
                showsVerticalScrollIndicator={false}
                onEndReached={extendGuessingGames}
                onEndReachedThreshold={0.9}
            />
        </ScreenView>
    )
}