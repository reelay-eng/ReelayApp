import React, { memo, useContext, useEffect, useState, useRef } from 'react';
import { Image, Pressable, View, Animated, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../context/AuthContext';
const ReelayTile = memo(({ navigation, route, refreshControl, topReelays, keys }) => {
    const { reelayDBUser } = useContext(AuthContext);
    const dispatch = useDispatch();


    const goToReelay = (item, index) => {
		console.log("goToReelay",index)
        
        if(index !== 0)
        return;

        navigation.push("TitleFeedScreen", {
			initialStackPos: index,
			fixedStackList: topOfTheWeek,
		});
	};

    const extendFeed = async () => {
        console.log("extendFeed")
        const page = (feedSource === 'discover')
            ? discoverMostRecent.nextPage
            : nextPage.current;

        const fetchedThreads = (feedSource === 'discover') 
            ? await getDiscoverFeed({ 
                authSession, 
                filters: coalesceFiltersForAPI(selectedFilters, myStreamingVenues), 
                page, 
                reqUserSub: reelayDBUser?.sub,
                sortMethod,
            })
            : await getFeed({ 
                authSession, 
                feedSource, 
                page, 
                reqUserSub: reelayDBUser?.sub, 
            });

        // probably don't need to create this every time, but we want to avoid unnecessary state
        const threadEntries = {};
        const addToThreadEntries = (fetchedThread) => {
            const reelay = fetchedThread[0];
            threadEntries[reelay?.sub ?? reelay?.id] = 1;
        }
        reelayThreads.forEach(addToThreadEntries);

        const notAlreadyInStack = (fetchedThread) => {
            const reelay = fetchedThread[0];
            const alreadyInStack = threadEntries[reelay?.sub ?? reelay?.id];
            if (alreadyInStack) console.log('Filtering stack ', reelay?.sub ?? reelay?.id);
            return !alreadyInStack;
        }

        const filteredThreads = fetchedThreads.filter(notAlreadyInStack);
        const allThreads = [...reelayThreads, ...filteredThreads];

        if (feedSource === 'discover') {
            let dispatchAction = 'setDiscoverMostRecent';
            if (sortMethod === 'thisWeek') dispatchAction = 'setDiscoverThisWeek';
            if (sortMethod === 'thisMonth') dispatchAction = 'setDiscoverThisMonth';
            if (sortMethod === 'allTime') dispatchAction = 'setDiscoverAllTime';

            const payload = {
                content: allThreads,
                filters: {},
                nextPage: page + 1,
            }
            console.log('dispatching payload with threads: ', allThreads.length);
            dispatch({ type: dispatchAction, payload });
        }

        nextPage.current = page + 1;
        setReelayThreads(allThreads);
        return allThreads;
    }



    const TopReelays = ({ goToReelay, topReelays }) => {
        // TODO: move scroll view into a flatlist

        const renderReelayThumbnail = ({ item, index }) => {
            const reelay = item[0];
            return (
                <ReelayThumbnailWithMovie
                    reelay={reelay}
                    asTopOfTheWeek={true}
                    showVenue={false}
                    onPress={() => goToReelay(item[0], index)}
                    showLikes={false}
                />
                
            );
        }

        return (
            <View>
                <FlatList
                    data={topReelays}
                    refreshControl={refreshControl}
                    columnWrapperStyle={{justifyContent:"center"}}
                    contentContainerStyle={{paddingBottom:220}}
                    // estimatedItemSize={180}
                    numColumns={2}
                    key={reelay => reelay?.id}
                    // keyExtractor={reelay => reelay?.id}
                    renderItem={renderReelayThumbnail}
                    // onEndReached={extendFeed}
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        );
    };

    return (
        <View>
            <TopReelays goToReelay={goToReelay} topReelays={topReelays}/>
        </View>
    )
});

export default ReelayTile;