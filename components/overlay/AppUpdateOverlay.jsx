import React from 'react';
import { View, SafeAreaView, Pressable, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import styled from "styled-components";
import { ActionButton, BWButton } from '../../components/global/Buttons';
import ReelayLogoText from "../../assets/images/reelay-logo-text-with-dog.png";
import * as ReelayText from "../../components/global/Text";
import * as Linking from "expo-linking";
import { animateCustom } from '../../hooks/animations';


const Container = styled(View)`
    width: 100%;
    height: 100%;
    position: absolute;
    justify-content: center;
    align-items: center;
`

const Backdrop = styled(View)`
    align-items: center;
    background-color: black;
    height: 100%;
    justify-content: center;
    opacity: 0.6;
    position: absolute;
    width: 100%;
`


const AppUpdateContainer = styled(SafeAreaView)`
    width: 100%;
    height: 100%;
    background-color: #0D0D0D;
    border-radius: 20px;
    position: absolute;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`

const ReelayLogo = styled(Image)`
    height: 200px;
    margin-bottom: 40px;
`

const Description = styled(ReelayText.H6)`
    color: white;
    text-align: center;
    margin-bottom: 50px;
`
const SubDescription = styled(ReelayText.H6)`
    color: white;
    opacity: 0.6;
    text-align: center;
`

const ButtonsContainer = styled(View)`
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding-bottom: 10px;
`

const ButtonContainer = styled(View)`
    height: 60px;
    flex: 1;
    margin-left: 10px;
    margin-right: 10px;
`

export default AppUpdateOverlay = () => {
    const dispatch = useDispatch();
    const appUpdateRequired = useSelector(state => state.appUpdateRequired);
    const appUpdateVersion = useSelector(state => state.recommendedAppVersion);
    const ignoreAppUpdate = () => {
        animateCustom({
            delete: {
                duration: 300,
                type: 'easeOut',
                property: 'opacity',
            }
        });
        dispatch({type: 'setAppUpdateIgnored', payload: true});
    }
    const IgnoreButton = () => {
        return (
            <ButtonContainer>
                <BWButton text="Skip" onPress={ignoreAppUpdate} />
            </ButtonContainer>
        )
    }
    const UpdateButton = () => {
        return (
            <ButtonContainer>
                <ActionButton text="Update" onPress={() => Linking.openURL('https://apps.apple.com/us/app/reelay-the-streaming-guide/id1578117492')} />
            </ButtonContainer>
        )
    }
    const descriptionText = 
        appUpdateRequired ? "A required update is available." 
        : "A new version of reelay is available. ";
    return (
        <Container>
            <Backdrop/>
            <AppUpdateContainer>
                <ReelayLogo source={ReelayLogoText} resizeMode="contain"/>
                <Description>
                    {descriptionText}{"\n"}
                    <SubDescription>
                        Version {appUpdateVersion} has been released.
                    </SubDescription>
                </Description>
                <ButtonsContainer>
                    { !appUpdateRequired && <IgnoreButton />}
                    <UpdateButton />
                </ButtonsContainer>
            </AppUpdateContainer>
        </Container>
    )
}