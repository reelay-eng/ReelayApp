import React, { useContext } from 'react';
import styled from 'styled-components';
import * as ReelayText from "../global/Text";
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { AuthContext } from '../../context/AuthContext';


const HomeHeader = ({ text = "reelay", navigation }) => {
    const { myNotifications } = useContext(AuthContext);
    const hasUnreadNotifications = true // myNotifications.filter(({ seen }) => !seen).length > 0;

	const HeaderContainer = styled(View)`
		width: 100%;
		padding: 15px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	`;
	const HeaderText = styled(ReelayText.H4Bold)`
		text-align: left;
		color: white;
		margin-top: 4px;
	`;
    const IconsContainer = styled(View)`
        display: flex;
        flex-direction: row;
    `
    const IconContainer = styled(View)`
        margin-left: 8px;
    `
    const UnreadIconIndicator = styled(View)`
        background-color: ${ReelayColors.reelayBlue}
        border-radius: 5px;
        height: 10px;
        width: 10px;
        position: absolute;
        right: 0px;
    `

	return (
		<>
			<HeaderContainer>
				<HeaderText>{text}</HeaderText>
                <IconsContainer>
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
                </IconsContainer>
			</HeaderContainer>
		</>
	);
};

export default HomeHeader