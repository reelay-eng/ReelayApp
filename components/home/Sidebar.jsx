import React from 'react'
import styled from 'styled-components/native'

const Container = styled.View`
	width: 60px;
	height: 100%;
	padding-bottom: 300px;
	justify-content: flex-end;
`
const Menu = styled.View`
	margin: 9px 0;
	align-items: center;
`
const User = styled.View`
	width: 48px;
	height: 48px;
	margin-bottom: 13px;
`
const Avatar = styled.Image`
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
	console.log("Rendering sidebar. Counts: ");
	console.log(stats);
	return (
		<Container>
			<Menu>
				<User>
					<Avatar resizeMode='cover' source={require('../../assets/images/icon.png')} />
				</User>
			</Menu>

			<Menu>
				<Icon resizeMode='contain' source={require('../../assets/icons/007-heart.png')} />
				<Count>{stats.likes}</Count>
			</Menu>

			<Menu>
				<Icon
					resizeMode='contain'
					source={require('../../assets/icons/047-chat-2.png')}
				/>
				<Count>{stats.comments}</Count>
			</Menu>

			<Menu>
				<Icon resizeMode='contain' source={require('../../assets/icons/036-network-2.png')} />
				<Count>{stats.shares}</Count>
			</Menu>
		</Container>
	);
}

export default Sidebar;