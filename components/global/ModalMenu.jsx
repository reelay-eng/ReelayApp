import React, { useContext } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import * as ReelayText from '../global/Text';
import styled from 'styled-components/native';

const Backdrop = styled(Pressable)`
    background-color: transparent;
    height: 100%;
    position: absolute;
    width: 100%;
`
const MenuView = styled(View)`
    background: transparent;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: auto;
    margin-bottom: 40px;
`
const MenuOptionComponent = styled(Pressable)`
    width: 100%;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
	padding: 16px;
`
const MenuOptionsView = styled(View)`
    width: 90%;
    background-color: #2D2D2D;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
`
const MenuOptionText = styled(ReelayText.H6)`
    color: ${ReelayColors.reelayBlue};
	font-size: 16px;
    text-align: center;
`
const ModalView = styled(View)`
    position: absolute;
`
const Spacer = styled(View)`
	height: 10px;
`

export default MenuModal = ({ closeMenu, menuOptions }) => {
	const { reelayDBUser } = useContext(AuthContext);
    const removeMalformedOptions = option => option?.text && option.action;
    const displayMenuOptions = menuOptions.filter(removeMalformedOptions);

    const renderMenuOption = ({ text, action }) => {
        return (
            <MenuOption key={text} onPress={action}>
                <MenuOptionText>{text}</MenuOptionText>
            </MenuOption>
        );
    }

    const MenuOption = ({ onPress, children }) => {
        return (
            <MenuOptionComponent style={({ pressed }) => [
				{ backgroundColor: pressed ? "#292929" : "#2D2D2D" },
            ]} onPress={onPress}>
                {children}
            </MenuOptionComponent>
        )
    }
    
    return (
		<ModalView>
			<Modal animationType="slide" transparent={true} visible={true}>
				<Backdrop onPress={closeMenu} />
				<MenuView>
					<MenuOptionsView>
                        { displayMenuOptions.map(renderMenuOption) }
					</MenuOptionsView>
					<Spacer />
					<MenuOptionsView>
						<MenuOption onPress={closeMenu}>
							<MenuOptionText>Cancel</MenuOptionText>
						</MenuOption>
					</MenuOptionsView>
				</MenuView>
			</Modal>
		</ModalView>
	);
}