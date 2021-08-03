import { Text, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import styled from 'styled-components/native';

export const AuthButton = styled(Button)`
align-self: center;
margin-top: 10px;
width: 75%;
`
export const AuthInput = styled(Input)`
    flex: 1; 
    color: white;
    font-family: System;
` 
export const SystemText = styled(Text)`
    color: white;
    font-family: System;
    font-size: 16px;
    margin: 10px;
`
export const AuthHeaderCenter = styled(Text)`
    align-self: center;
    color: white;
    flex: 0.4;
    font-family: System;
    margin-top: 20px;
    font-size: 28px;
`
export const AuthHeaderLeft = styled(Text)`
    align-self: flex-start;
    color: white;
    flex: 1;
    font-family: System;
    font-size: 24px;
    margin: 10px;
`

export const AuthHeaderView = styled(View)`
    align-items: flex-start;
    flex: 0.4; 
    flex-direction: row;
    justify-content: center;
    margin-top: 20px;
`
