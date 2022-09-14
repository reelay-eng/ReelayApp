import { streamingVenues } from "./VenueIcon";

const MAX_DISPLAY_TOP_FILTERS = 6;

export const FilterMappings = {
    'Type': [
        { category: 'titleType', option: 'reset', display: 'all' },
        { category: 'titleType', option: 'film', display: 'movie' },
        { category: 'titleType', option: 'tv', display: 'TV' },
    ],
    'Runtime': [
        { category: 'runtime', option: 'reset', display: 'all' },
        { category: 'runtime', option: 'lt_30', display: '<30min' },
        { category: 'runtime', option: 'lt_60', display: '<60min' },
        { category: 'runtime', option: 'lt_90', display: '<90min' },
        { category: 'runtime', option: 'lt_120', display: '<120min' },
        { category: 'runtime', option: 'lt_150', display: '<150min' },
        { category: 'runtime', option: 'epic', display: 'epics' },
    ],
    'Venue': [
        { category: 'venue', option: 'reset', display: 'all' },
        { category: 'venue', option: 'on_my_streaming', display: 'on my streaming' },
        { category: 'venue', option: 'theaters', display: 'in theaters' },
        { category: 'venue', option: 'festivals', display: 'at festivals' },
        { category: 'venue', option: 'on_other_streaming', display: 'on other streaming platforms' },
    ],
    'Watchlist': [
        { category: 'watchlist', option: 'reset', display: 'all' },
        { category: 'watchlist', option: 'on_my_watchlist', display: 'on my watchlist' },
        { category: 'watchlist', option: 'on_friends_watchlists', display: "on my friends' watchlists" },
        { category: 'watchlist', option: 'marked_seen', display: 'marked seen' },
        { category: 'watchlist', option: 'marked_unseen', display: 'not marked seen' },
    ],
    // 'Friends & Communities': [
    //     { category: 'community', option: 'reset', display: 'all' },
    //     { category: 'community', option: 'following', display: 'my friends' },
    //     { category: 'community', option: 'in_my_clubs', display: 'my clubs' },
    // ],
    'Popularity & Rating': [
        { category: 'popularityAndRating', option: 'reset', display: 'all' },
        { category: 'popularityAndRating', option: 'popular', display: 'popular' },
        { category: 'popularityAndRating', option: 'deep_cut', display: 'deep cut' },
        { category: 'popularityAndRating', option: 'hidden_gem', display: 'hidden gem' },
        { category: 'popularityAndRating', option: 'highly_rated', display: 'highly rated' },
        { category: 'popularityAndRating', option: 'poorly_rated', display: 'poorly rated' },
        { category: 'popularityAndRating', option: 'controversial', display: 'controversial' },

    ],
    'Decade': [
        { category: 'decade', option: 'reset', display: 'all' },
        { category: 'decade', option: 'in_2020s', display: '2020s' },
        { category: 'decade', option: 'in_2010s', display: '2010s' },
        { category: 'decade', option: 'in_2000s', display: '2000s' },
        { category: 'decade', option: 'in_1990s', display: '1990s' },
        { category: 'decade', option: 'in_1980s', display: '1980s' },
        { category: 'decade', option: 'in_1970s', display: '1970s' },
        { category: 'decade', option: 'in_1960s', display: '1960s' },
        { category: 'decade', option: 'in_1950s', display: '1950s' },
        { category: 'decade', option: 'in_1940s', display: '1940s' },
        { category: 'decade', option: 'in_1930s', display: '1930s' },
        { category: 'decade', option: 'in_1920s', display: '1920s' },
    ],
    'Language': [
        { category: 'language', option: 'reset', display: 'all' },
        { category: 'language', option: 'english', display: 'english' },
        { category: 'language', option: 'non_english', display: 'non-english' },
        { category: 'language', option: 'french', display: 'french' },
        { category: 'language', option: 'spanish', display: 'spanish' },
        { category: 'language', option: 'korean', display: 'korean' },
        { category: 'language', option: 'japanese', display: 'japanese' },
        { category: 'language', option: 'italian', display: 'italian' },
        { category: 'language', option: 'german', display: 'german' },
        { category: 'language', option: 'mandarin', display: 'mandarin' },
        { category: 'language', option: 'cantonese', display: 'cantonese' },
        { category: 'language', option: 'other', display: 'other' },
    ],
    'Genre': [
        { category: 'keywords', option: 'reset', display: 'all' },
        { category: 'keywords', option: 'Action', display: 'Action' },
        { category: 'keywords', option: 'Adventure', display: 'Adventure' },
        { category: 'keywords', option: 'Animation', display: 'Animation' },
        { category: 'keywords', option: 'Comedy', display: 'Comedy' },
        { category: 'keywords', option: 'Crime', display: 'Crime' },
        { category: 'keywords', option: 'Documentary', display: 'Documentary' },
        { category: 'keywords', option: 'Drama', display: 'Drama' },
        { category: 'keywords', option: 'Family', display: 'Family' },
        { category: 'keywords', option: 'Fantasy', display: 'Fantasy' },
        { category: 'keywords', option: 'History', display: 'History' },
        { category: 'keywords', option: 'Horror', display: 'Horror' },
        { category: 'keywords', option: 'Kids', display: 'Kids' },
        { category: 'keywords', option: 'Music', display: 'Music' },
        { category: 'keywords', option: 'Mystery', display: 'Mystery' },
        { category: 'keywords', option: 'Reality', display: 'Reality' },
        { category: 'keywords', option: 'Romance', display: 'Romance' },
        { category: 'keywords', option: 'Science Fiction', display: 'Science Fiction' },
        { category: 'keywords', option: 'Soap', display: 'Soap' },
        { category: 'keywords', option: 'Talk', display: 'Talk' },
        { category: 'keywords', option: 'Thriller', display: 'Thriller' },
        { category: 'keywords', option: 'TV Movie', display: 'TV Movie' },
        { category: 'keywords', option: 'War', display: 'War' },
        { category: 'keywords', option: 'Western', display: 'Western' },
    ],
}

