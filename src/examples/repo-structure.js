src/
    front-end/
        components/
            search-field.jsx
            header.jsx
            feed.jsx
            loading.jsx
        pages/
            home.jsx --> 
            crowds.jsx
        api/
            index.js // get/put/post
            home.js
        hooks/ (if need be that gets too big or is reusable, for example fetching a feed) 
            home.js
            
        utils/
    back-end/
        models/
        routes/
        server.js
        middleware.js
    contexts/ //as you need them
        auth.js
        error.js
        toast.js
    common/
        type-defs
        // do this later







export function HomePage() {

}

function App() {
    return (
        <Context.Provider>
            <HomePage />
        </Context.Provider>
    )
}