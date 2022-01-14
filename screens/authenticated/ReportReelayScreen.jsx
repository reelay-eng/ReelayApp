import React from 'react';
import { SafeAreaView, Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import * as ReelayText from '../../components/global/Text';
import styled from 'styled-components';

import { HeaderWithBackButton } from "../global/Headers";

const ReportingOption = ({ text, onPress }) => {
    const Container = styled(Pressable)`
        width: 100%;
        height: 60px;
        display: flex;
        flex-direction: row;
        justify-content: center;
    `
    const ReportingOptionWrapper = styled(View)`
        display: flex;
        width: 90%;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    `;
    const ReportingOptionTextContainer = styled(View)`
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    `;
    const ReportingOptionText = styled(ReelayText.Body1)`
        color: #FFFFFF;
        margin-left: 12px;
        margin-top: 3px;
    `;
    return (
		<Container onPress={onPress}>
			<ReportingOptionWrapper>
				<ReportingOptionTextContainer>
					<ReportingOptionText>{text}</ReportingOptionText>
				</ReportingOptionTextContainer>
				<Icon type="ionicon" name="chevron-forward-outline" color={"#FFFFFF"} size={24} />
			</ReportingOptionWrapper>
		</Container>
	);
}

export default ReportReelayScreen = ({navigation, route}) => {
    const ReportReelayScreenContainer = styled(SafeAreaView)`
        background-color: black;
        height: 100%;
        width: 100%;
    `
    return (
        <ReportReelayScreenContainer>
            {/* <ProfileSettings navigation={navigation}/> */}
        </ReportReelayScreenContainer>
    );
}