export const coalesceFiltersForAPI = (selectedFilters, myStreamingVenues) => {
    if (!selectedFilters) return {};
    return selectedFilters.reduce((reqFilters, nextFilter) => {
        const { category, option } = nextFilter;
        const optionsToAdd = [];

        switch (option) {
            case 'reset':
                break;
            // streaming options
            case 'on_my_streaming':
                optionsToAdd.push(...myStreamingVenues);
                break;
            case 'on_other_streaming':
                const allStreamingVenues = streamingVenues.map(platform => platform.venue);
                const removeMyStreaming = (nextVenue) => myStreamingVenues.findIndex(nextVenue) === -1;
                const otherStreamingVenues = allStreamingVenues.filter(removeMyStreaming);
                optionsToAdd.push(...otherStreamingVenues);
                break;
            // genre options
            case 'Action':
                optionsToAdd.push('Action', 'Action & Adventure');
                break;
            case 'Adventure':
                optionsToAdd.push('Adventure', 'Action & Adventure');
                break;
            case 'Fantasy':
                optionsToAdd.push('Fantasy', 'Sci-Fi & Fantasy');
                break;    
            case 'Science Fiction':
                optionsToAdd.push('Science Fiction', 'Sci-Fi & Fantasy');
                break;
            case 'War':
            case 'War & Politics':
                optionsToAdd.push('War', 'War & Politics');
                break;    
            default:
                optionsToAdd.push(option);
                break;
        }

        if (reqFilters[category]) {
            reqFilters[category].push(...optionsToAdd);
        } else {
            reqFilters[category] = optionsToAdd;
        }
        return reqFilters;
    }, {});
}

export const getTopFilters = (selectedFilters) => {
    const topFilters = [
        { category: 'community', option: 'following', display: 'following' },
        { category: 'popularityAndRating', option: 'highly_rated', display: 'highly-rated' },
        { category: 'titleType', option: 'film', display: 'movies' },
        { category: 'titleType', option: 'tv', display: 'TV' },
        { category: 'venue', option: 'on_my_streaming', display: 'on my streaming' },
        { category: 'venue', option: 'theaters', display: 'in theaters' },
    ];

    const notInSelectedFilters = (nextTopFilter) => {
        const matchSelectedFilter = (nextSelectedFilter) => {
            return (
                nextTopFilter.category === nextSelectedFilter.category &&
                nextTopFilter.option === nextSelectedFilter.option
            );
        }
        return selectedFilters.findIndex(matchSelectedFilter) === -1;
    }

    // get up to 6 selected filters
    // if room, get remaining unselected top filters
    const topFiltersUnselected = topFilters.filter(notInSelectedFilters);
    const displayFilterCount = Math.max(MAX_DISPLAY_TOP_FILTERS, selectedFilters?.length);
    const displaySelectedFilters = [...selectedFilters, ...topFiltersUnselected]
        .slice(0, displayFilterCount);

    const displayFilters = [
        { category: 'all', option: 'reset', display: 'all' },
        ...displaySelectedFilters,
        { category: 'all', option: 'see_all_filters', display: 'show all ' },
    ];
    return displayFilters;
}
