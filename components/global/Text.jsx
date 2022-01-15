import React, { useState } from "react";
import { Pressable, View, Text, Image } from "react-native";
import styled from "styled-components/native";

const fontWeights = {
	100: "Thin",
	200: "ExtraLight",
	300: "Light",
	400: "Regular",
	500: "Medium",
	600: "SemiBold",
	700: "Bold",
	800: "ExtraBold",
	900: "Black",
};

const getFontFamily = (fontWeight) => {
    if (Object.keys(fontWeights).includes(`${fontWeight}`)) return "Outfit-" + fontWeights[fontWeight];
    else return "ERR: INVALID FONT WEIGHT";
}


//Header Fields

export const H1 = styled(Text)`
	font-family: ${getFontFamily(300)};
	font-size: 96px;
	font-style: normal;
	line-height: 112px;
	letter-spacing: -1.5px;
	text-align: left;
`;

export const H2 = styled(Text)`
	font-family: ${getFontFamily(300)};
	font-size: 60px;
	font-style: normal;
	line-height: 72px;
	letter-spacing: -0.5px;
	text-align: left;
`;

export const H3 = styled(Text)`
	font-family: ${getFontFamily(400)};
	font-size: 48px;
	font-style: normal;
	line-height: 56px;
	letter-spacing: 0px;
	text-align: left;
`;

export const H4 = styled(Text)`
	font-family: ${getFontFamily(400)};
	font-size: 34px;
	font-style: normal;
	line-height: 36px;
	letter-spacing: 0px;
	text-align: left;
`;
export const H4Bold = styled(Text)`
	font-family: ${getFontFamily(600)};
	font-size: 34px;
	font-style: normal;
	line-height: 36px;
	letter-spacing: 0px;
	text-align: left;
`;

export const H5 = styled(Text)`
	font-family: ${getFontFamily(400)};
	font-style: normal;
	font-weight: normal;
	font-size: 24px;
	line-height: 24px;
	letter-spacing: 0.18px;
`;
export const H5Bold = styled(Text)`
	font-family: ${getFontFamily(700)};
	font-size: 24px;
	font-style: normal;
	line-height: 24px;
	letter-spacing: 0.18px;
	text-align: left;
`;
export const H5Emphasized = styled(Text)`
	font-family: ${getFontFamily(500)};
	font-size: 24px;
	font-style: normal;
	line-height: 24px;
	letter-spacing: 0.18px;
	text-align: left;
`;
export const H6 = styled(Text)`
	font-family: ${getFontFamily(400)};
	font-size: 20px;
	font-style: normal;
	line-height: 24px;
	letter-spacing: 0.15px;
	text-align: left;
`;
export const H6Emphasized = styled(Text)`
	font-family: ${getFontFamily(500)};
	font-size: 20px;
	font-style: normal;
	line-height: 24px;
	letter-spacing: 0.15px;
	text-align: left;
`;

// Subtitle Fields
export const Subtitle1 = styled(Text)`
	font-family: ${getFontFamily(400)};
	font-size: 16px;
	font-style: normal;
	line-height: 24px;
	letter-spacing: 0.15px;
	text-align: left;
`;
export const Subtitle1Emphasized = styled(Text)`
	font-family: ${getFontFamily(500)};
	font-size: 16px;
	font-style: normal;
	line-height: 24px;
	letter-spacing: 0.15px;
	text-align: left;
`;
export const Subtitle2 = styled(Text)`
	font-family: ${getFontFamily(500)};
	font-size: 14px;
	font-style: normal;
	line-height: 24px;
	letter-spacing: 0.1px;
	text-align: left;
`;

// Body Fields
export const Body1 = styled(Text)`
	font-family: ${getFontFamily(400)};
	font-size: 16px;
	font-style: normal;
	line-height: 22px;
	letter-spacing: 0.5px;
	text-align: left;
`;
const Body2Style = `
	font-family: ${getFontFamily(400)};
	font-size: 14px;
	font-style: normal;
	line-height: 20px;
	letter-spacing: 0.25px;
	text-align: left;
`;
export const Body2 = styled(Text)`
	${Body2Style}
`;
export const Body2Emphasized = styled(Body2)`
	${Body2Style}
	font-family: ${getFontFamily(500)};
`;
export const Body2Bold = styled(Body2)`
	${Body2Style}
	font-family: ${getFontFamily(600)};
`;

export const Button = styled(Text)`
	font-family: ${getFontFamily(500)};
	font-size: 14px;
	font-style: normal;
	line-height: 16px;
	letter-spacing: 1.25px;
	text-align: left;
	text-transform: uppercase;
`;

// Caption Fields
export const Caption = styled(Text)`
	font-family: ${getFontFamily(400)};
	font-size: 14px;
	font-style: normal;
	line-height: 16px;
	letter-spacing: 0.4px;
	text-align: left;
`;
export const CaptionEmphasized = styled(Text)`
	font-family: ${getFontFamily(500)};
	font-size: 14px;
	font-style: normal;
	line-height: 16px;
	letter-spacing: 0.4px;
	text-align: left;
`;

export const Overline = styled(Text)`
	font-family: ${getFontFamily(400)};
	font-size: 10px;
	font-style: normal;
	line-height: 16px;
	letter-spacing: 1.5px;
	text-align: left;
	text-transform: uppercase;
`;
