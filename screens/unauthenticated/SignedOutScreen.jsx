import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  TouchableOpacity,
  View,
} from "react-native";
import { Auth } from "aws-amplify";
import { Button } from "../../components/global/Buttons";
import ReelayColors from "../../constants/ReelayColors";
import * as ReelayText from "../../components/global/Text";
import { LinearGradient } from "expo-linear-gradient";
import styled from "styled-components/native";

import SocialLoginBar from "../../components/auth/SocialLoginBar";

import ReelayLogoText from "../../assets/images/reelay-logo-text-with-dog.png";
import ReelayLogoTextNew from "../../assets/icons/reelay-new.png"

import { AuthContext } from "../../context/AuthContext";
import { showErrorToast } from "../../components/utils/toasts";
import { useDispatch, useSelector } from "react-redux";
import ModalMenu from "../../components/global/ModalMenu";
import {
  firebaseCrashlyticsError,
  firebaseCrashlyticsLog,
} from "../../components/utils/EventLogger";

const ButtonPressable = styled(TouchableOpacity)`
  align-items: center;
  background-color: ${(props) => props.backgroundColor ?? "black"};
  border-radius: 24px;
  height: 100%;
  justify-content: center;
  width: 100%;
`;
const ButtonContainer = styled(View)`
  align-items: center;
  height: 48px;
  margin-top: 8px;
  margin-bottom: 8px;
  width: 100%;
`;
const ButtonsFlexContainer = styled(View)`
  height: 85%;
  width: 90%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const ButtonGradient = styled(LinearGradient)`
  border-radius: 24px;
  height: 100%;
  position: absolute;
  width: 100%;
`;
const ButtonText = styled(ReelayText.Body2Emphasized)`
  font-family: Outfit-Medium;
  color: ${(props) => props.color ?? ReelayColors.reelayBlue};
  font-size: ${(props) => props.fontSize ?? "14px"};
`;

const ButtonOverlineText = styled(ReelayText.Overline)`
  color: ${(props) => props.color ?? ReelayColors.reelayBlue};
  font-size: 13px;
`;

const LoadingContainer = styled(View)`
  position: absolute;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const Container = styled(View)`
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: black;
`;

const BarHeaderContainer = styled(View)`
  display: flex;
  flex-direction: row;
  width: 90%;
  align-items: center;
  justify-content: space-between;
  opacity: 0.6;
`;

const Bar = styled(View)`
  background-color: white;
  height: 1px;
  width: 30%;
`;

const BarText = styled(ReelayText.Overline)`
  color: white;
`;

const BarHeader = () => {
  return (
    <BarHeaderContainer>
      <Bar />
      <BarText>OR</BarText>
      <Bar />
    </BarHeaderContainer>
  );
};

const Spacer = styled(View)`
  height: ${(props) => props.height ?? "40px"};
`;
const DevSignUpIsVisible = process.env.NODE_ENV !== "production";

const SigningInOuterContainer = styled(View)`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
`;
const SigningInContainer = styled(View)`
  background-color: #0d0d0d;
  border-radius: 20px;
  width: 80%;
  justify-content: center;
  align-items: center;
`;
const SigningInIndicator = () => {
  return (
    <SigningInOuterContainer>
      <SigningInContainer>
        <ButtonText color="white" style={{ fontSize: 20, lineHeight: 24 }}>
          Just a moment
        </ButtonText>
        <Spacer height="15%" />
        <ActivityIndicator color="white" />
      </SigningInContainer>
    </SigningInOuterContainer>
  );
};

