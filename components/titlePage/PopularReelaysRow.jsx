import React, { useContext, useEffect, useState, useRef } from 'react';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';

import { getReelaysByTitleKey } from "../../api/ReelayDBApi";
import ReelayThumbnail from '../global/ReelayThumbnail';
import styled from 'styled-components/native';
import * as ReelayText from "../../components/global/Text";
import { AuthContext } from '../../context/AuthContext';
import { logAmplitudeEventProd } from '../../components/utils/EventLogger';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const Container = styled(View)`
	width: 100%;
`
const SeeAllReviewsPressable = styled(TouchableOpacity)`
	align-items: center;
	background-color: black
	border-color: white;
	border-radius: 20px;
	border-width: 1px;
	height: 40px;
	justify-content: center;
	margin: 24px;
	width: ${width - 48}px;
`
const SeeAllReviewsText = styled(ReelayText.Overline)`
	color: white;
`
const TopReelaysContainer = styled(View)`
	width: 95%;
	left: 5%;
`
const TopReelaysHeader = styled(ReelayText.H5Emphasized)`
	padding: 10px;
	color: white;
`

export default PopularReelaysRow = ({ navigation, titleObj }) => {
    const { reelayDBUser } = useContext(AuthContext);
	const authSession = useSelector(state => state.authSession);
	const [topReelays, setTopReelays] = useState([]);
	const componentMounted = useRef(true);
	const titleType = titleObj?.isSeries ? 'tv' : 'film';
	const tmdbTitleID = titleObj?.id;
	const titleKey = `${titleType}-${tmdbTitleID}`;

	const byReelayPopularity = (reelay1, reelay2) => {
		const reelay1Score = reelay1.likes.length + reelay1.comments.length;
		const reelay2Score = reelay2.likes.length + reelay2.comments.length;
		return reelay2Score - reelay1Score;
	};

	const fetchTopReelays = async () => {
		const mostRecentReelays = await getReelaysByTitleKey({
			authSession,
			reqUserSub: reelayDBUser?.sub,
			titleKey,
		});
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

	if (topReelays.length > 0) return (
		<Container>
			<TopReelays goToReelay={goToReelay} topReelays={topReelays} />
			<SeeAllReviewsPressable onPress={() => goToReelay(0)}>
				<SeeAllReviewsText>{'See all reviews'}</SeeAllReviewsText>
			</SeeAllReviewsPressable>
		</Container>
	);
	else return null;
};

const TopReelays = ({ goToReelay, topReelays }) => {
	// TODO: move scroll view into a flatlist

	const renderReelayThumbnail = ({ item, index }) => {
		const reelay = item;
		return (
			<ReelayThumbnail
				reelay={reelay}
				showVenue={false}
				onPress={() => goToReelay(index)}
				width={120}
			/>
		);
	}

	return (
		<TopReelaysContainer>
			<TopReelaysHeader>{`Top Reviews`}</TopReelaysHeader>
			<FlatList
				data={topReelays}
				estimatedItemSize={120}
				horizontal={true}
				keyExtractor={reelay => reelay?.id}
				renderItem={renderReelayThumbnail}
				showsHorizontalScrollIndicator={false}
			/>
		</TopReelaysContainer>
	);
};
