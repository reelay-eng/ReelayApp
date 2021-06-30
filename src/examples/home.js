import { useState, useEffect } from "react";
import { getHomeFeed } from "api/home.js"; 
import { Feed } from "components/Feed.jsx";
import { Loading } from "components/loading.jsx";


function fetchData() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [ message, setMessage] = useState();
    const [ data, setData] = useState(null);
    setLoading(true);
    useEffect(async () => {
        try {
            const result = await getHomeFeed();
            if (result.code > 400) {
                throw new Error(result.message);
            }
            setMessage(message);
            setLoading(false);
            setData(result.data);
        } catch (e) {
            setLoading(false);
            setError(message);
        }
    })
}


export function home() {
    const [status, message, data] = fetchData();
    const [searchResults, setSearchResults] = useState();
    const [searchText, setSearchText] = useState();

    return (
        <Container>
            {
                this.state.loading ? (
                    <Loading />
                ) : (
                    <View>
                    <Search onSearch={setSearchResults} results={searchResults}/>
                    <Feed data={data} />

                    </View>
                )
            }
            {
                this.state.error && (
                    <Error message={this.state.error} />
                )
            }

        </Container>
    )
}

const Search = (results) => {
    return (
        <Container>
            {
                results.map(result => {
                    return (
                        <SearchResult result={result} />
                    )
                })
            }
        </Container>
    )
}

// styled components