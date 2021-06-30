    front-end/
        package.json
        babel.config.js
        metro.config.js
        tsconfig.json
        index.js
        build/
            1sdfdsf1.min.js
            342343.min.css
            index.js
            // artifact --> this the thing you're going to deploy
        components/
            search-field/
                search-field.jsx --> styled components
                search-field.test.js
                index.js
            header/
                header.jsx
                header.test.js
                index.js
            // alternatively 
            feed.jsx
            loading.jsx
        contexts/ //as you need them
            auth.js
            error.js
            toast.js
        build/
        screen/
            home.jsx --> 
            crowds.jsx
        api/
            index.js // get/put/post
            home.js
        hooks/ (if need be that gets too big or is reusable, for example fetching a feed) 
            home.js
        e2e-tests/
            // very mission critical things. 
            // want this to run on CI/CD --> Github ACtions --> 
        utils/
            constants.js
            format.js
    back-end/
        models/
        routes/
        server.js
        middleware.js
    common/
        type-defs
        // do this later



