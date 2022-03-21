import React, { useContext } from 'react';
import styled from 'styled-components';
import * as ReelayText from "../global/Text";
import { Image, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';

import ReelayColors from '../../constants/ReelayColors';
import Constants from 'expo-constants';
import { getReelay, prepareReelay } from '../../api/ReelayDBApi';

const IconContainer = styled(View)`
    margin-left: 8px;
`

const HomeHeader = ({ navigation }) => {
    const { reelayDBUser, myFollowing, myNotifications } = useContext(AuthContext);
    const hasUnreadNotifications = myNotifications.filter(({ seen }) => !seen).length > 0;

	const HeaderContainer = styled(View)`
		width: 100%;
		padding: 15px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	`;
    const HeaderContainerLeft = styled(View)`
        align-items: center;
        flex-direction: row;
    `;
    const HeaderContainerRight = styled(View)`
        display: flex;
        flex-direction: row;
    `
	const HeaderText = styled(ReelayText.H4Bold)`
		text-align: left;
		color: white;
		margin-top: 4px;
	`;
    const UnreadIconIndicator = styled(View)`
        background-color: ${ReelayColors.reelayBlue}
        border-radius: 5px;
        height: 10px;
        width: 10px;
        position: absolute;
        right: 0px;
    `

	return (
		<React.Fragment>
			<HeaderContainer>
                <HeaderContainerLeft>
                    <HeaderText>{'reelay'}</HeaderText>
                    { myFollowing.length > 0 && <WatchTutorialButton navigation={navigation} /> }
                </HeaderContainerLeft>
                <HeaderContainerRight>
                    <IconContainer>
                        <Icon type='ionicon' size={27} color={'white'} name='search' onPress={() => {
                            navigation.push('SearchScreen');
                        }} />
                    </IconContainer>
                    <IconContainer>
                        <Icon type='ionicon' size={27} color={'white'} name='notifications' onPress={() => {
                            navigation.push('NotificationScreen');
                        }} />
                        { hasUnreadNotifications && <UnreadIconIndicator /> }
                    </IconContainer>
                </HeaderContainerRight>
			</HeaderContainer>
		</React.Fragment>
	);
};

const WatchTutorialButton = ({ navigation }) => {
    const TutorialButtonContainer = styled(Pressable)`
        align-items: center;
        background-color: white;
        border-radius: 6px;
        flex-direction: row;
        margin-left: 12px;
        padding-top: 4px;
        padding-bottom: 4px;
    `
    const TutorialButtonText = styled(ReelayText.CaptionEmphasized)`
        margin-left: 6px;
    `
    const loadWelcomeVideoScreen = async () => {
        const welcomeReelaySub = Constants.manifest.extra.welcomeReelaySub;
        const welcomeReelay = await getReelay(welcomeReelaySub, 'dev');
        const preparedReelay = await prepareReelay(welcomeReelay);
        navigation.push('SingleReelayScreen', { preparedReelay });
    }
    return (
        <TutorialButtonContainer onPress={loadWelcomeVideoScreen}>
            <TutorialButtonText>{'Welcome'}</TutorialButtonText>
            <IconContainer>
                <Icon type='ionicon' size={24} color={'black'} name='play-circle' />
            </IconContainer>
        </TutorialButtonContainer>
    );
}

export default HomeHeader;