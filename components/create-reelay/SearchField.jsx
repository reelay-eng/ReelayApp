import React from 'react';
import { SafeAreaView } from 'react-native';
import { Input, Icon } from 'react-native-elements';
import styled from 'styled-components/native';

const SearchFieldContainer = styled(SafeAreaView)`
	width: 95%;
`

export default SearchField = ({ 
    searchText, 
    updateSearchText, 
    placeholderText = 'Search',
    borderRadius = 18,
    clearIcon = true,
}) => {

    return (
		<SearchFieldContainer>
			<Input
				onChangeText={updateSearchText}
				placeholder={placeholderText}
				value={searchText}
				style={{
					color: "white",
					fontFamily: "Outfit-Regular",
					fontSize: 16,
					fontStyle: "normal",
					lineHeight: 24,
					letterSpacing: 0.15,
					textAlign: "left",
				}}
				inputContainerStyle={{
					borderBottomWidth: 0,
					marginTop: 10,
					paddingLeft: 10,
					paddingTop: clearIcon ? 2 : 6,
					paddingBottom: clearIcon ? 2 : 6,
					paddingRight: 10,
					backgroundColor: "#393939",
					borderRadius: borderRadius,
					justifyContent: 'center',
				}}
				rightIcon={
                    clearIcon ?
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
                        : null
				}
			/>
		</SearchFieldContainer>
	);
};