import { API, Storage } from 'aws-amplify';
import { useDispatch, useSelector } from 'react-redux';
import { appendReelayList, resetFocus, setReelayList } from './ReelayFeedSlice';
import * as queries from '../../src/graphql/queries';

const ReelayFeedLoader = async () => {

    const REELAY_LOAD_BUFFER_SIZE = 3;
    const reelayListNextToken = useSelector((state) => state.reelayFeed.reelayListNextToken);
    const selectedFeedLoaded = useSelector((state) => state.reelayFeed.selectedFeedLoaded);

    const dispatch = useDispatch();

    const queryResponse = (selectedFeedLoaded) ? 
    await API.graphql({
        query: queries.reelaysByUploadDate,
        variables: {
            visibility: 'global',
            sortDirection: 'DESC',
            limit: REELAY_LOAD_BUFFER_SIZE,
            nextToken: reelayListNextToken
        }
    }) :
    await API.graphql({
        query: queries.reelaysByUploadDate,
        variables: {
            visibility: 'global',
            sortDirection: 'DESC',
            limit: REELAY_LOAD_BUFFER_SIZE
        }
    });

    if (!queryResponse) {
        console.log('No query response');
        return;
    }

    // should exist (or be set to null) whether the feed is loaded or not
    // setReelayListNextToken(nextToken);

    // for each reelay fetched
    const fetchedReelays = [];
    await queryResponse.data.reelaysByUploadDate.items.map(async (reelayObject) => {

        // get the video URL from S3
        const signedVideoURI = await Storage.get(reelayObject.videoS3Key, {
            contentType: "video/mp4"
        });

        if (reelayObject.tmdbTitleID && reelayObject.isMovie) {
            const tmdbTitleQuery = `${TMDB_API_BASE_URL}\/movie/${reelayObject.tmdbTitleID}`;
            reelayObject.tmdbTitleObject = await fetch(tmdbTitleQuery);
        } else if (reelayObject.tmdbTitleID && reelayObject.isSeries) {
            const tmdbTitleQuery = `${TMDB_API_BASE_URL}\/tv/${reelayObject.tmdbTitleID}`;
            reelayObject.tmdbTitleObject = await fetch(tmdbTitleQuery);
        }

        fetchedReelays.push({
            id: reelayObject.id,
            creator: {
                username: String(reelayObject.owner),
                avatar: '../../assets/images/icon.png'
            },
            movie: {
                title: reelayObject.tmdbTitleObject 
                    ? reelayObject.tmdbTitleObject.title 
                    : String(reelayObject.movieID),
            },
            videoURI: signedVideoURI,
            postedDateTime: Date(reelayObject.createdAt),
            stats: {
                likes: 99,
                comments: 66,
                shares: 33
            }
        });
    });

    const nextToken = queryResponse.data.reelaysByUploadDate.nextToken;
    if (selectedFeedLoaded) {
        dispatch(setReelayList({
            initialReelays: fetchedReelays,
            nextToken: nextToken,
        }));
    } else {
        dispatch(appendReelayList({
            nextReelays: fetchedReelays,
            nextToken: nextToken,
        }));
    }
}

export default ReelayFeedLoader;