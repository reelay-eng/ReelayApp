import { faShare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import ShareReelayDrawer from './ShareReelayDrawer';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

const SidebarButton = styled(TouchableOpacity)`
align-items: center;
background-color: ${props => props.addHighlight 
    ? 'rgba(41, 119, 239, 0.25)' 
    : 'transparent'
}
border-radius: 50px;
height: 44px;
justify-content: center;
width: 44px;
shadow-offset: 2px 2px;
shadow-color: black;
shadow-opacity: 0.5;
`
const ButtonContainer = styled(View)`
	align-items: center;
	margin-right: 10px;
	margin: 4px;
    flex-direction:row;
`
const ShareText = styled(ReelayText.H6Emphasized)`
	text-align: center;
    font-weight:bold;
    color:white;
    align-self:center;
`
const SidebarView = styled(TouchableOpacity)`
	align-items: center;
	align-self: flex-end;
	position: absolute;
	bottom: 155px;
    right:10px;
    left:10px;
    border-width:1px;
    border-color:white;
    border-radius:5px;
`
export default ShareOutButton = ({ navigation, reelay,firstReelAfterSignup=false }) => {
    const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
    const closeDrawer = () => setShareDrawerOpen(false);
    // you should already have this reelay in the Seen section of your watchlist,
    // since you made a reelay about it

    
    return ( 
    <>
        <TouchableOpacity onPress={() => setShareDrawerOpen(true)}>
        {!firstReelAfterSignup ?
            <FontAwesomeIcon icon={faShare} color='white' size={27} />:
            <SidebarView onPress={() => setShareDrawerOpen(true)}>
            <ButtonContainer>
                <ShareText>SHARE MY REELAY</ShareText>
                <SidebarButton>
                    <FontAwesomeIcon icon={faShare} color='white' size={27} />
                </SidebarButton>
            </ButtonContainer>
        </SidebarView>}
            { shareDrawerOpen && (
                <ShareReelayDrawer closeDrawer={closeDrawer} navigation={navigation} reelay={reelay} />
            )}
        </TouchableOpacity>
        
    
    </>
   
    );
}
