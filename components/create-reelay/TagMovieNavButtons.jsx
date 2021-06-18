import React from 'react';
import { Button } from 'react-native-elements';
import { color } from 'react-native-elements/dist/helpers';
import styled from 'styled-components/native';

import { useDispatch, useSelector } from 'react-redux';

const NavButtonContainer = styled.View`
    margin: 10px 10px 10px 10px;
`

export const TagMovieDoneButton = () => {
    const selectedTitle = useSelector((state) => state.createReelay.titleObject);
    const disabled = !selectedTitle;

    const doneTagging = () => {
        // todo
    }
    return (
        <NavButtonContainer>
            <Button type='clear' title='Done' onPress={doneTagging} disabled={disabled} />
        </NavButtonContainer>
    );
}

export const TagMovieBackButton = () => {
    const back = () => { 
        // todo
    }
    return (
        <NavButtonContainer>
            <Button type='clear' title='Back' onPress={back} buttonStyle={{textColor: 'red'}} />
        </NavButtonContainer>
    );
}