export default SignedOutScreen = ({ navigation, route }) => {
  try {
    firebaseCrashlyticsLog("Signed out screen");
    // const autoSignInAsGuest = route?.params?.autoSignInAsGuest ?? false;
    const { setCognitoUser } = useContext(AuthContext);
    const [passwordMenuVisible, setPasswordMenuVisible] = useState(false);
    const [signingInJustShowMe, setSigningInJustShowMe] = useState(false);
    const [signingInSocial, setSigningInSocial] = useState(false);
    const dispatch = useDispatch();

    const LogInButton = () => (
      <ButtonContainer>
        <ButtonPressable
          backgroundColor="transparent"
          activeOpacity={0.7}
          onPress={() => setPasswordMenuVisible(true)}
        >
          <ButtonText fontSize="17px">{"Use a password"}</ButtonText>
        </ButtonPressable>
      </ButtonContainer>
    );

    const JustShowMeButton = () => (
      <ButtonContainer>
        <ButtonPressable onPress={justShowMeLogin} activeOpacity={0.8}>
          <ButtonGradient
            colors={[ReelayColors.reelayBlue, ReelayColors.reelayRed]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <ButtonOverlineText color="white">
            {"Just show me the app"}
          </ButtonOverlineText>
        </ButtonPressable>
      </ButtonContainer>
    );

    const justShowMeLogin = async () => {
      try {
        setSigningInJustShowMe(true);
        const startTime = new Date().getTime();
        let guestCognitoUser;
        let cognitoSession;
        guestCognitoUser = {
          Session: null,
          attributes: {
            email: "support@reelay.app",
            email_verified: false,
            sub: "7dcf0107-ad4f-4e5f-9a54-976dc9285b9c",
          },
          authenticationFlowType: "USER_SRP_AUTH",
          client: {
            endpoint: "https://cognito-idp.us-west-2.amazonaws.com/",
            fetchOptions: {},
          },
          keyPrefix:
            "CognitoIdentityServiceProvider.6rp2id41nvvm1sb8nav9jsrchi",
          pool: {
            advancedSecurityDataCollectionFlag: true,
            client: {
              endpoint: "https://cognito-idp.us-west-2.amazonaws.com/",
              fetchOptions: {},
            },
            clientId: "6rp2id41nvvm1sb8nav9jsrchi",
            //   "storage": [Function MemoryStorage],
            userPoolId: "us-west-2_RMWuJQRNL",
            //   "wrapRefreshSessionCallback": [Function anonymous],
          },
          preferredMFA: "NOMFA",
          signInUserSession: {
            accessToken: {
              jwtToken:
                "eyJraWQiOiI0YnpaNFV4UTgrWW14VnM3N2s4UVhWc0RuZzVSU0hreW95SnRIU1FnSXJrPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3ZGNmMDEwNy1hZDRmLTRlNWYtOWE1NC05NzZkYzkyODViOWMiLCJkZXZpY2Vfa2V5IjoidXMtd2VzdC0yX2VkYzIxMjg3LWE4NWQtNDBiYy05NDRjLTkxNmY3NjZhNmM0YyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3MDEzNDcyNzUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX1JNV3VKUVJOTCIsImV4cCI6MTcwMTM1MDg3NSwiaWF0IjoxNzAxMzQ3Mjc1LCJqdGkiOiI2YzI2YjA5MS02NGMzLTQ4YTgtOThjYi05MzcwN2EzYWNjZjEiLCJjbGllbnRfaWQiOiI2cnAyaWQ0MW52dm0xc2I4bmF2OWpzcmNoaSIsInVzZXJuYW1lIjoiYmVfb3VyX2d1ZXN0In0.2swV5VbwJpbvczrNCO0RI8EE-uPNyf9QDuoVi1k6u_9bKLmjE255bTBoiaZemfhx-V9GsZ5i_sYjjC44gpVaytHDd50rfYvz_rF3BnE4KcRX3SO-xXJ9kcucYgwgm8CFVs4f42uz2gvkZUvqba2jJBKg8KE-aFKKHq7F8iv2nzAlXRti-IPYPljR_pBq90hKfwPGCP8bX7fgYwQcR7E7GoGjm4tgbOC5NXsznGoopNKaBfUf4cNm6sd4Zzs6gRgbKGBhxzxbDuN9zYK_YTlRtiAB2JYTt_vG_C6ibe34xZ1ID6vIxyb4TGa6QxccVFTSP3LMtszxRUHiAE6glDi1Jw",
              payload: {
                auth_time: 1701347275,
                client_id: "6rp2id41nvvm1sb8nav9jsrchi",
                device_key: "us-west-2_edc21287-a85d-40bc-944c-916f766a6c4c",
                exp: 1701350875,
                iat: 1701347275,
                iss: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_RMWuJQRNL",
                jti: "6c26b091-64c3-48a8-98cb-93707a3accf1",
                scope: "aws.cognito.signin.user.admin",
                sub: "7dcf0107-ad4f-4e5f-9a54-976dc9285b9c",
                token_use: "access",
                username: "be_our_guest",
              },
            },
            clockDrift: 0,
            idToken: {
              jwtToken:
                "eyJraWQiOiJkSFJidW43Qm5rbkUxZnh4alpUanJ3aVlYbjhCSERyN21ucHhwWmdIcHE0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3ZGNmMDEwNy1hZDRmLTRlNWYtOWE1NC05NzZkYzkyODViOWMiLCJhdWQiOiI2cnAyaWQ0MW52dm0xc2I4bmF2OWpzcmNoaSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MDEzNDcyNzUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX1JNV3VKUVJOTCIsImNvZ25pdG86dXNlcm5hbWUiOiJiZV9vdXJfZ3Vlc3QiLCJleHAiOjE3MDEzNTA4NzUsImlhdCI6MTcwMTM0NzI3NSwiZW1haWwiOiJzdXBwb3J0QHJlZWxheS5hcHAifQ.JrgzqFIa8KBvYckUbb3f5hEK6XHnZ4CvFCd_oSbTczDNGKxhKrQ-rzJFM-vxWivRj9uOT_Iap-mJP-weDaejiWELEpmjjA3tjtACtcqThSdBt73taBdyjDbzXmWNO2yR3WZDFW6nOwBUXWcwt0DDEGWvOkOFV2Z2HTFG5z_T6V35JQaIqYBBDgVjZZWNkG4OXoN2MmdhyUUmWD-btUFyt5qsN76T9N4iqqRELqCX9aF5hg5bBouoy3Gpuo8FQL8EahFHeItEE24zstJVN8zn1aOlQUuzR7L8W6_XwlYMMPwvKScTMpWr7omnYohmSdX1EvQHZXAF7YqgWGkFs09u4g",
              payload: {
                aud: "6rp2id41nvvm1sb8nav9jsrchi",
                auth_time: 1701347275,
                "cognito:username": "be_our_guest",
                email: "support@reelay.app",
                email_verified: false,
                exp: 1701350875,
                iat: 1701347275,
                iss: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_RMWuJQRNL",
                sub: "7dcf0107-ad4f-4e5f-9a54-976dc9285b9c",
                token_use: "id",
              },
            },
            refreshToken: {
              token:
                "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.KVKWGjPUwoC8OZThC5HIj9zxU3PQwGe8L_bwvnqt2BjBI7KSf9SKq8bMdp1CFoyhByr8pl51VjsZznGGEvc4wvr124-itb7IXn2kro7_w9H_ONTbc_tQGyl2ADWEPM5ANtOppGyZXiSNHNOMkGD2bhphZdyEXjY5mP0jX1IyXe0D_ZxdyxCJjg8qD1ftnmP2MB201p16Gx3Aocju7CneBK5DLzzBge6vbZ4Z9Je_drLmtWLRfX7C0xzHziQsrv7G5X8lrOybOqIrvvwZ4OLDX0fqb4K79YU15Nr4flGvx14qO9J_M0my5Nc2ah6BwEN9xY1ck70rKy1Egt9kCrMvrg.yJoH_oiQNYbHEtza.5xjkytORL7ZaenIyv0tnp2Lm3tTEJLdaqoyt06O2HH_WKH5XPqgdG5AeJMzL72GCf3gUDNYNfs6SGq0g3GV9bgya2MN4W1T2WjKL1D8Xyyr--NUQut10NWXAiAJisYU3WX40dM9qr_Z9tfm1KQjIlv9Wy_vdqMS4I3oydv5KV_OYZUJ0Vx3iliLCjUx9BsBLw6qN-NKjU-8LWothKfnAEpzMhpTvI2PK_E0-ut5-TtiB6oGXgvki_2APqsporzsBKrpiTaegh5FHk2-zIL9t_bHekQfry0GpUNmPt2lBRj4xXrsqmsVhWebeymrNxV9t6pX43INdSf2MoS3mBIOThO1zQ3CtH5-uv8UziJjwIFjE93fy03TVjd5qcwy_6G-RHXTKAaivDoC1K4P3odhrOnREBEGFZztf9J9EP6l9R39etk1BBKQSWpKCrOE-kAQ08na9pSMHDV6DtHntAksqyJeRyR24QY5bKPyAh5nyZft-5uufu7dvjylHqwc5-eM-vZQJgi1XA0Mm_RwfEM-Tc4by5LmSzF6kC80st6u6k9LpHWT5XCss9pR00CEAgPN0uOJutEG_JSx_PfWGhrqO3k5850BkjMNIs_AJqYMyqyAyZxd6pwVuJzWq7_X3ctzUBkXiIuJDEPHeCVRzjLOfm8NUFzMJl7U_cBPk8ceUAb8weojM0s8L-y9iC8bpM0upPrOeNdEY3m57O5HoWGEA-PVN90fqwfeCkuCeUWfP4YU-UVH7-d2wVU6VNvYH5qMMBFLtQ_786aq934WspPUH-2TILAbPPtYwD1okwSVmKc2wwDZXFiBiMyFGEt_yzRkEcPxvzevoL3MgujgJAHJ0P-tuYd9kVHYCXy0av2v2XwvJq3py8oCwJo69Dlpa6_NH8vh0xyMRylRyyxEFvxQ3ePM8z0TvGHELXUksAYkIlecydpSF2FLJwUNU7wwiDElu3K-3a90Q1jMKh86f0rX_UixVYfO33xGEdjBfCpX7brLCRDYkmKSdFSk1Y28tdSy9nW6kLjVaqPZ6EVHZhYfpDkpDip8xPDmqdG-UwrK_8jKjqB74VLLwKIBoCVE0rhVOBcFrIAt1PgUUXdiwnOYWXwhsCwxEcv4UyLfuQTRShhPfM5LArRuh7C6hgy2W6w1aVtF3j95EPy3Q6rZ6nxLXVgmTuQD5GaiV0uF4rjmRXRZ7elMhD9Q0aFtmcpXYbszXcVIveWAScPUnxRH4fevpppW0IRCW86JjgRexIRNa6_-olhuJtteeyPgXFZ4jk4Ztqcs44oRgJ-hQksX_yVtvl8VwqXQMGb5gMZZxB_Cm.4BRvDuX_CW6MI6eYKSTAAw",
            },
          },
          // "storage": [Function MemoryStorage],
          userDataKey:
            "CognitoIdentityServiceProvider.6rp2id41nvvm1sb8nav9jsrchi.be_our_guest.userData",
          username: "be_our_guest",
        };

        cognitoSession = {
          accessToken: {
            jwtToken:
              "eyJraWQiOiI0YnpaNFV4UTgrWW14VnM3N2s4UVhWc0RuZzVSU0hreW95SnRIU1FnSXJrPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3ZGNmMDEwNy1hZDRmLTRlNWYtOWE1NC05NzZkYzkyODViOWMiLCJkZXZpY2Vfa2V5IjoidXMtd2VzdC0yX2VkYzIxMjg3LWE4NWQtNDBiYy05NDRjLTkxNmY3NjZhNmM0YyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3MDEzNDcyNzUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX1JNV3VKUVJOTCIsImV4cCI6MTcwMTM1MDg3NSwiaWF0IjoxNzAxMzQ3Mjc1LCJqdGkiOiI2YzI2YjA5MS02NGMzLTQ4YTgtOThjYi05MzcwN2EzYWNjZjEiLCJjbGllbnRfaWQiOiI2cnAyaWQ0MW52dm0xc2I4bmF2OWpzcmNoaSIsInVzZXJuYW1lIjoiYmVfb3VyX2d1ZXN0In0.2swV5VbwJpbvczrNCO0RI8EE-uPNyf9QDuoVi1k6u_9bKLmjE255bTBoiaZemfhx-V9GsZ5i_sYjjC44gpVaytHDd50rfYvz_rF3BnE4KcRX3SO-xXJ9kcucYgwgm8CFVs4f42uz2gvkZUvqba2jJBKg8KE-aFKKHq7F8iv2nzAlXRti-IPYPljR_pBq90hKfwPGCP8bX7fgYwQcR7E7GoGjm4tgbOC5NXsznGoopNKaBfUf4cNm6sd4Zzs6gRgbKGBhxzxbDuN9zYK_YTlRtiAB2JYTt_vG_C6ibe34xZ1ID6vIxyb4TGa6QxccVFTSP3LMtszxRUHiAE6glDi1Jw",
            payload: {
              auth_time: 1701347275,
              client_id: "6rp2id41nvvm1sb8nav9jsrchi",
              device_key: "us-west-2_edc21287-a85d-40bc-944c-916f766a6c4c",
              exp: 1701350875,
              iat: 1701347275,
              iss: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_RMWuJQRNL",
              jti: "6c26b091-64c3-48a8-98cb-93707a3accf1",
              scope: "aws.cognito.signin.user.admin",
              sub: "7dcf0107-ad4f-4e5f-9a54-976dc9285b9c",
              token_use: "access",
              username: "be_our_guest",
            },
          },
          clockDrift: 0,
          idToken: {
            jwtToken:
              "eyJraWQiOiJkSFJidW43Qm5rbkUxZnh4alpUanJ3aVlYbjhCSERyN21ucHhwWmdIcHE0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3ZGNmMDEwNy1hZDRmLTRlNWYtOWE1NC05NzZkYzkyODViOWMiLCJhdWQiOiI2cnAyaWQ0MW52dm0xc2I4bmF2OWpzcmNoaSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MDEzNDcyNzUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yX1JNV3VKUVJOTCIsImNvZ25pdG86dXNlcm5hbWUiOiJiZV9vdXJfZ3Vlc3QiLCJleHAiOjE3MDEzNTA4NzUsImlhdCI6MTcwMTM0NzI3NSwiZW1haWwiOiJzdXBwb3J0QHJlZWxheS5hcHAifQ.JrgzqFIa8KBvYckUbb3f5hEK6XHnZ4CvFCd_oSbTczDNGKxhKrQ-rzJFM-vxWivRj9uOT_Iap-mJP-weDaejiWELEpmjjA3tjtACtcqThSdBt73taBdyjDbzXmWNO2yR3WZDFW6nOwBUXWcwt0DDEGWvOkOFV2Z2HTFG5z_T6V35JQaIqYBBDgVjZZWNkG4OXoN2MmdhyUUmWD-btUFyt5qsN76T9N4iqqRELqCX9aF5hg5bBouoy3Gpuo8FQL8EahFHeItEE24zstJVN8zn1aOlQUuzR7L8W6_XwlYMMPwvKScTMpWr7omnYohmSdX1EvQHZXAF7YqgWGkFs09u4g",
            payload: {
              aud: "6rp2id41nvvm1sb8nav9jsrchi",
              auth_time: 1701347275,
              "cognito:username": "be_our_guest",
              email: "support@reelay.app",
              email_verified: false,
              exp: 1701350875,
              iat: 1701347275,
              iss: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_RMWuJQRNL",
              sub: "7dcf0107-ad4f-4e5f-9a54-976dc9285b9c",
              token_use: "id",
            },
          },
          refreshToken: {
            token:
              "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.KVKWGjPUwoC8OZThC5HIj9zxU3PQwGe8L_bwvnqt2BjBI7KSf9SKq8bMdp1CFoyhByr8pl51VjsZznGGEvc4wvr124-itb7IXn2kro7_w9H_ONTbc_tQGyl2ADWEPM5ANtOppGyZXiSNHNOMkGD2bhphZdyEXjY5mP0jX1IyXe0D_ZxdyxCJjg8qD1ftnmP2MB201p16Gx3Aocju7CneBK5DLzzBge6vbZ4Z9Je_drLmtWLRfX7C0xzHziQsrv7G5X8lrOybOqIrvvwZ4OLDX0fqb4K79YU15Nr4flGvx14qO9J_M0my5Nc2ah6BwEN9xY1ck70rKy1Egt9kCrMvrg.yJoH_oiQNYbHEtza.5xjkytORL7ZaenIyv0tnp2Lm3tTEJLdaqoyt06O2HH_WKH5XPqgdG5AeJMzL72GCf3gUDNYNfs6SGq0g3GV9bgya2MN4W1T2WjKL1D8Xyyr--NUQut10NWXAiAJisYU3WX40dM9qr_Z9tfm1KQjIlv9Wy_vdqMS4I3oydv5KV_OYZUJ0Vx3iliLCjUx9BsBLw6qN-NKjU-8LWothKfnAEpzMhpTvI2PK_E0-ut5-TtiB6oGXgvki_2APqsporzsBKrpiTaegh5FHk2-zIL9t_bHekQfry0GpUNmPt2lBRj4xXrsqmsVhWebeymrNxV9t6pX43INdSf2MoS3mBIOThO1zQ3CtH5-uv8UziJjwIFjE93fy03TVjd5qcwy_6G-RHXTKAaivDoC1K4P3odhrOnREBEGFZztf9J9EP6l9R39etk1BBKQSWpKCrOE-kAQ08na9pSMHDV6DtHntAksqyJeRyR24QY5bKPyAh5nyZft-5uufu7dvjylHqwc5-eM-vZQJgi1XA0Mm_RwfEM-Tc4by5LmSzF6kC80st6u6k9LpHWT5XCss9pR00CEAgPN0uOJutEG_JSx_PfWGhrqO3k5850BkjMNIs_AJqYMyqyAyZxd6pwVuJzWq7_X3ctzUBkXiIuJDEPHeCVRzjLOfm8NUFzMJl7U_cBPk8ceUAb8weojM0s8L-y9iC8bpM0upPrOeNdEY3m57O5HoWGEA-PVN90fqwfeCkuCeUWfP4YU-UVH7-d2wVU6VNvYH5qMMBFLtQ_786aq934WspPUH-2TILAbPPtYwD1okwSVmKc2wwDZXFiBiMyFGEt_yzRkEcPxvzevoL3MgujgJAHJ0P-tuYd9kVHYCXy0av2v2XwvJq3py8oCwJo69Dlpa6_NH8vh0xyMRylRyyxEFvxQ3ePM8z0TvGHELXUksAYkIlecydpSF2FLJwUNU7wwiDElu3K-3a90Q1jMKh86f0rX_UixVYfO33xGEdjBfCpX7brLCRDYkmKSdFSk1Y28tdSy9nW6kLjVaqPZ6EVHZhYfpDkpDip8xPDmqdG-UwrK_8jKjqB74VLLwKIBoCVE0rhVOBcFrIAt1PgUUXdiwnOYWXwhsCwxEcv4UyLfuQTRShhPfM5LArRuh7C6hgy2W6w1aVtF3j95EPy3Q6rZ6nxLXVgmTuQD5GaiV0uF4rjmRXRZ7elMhD9Q0aFtmcpXYbszXcVIveWAScPUnxRH4fevpppW0IRCW86JjgRexIRNa6_-olhuJtteeyPgXFZ4jk4Ztqcs44oRgJ-hQksX_yVtvl8VwqXQMGb5gMZZxB_Cm.4BRvDuX_CW6MI6eYKSTAAw",
          },
        };
        setTimeout(async () => {
          guestCognitoUser = await Auth.signIn("be_our_guest", "candelabra");
          cognitoSession = await Auth.currentSession();
          if (guestCognitoUser && cognitoSession) {
            const endTime = new Date().getTime();
            const elapsedTimeInMilliseconds = endTime - startTime;
            const elapsedTimeInSeconds = elapsedTimeInMilliseconds / 1000;
            console.log(
              `-------- guestCognitoUser & cognitoSession ------- ${elapsedTimeInSeconds} seconds.`
            );
          }
          // console.log("------ guestCognitoUser 123------", guestCognitoUser);
          // console.log("------ cognitoSession 123-------", cognitoSession);
        }, 8000);
        setCognitoUser(guestCognitoUser);
        dispatch({
          type: "setAuthSessionFromCognito",
          payload: cognitoSession,
        });
      } catch (error) {
        console.log("error", error);
        showErrorToast(
          "Oh no! We couldn't guest you in. Try again or contact support@reelay.app"
        );
        setSigningInJustShowMe(false);
      }
    };

    const closePasswordMenu = () => setPasswordMenuVisible(false);
    const signUpWithPassword = () => {
      closePasswordMenu();
      navigation.push("SignUpScreen");
    };
    const signInWithPassword = () => {
      closePasswordMenu();
      navigation.push("SignInScreen");
    };

    return (
      <Container>
        {signingInJustShowMe && (
          <LoadingContainer>
            <ActivityIndicator color={"white"} />
          </LoadingContainer>
        )}
        {!signingInJustShowMe && (
          <>
            <ButtonsFlexContainer>
              <Image
                source={ReelayLogoTextNew}
                style={{ height: "25%" }}
                resizeMode="contain"
              />
              <Spacer height="10%" />
              <SocialLoginBar
                navigation={navigation}
                setSigningIn={setSigningInSocial}
              />
              <Spacer height="20px" />
              <BarHeader />
              <Spacer height="20px" />
              <JustShowMeButton />
            </ButtonsFlexContainer>
            {!passwordMenuVisible && <LogInButton />}
            {passwordMenuVisible && (
              <ModalMenu
                closeMenu={closePasswordMenu}
                menuOptions={[
                  { text: "Sign up with password", action: signUpWithPassword },
                  {
                    text: "I already have a password",
                    action: signInWithPassword,
                  },
                ]}
              />
            )}
          </>
        )}
        {(signingInSocial || signingInJustShowMe) && <SigningInIndicator />}
      </Container>
    );
  } catch (error) {
    firebaseCrashlyticsError(error);
  }
};
