import React, { useContext, useEffect } from "react";
import { SafeAreaView } from "react-native";
import { FeedContext } from "../../context/FeedContext";
import styled from "styled-components/native";
import { Header } from '../../components/global/HeaderWithBackButton';

export default EditProfileScreen = ({ navigation, route }) => {
    const { setTabBarVisible } = useContext(FeedContext);
    useEffect(() => {
        console.log('this should do something...');
        setTabBarVisible(false);
        return setTabBarVisible(true);
    }, []);
    const EditProfileScreenContainer = styled(SafeAreaView)`
		background-color: black;
		height: 100%;
		width: 100%;
	`;
    return (
		<EditProfileScreenContainer>
			<Header text="Edit Profile" navigation={navigation} />
		</EditProfileScreenContainer>
	);
}