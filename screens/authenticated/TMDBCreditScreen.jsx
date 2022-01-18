import React from "react";
import { SafeAreaView, View, Image } from "react-native";
import styled from "styled-components";
import * as ReelayText from '../../components/global/Text';

import TMDBCreditImage from '../../assets/images/tmdb-logo.png';
import { HeaderWithBackButton } from "../../components/global/Headers";

export default TMDBCreditScreen = ({ navigation, route }) => {
	const TMDBScreenContainer = styled(SafeAreaView)`
		background-color: black;
		height: 100%;
		width: 100%;
	`;
    const ContentContainer = styled(View)`
        width: 100%;
        height: 90%;
        align-items: center;
        margin-top: 40px;
    `
    const TMDBCreditContainer = styled(View)`
		width: 80%;
		height: 40%;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: center;
	`;
    const TMDBTitle = styled(ReelayText.Body1)`
        color: white;
        width: 80%;
    `
    return (
		<TMDBScreenContainer>
			<HeaderWithBackButton navigation={navigation} text="TMDB Credit" />
			<ContentContainer>
				<TMDBCreditContainer>
                    <TMDBTitle style={{marginBottom: 30}}>
						Reelay's movie and TV data is provided generously by (themoviedb.org).
					</TMDBTitle>
					<TMDBTitle>
						We can't thank them enough.
					</TMDBTitle>
					<Image source={TMDBCreditImage} style={{ width: "80%" }} resizeMode="contain" />
				</TMDBCreditContainer>
			</ContentContainer>
		</TMDBScreenContainer>
	);
};
