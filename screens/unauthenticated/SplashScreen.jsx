import React from 'react';
import ReelaySplash from "../../assets/images/reelay-splash.png";
import styled from 'styled-components';
import { View, ImageBackground } from 'react-native';


const Container = styled(View)`
    width: 100%;
    height: 100%;
`

const ReelayBackground = styled(ImageBackground)`
    width: 100%;
    height: 100%;
`


export default SplashScreen = ({ navigation }) => {
    return (
		<Container>
			<ReelayBackground source={ReelaySplash} resizeMode="cover" />
		</Container>
	);
}