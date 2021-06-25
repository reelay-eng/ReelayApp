import React from 'react'
import styled from 'styled-components/native'

const SidebarView = styled.View`
	width: 60px;
	padding-bottom: 240px;
	justify-content: flex-end;
`
const SidebarButtonView = styled.View`
	margin: 9px 0;
	align-items: center;
`
const AvatarView = styled.View`
	width: 48px;
	height: 48px;
	margin-bottom: 13px;
`
const AvatarImage = styled.Image`
	width: 100%;
	height: 100%;
	border-radius: 48px;
	border-width: 2px;
	border-color: #ffffff;
`
const Icon = styled.Image`
	height: 40px;
`
const Count = styled.Text`
	color: #fff;
	font-size: 12px;
	letter-spacing: -0.1px;
`

const Sidebar = ({ avatar, stats }) => {
	return (
		<SidebarView>
			<SidebarButtonView>
				<AvatarView>
					<AvatarImage resizeMode='cover' source={require('../../assets/images/icon.png')} />
				</AvatarView>
			</SidebarButtonView>

			<SidebarButtonView>
				<Icon resizeMode='contain' source={require('../../assets/icons/007-heart.png')} />
				<Count>{stats.likes}</Count>
			</SidebarButtonView>

			<SidebarButtonView>
				<Icon
					resizeMode='contain'
					source={require('../../assets/icons/047-chat-2.png')}
				/>
				<Count>{stats.comments}</Count>
			</SidebarButtonView>

			<SidebarButtonView>
				<Icon resizeMode='contain' source={require('../../assets/icons/036-network-2.png')} />
				<Count>{stats.shares}</Count>
			</SidebarButtonView>
		</SidebarView>
	);
}

export default Sidebar;