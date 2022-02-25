import React from "react";
import { BaseToast, ErrorToast, InfoToast } from "react-native-toast-message";

export const toastConfig = {
    success: (props) => (
        <BaseToast
        {...props}
        style={{ borderLeftColor: "pink" }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
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
            <Pressable
            style={{
                alignItems: "center",
                justifyContent: "center",
                padding: 10,
            }}
            >
            <Icon type="ionicon" name="warning" size={25} color={"white"} />
            </Pressable>
        )}
        style={{
            backgroundColor: "#fe4747",
            borderLeftColor: "transparent",
            borderRadius: 10,
            width: 351,
        }}
        text1NumberOfLines={2}
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
        // FOR LATER (so you can press x to close a toast):
        // renderTrailingIcon={() => (
        //     <View style={{justifyContent: 'center', alignItems: 'center', padding: 10}} onPress={() => this.hide()}>
        //         <Icon type="ionicon" name="close" size={25} color={"black"} />
        //     </View>
        // )}
        style={{ borderLeftColor: "transparent", borderRadius: 10, width: 351 }}
        text1NumberOfLines={1}
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
