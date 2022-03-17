import React, { useContext } from 'react';
import ReelaySplash from "../../assets/images/reelay-splash-with-dog.png";
import styled from 'styled-components';
import { Dimensions, View, ImageBackground } from 'react-native';
import * as ReelayText from '../../components/global/Text';
import { AuthContext } from '../../context/AuthContext';
import moment from 'moment';

const { height } = Dimensions.get('window');

const Container = styled(View)`
    width: 100%;
    height: 100%;
`
const ReelayBackground = styled(ImageBackground)`
    width: 100%;
    height: 100%;
`
const Spacer = styled(View)`
`
const SuspensionMessageContainer = styled(View)`
    position: absolute;
    align-items: center;
    justify-content: center;
    padding: 30px;
    height: 50%;
    width: 100%;
    top: ${height / 2}px;
`
const SuspensionMessage = styled(ReelayText.H6Emphasized)`
    color: white;
`

export default AccountSuspendedScreen = () => {
    const { reelayDBUser } = useContext(AuthContext);
    const { banExpiryAt } = reelayDBUser;

    return (
		<Container>
			<ReelayBackground source={ReelaySplash} resizeMode="cover" />
            <Spacer />
            <SuspensionMessageContainer>
                <SuspensionMessage>
                    {`Your account has been suspended. Please reach out to support@reelay.app to inquire or appeal.`}
                </SuspensionMessage>
            </SuspensionMessageContainer>
		</Container>
	);
}