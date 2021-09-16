import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styled from 'styled-components/native';

export default Sidebar = ({ reelay }) => {
	const ICON_SIZE = 56;
	const Count = styled(Text)`
		color: #fff;
		font-size: 18px;
		font-weight: bold;
		letter-spacing: -0.1px;
	`
	const SidebarView = styled(View)`
		align-items: flex-end;
		justify-content: flex-end;
		margin: 10px;
		bottom: 25%;
	`
	const SidebarButton = styled(Pressable)`
		align-items: center;
		justify-content: center;
		margin: 10px;
	`
	const [liked, setLiked] = useState(false);
	return (
		<SidebarView>
			<SidebarButton onPress={() => setLiked(!liked)}>
				<Icon type='ionicon' name='heart' color={liked ? '#b83636' : 'white'} size={ICON_SIZE} />
				<Count>{33}</Count>
			</SidebarButton>
			<SidebarButton>
				<Icon type='ionicon' name='chatbubble-ellipses' color='white' size={ICON_SIZE} />
				<Count>{66}</Count>
			</SidebarButton>
		</SidebarView>
	);
}