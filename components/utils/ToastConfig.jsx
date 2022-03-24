import React from "react";
import { Pressable, Text } from "react-native";
import { Icon } from "react-native-elements";
import Toast, { BaseToast, ErrorToast, InfoToast } from "react-native-toast-message";
import styled from 'styled-components/native';

const DoneText = styled(Text)`
    color: #2977ef;
    font-family: Outfit-Medium;
    font-size: 15;
    font-style: normal;
    line-height: 20;
    letter-spacing: 0.5px; 
    text-align: left
`;

const TrailingIconContainer = styled(Pressable)`
    align-items: center;
    justify-content: center; 
    padding: 20px;
`

const LeadingIconContainer = styled(Pressable)`
    align-items: center;
    justify-content: center;
    padding: 10px;
`

export const toastConfig = {
    success: (props) => (
        <BaseToast
        {...props}
        style={{ borderLeftColor: "pink" }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1NumberOfLines={3}
        text1Style={{
            fontSize: 15,
            fontWeight: "400",
        }}
        />
    ),
    error: (props) => (
        <ErrorToast
        {...props}
        contentContainerStyle={{ paddingHorizontal: 5 }}
        renderLeadingIcon={() => (
            <LeadingIconContainer>
                <Icon type="ionicon" name="warning" size={25} color={"white"} />
            </LeadingIconContainer>
        )}
        style={{
            backgroundColor: "#fe4747",
            borderLeftColor: "transparent",
            borderRadius: 10,
            width: 351,
        }}
        text1NumberOfLines={3}
        text1Style={{
            color: "white",
            fontFamily: "Outfit-Medium",
            fontSize: 15,
            fontStyle: "normal",
            lineHeight: 20,
            letterSpacing: 0.5,
            textAlign: "left",
        }}
        text2Style={{
            fontSize: 12,
        }}
        />
    ),
    info: (props) => (
        <InfoToast
            {...props}
            renderTrailingIcon={() => (
                <TrailingIconContainer onPress={() => {Toast.hide()}}>
                    <DoneText>
                        {"Done"}
                    </DoneText>
                </TrailingIconContainer>
            )}
            style={{ borderLeftColor: "transparent", borderRadius: 10, width: 351 }}
            text1NumberOfLines={3}
            text1Style={{
                fontFamily: "Outfit-Medium",
                fontSize: 15,
                fontStyle: "normal",
                lineHeight: 20,
                letterSpacing: 0.5,
                textAlign: "left",
            }}
            text2Style={{
                fontSize: 12,
            }}
        />
    ),
};
