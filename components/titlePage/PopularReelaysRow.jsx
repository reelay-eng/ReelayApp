import React, { useContext, useEffect, useState, useRef } from 'react';
import { ScrollView, View } from 'react-native';

import { getMostRecentReelaysByTitle } from "../../api/ReelayDBApi";
import ReelayThumbnail from '../global/ReelayThumbnail';
import styled from 'styled-components/native';
import * as ReelayText from "../../components/global/Text";
import { BWButton } from "../../components/global/Buttons";
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';

export default PopularReelaysRow = ({ navigation, titleObj }) => {
    const { reelayDBUser } = useContext(AuthContext);
	const [topReelays, setTopReelays] = useState([]);
	const componentMounted = useRef(true);

	const byReelayPopularity = (reelay1, reelay2) => {
		const reelay1Score = reelay1.likes.length + reelay1.comments.length;
		const reelay2Score = reelay2.likes.length + reelay2.comments.length;
		return reelay2Score - reelay1Score;
	};

	const fetchTopReelays = async () => {
		const mostRecentReelays = await getMostRecentReelaysByTitle(titleObj.id);
		if (mostRecentReelays?.length && componentMounted.current) {
			const nextTopReelays = mostRecentReelays.sort(byReelayPopularity);
			setTopReelays(nextTopReelays);
		}
	};

	useEffect(() => {
		fetchTopReelays();
		return () => (componentMounted.current = false);
	}, []);

	const goToReelay = (index) => {
		if (topReelays.length === 0) return;
		navigation.push("TitleFeedScreen", {
			initialStackPos: index,
			fixedStackList: [topReelays],
		});
		logAmplitudeEventProd('openTitleFeed', {
			username: reelayDBUser?.username,
			title: titleObj?.title?.display,
			source: 'titlePage',
			});
	};

	const Container = styled(View)`
		width: 100%;
	`;
	const ButtonContainer = styled(View)`
		margin-top: 10px;
		margin-bottom: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	`;
	const ButtonSizer = styled(View)`
		width: 84%;
		height: 40px;
	`

	if (topReelays.length > 0) return (
		<Container>
			<TopReelays goToReelay={goToReelay} topReelays={topReelays} />
			<ButtonContainer>
				<ButtonSizer>
					<BWButton
						text={"See all reviews"}
						fontSize={"28px"}
						onPress={() => {
							goToReelay(0);
						}}
					/>
				</ButtonSizer>
			</ButtonContainer>
		</Container>
	);
	else return null;
};

const TopReelays = ({ goToReelay, topReelays }) => {
	const TopReelaysContainer = styled(View)`
		width: 95%;
		left: 5%;
	`;
	const ThumbnailScrollContainer = styled(View)`
		align-items: center;
		flex-direction: row;
		justify-content: flex-start;
		height: 220px;
		width: 100%;
	`;
	const TopReelaysHeader = styled(ReelayText.H5Emphasized)`
		padding: 10px;
		color: white;
	`;

	// TODO: move scroll view into a flatlist

	return (
		<TopReelaysContainer>
			<TopReelaysHeader>{`Top Reviews`}</TopReelaysHeader>
			<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
				<ThumbnailScrollContainer>
					{ topReelays.map((reelay, index) => {
						return (
							<ReelayThumbnail
								key={reelay.id}
								reelay={reelay}
								showVenue={false}
								onPress={() => goToReelay(index)}
								width={120}
							/>
						);
					})}
				</ThumbnailScrollContainer>
			</ScrollView>
		</TopReelaysContainer>
	);
};
