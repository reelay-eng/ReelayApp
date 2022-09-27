import React from 'react';
import { View } from 'react-native';
import * as ReelayText from './Text';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native-gesture-handler';

const HeaderText = styled(ReelayText.H4Bold)`
    color: white;
    line-height: 40px;
    margin-bottom: 20px;
`
const RuleText = styled(ReelayText.Body2)`
    color: white;
    font-size: 16px;
    line-height: 26px;
`
const RuleView = styled(View)`
    margin-bottom: 20px;
`

const ruleTextParts = [
    'Welcome to the Reelay family!',
    'We’re a tight community with an open door.',
    'You may notice Reelay feels different. It’s intimate, unrehearsed and personal (usually about how something made us feel). 🤪🥺🥰🥱',
    'The opinions expressed are not written in stone, so please don’t treat them as if they are. Feelings change.',
    'Some of us are brave enough to film ourselves when a movie makes us cry 🤧 Some of us like to get real sassy 🔥💅🤷 We respect it as long as you don’t disrespect others in the circle.',
    'Also—no spoilers! 🚨 Or warn us at the beginning of your videos.We hope you have a blast! 😎',
];    

export default HouseRules = () => {

    const renderRule = (rule) => {
        return (
            <RuleView key={rule}>
                <RuleText>{rule}</RuleText>
            </RuleView>
        );
    }

    return (
        <View>
            <HeaderText>{'House rules 🧐'}</HeaderText>
            <ScrollView>
                { ruleTextParts.map(renderRule)}
            </ScrollView>
        </View>
    );
}