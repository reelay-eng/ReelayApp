import React from 'react';
import { Dimensions, SafeAreaView, View } from 'react-native';
import { Input, Icon } from 'react-native-elements';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

const SearchFieldContainer = styled(View)`
	width: 100%;
`

export default SearchField = ({ 
	backgroundColor = '#121212',
	border = true,
    searchText, 
    updateSearchText, 
    placeholderText = 'Search',
    clearIcon = true,
}) => {

	const SearchInputFieldStyle = {
		color: "white",
		fontFamily: "Outfit-Regular",
		fontSize: 16,
		fontStyle: "normal",
		lineHeight: 20,
		letterSpacing: 0.15,
		paddingLeft: 4,
		paddingRight: 4,
		textAlign: "left",
		width: '100%',

	}
	const SearchInputContainerStyle = {
		borderColor: border ?  'rgba(255,255,255,0.3)' : backgroundColor,
		borderWidth: border ? 1.4 : 0,
		marginTop: 10,
		marginBottom: -10,
		paddingLeft: 16,
		paddingTop: clearIcon ? 2 : 6,
		paddingBottom: clearIcon ? 2 : 6,
		paddingRight: 4,
		backgroundColor,
		borderRadius: 6,
		justifyContent: 'center',
		width: '100%',
	}	

	const getRightIcon = () => {
		return (
			<Icon
				type="ionicon"
				name="close-circle-outline"
				size={24}
				color="#B0B0B0"
				disabled={searchText === ""}
				disabledStyle={{
					backgroundColor: "#393939",
					opacity: 0,
				}}
				onPress={() => updateSearchText("")}
			/>
		);
	}

	const getLeftIcon = () => {
		return (
			<Icon
				type="ionicon"
				name="search"
				size={24}
				color="white"
			/>
		);
	}

    return (
		<SearchFieldContainer>
			<Input
				onChangeText={updateSearchText}
				placeholder={placeholderText}
				value={searchText}
				style={SearchInputFieldStyle}
				inputContainerStyle={SearchInputContainerStyle}
				rightIcon={clearIcon ? getRightIcon : null}
				leftIcon={getLeftIcon}
			/>
		</SearchFieldContainer>
	);
};