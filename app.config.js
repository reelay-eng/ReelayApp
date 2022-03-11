export default ({ config }) => {
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production';
        // note: this is what happens in production
    }

    const getReelayAPIBaseURL = () => {
        if (process.env.NODE_ENV === 'production') return 'https://api-prod.reelay.app';
        if (process.env.NODE_ENV === 'staging') return 'https://api-staging.reelay.app';
        if (process.env.NODE_ENV === 'dev' ||
            process.env.NODE_ENV === 'devg') return 'https://api-dev.reelay.app';
        if (process.env.NODE_ENV === 'local' || 
            process.env.NODE_ENV === 'localg') return 'https://reelay-api-dev.loca.lt';

        // should be unreachable but just in case
        return 'https://api-prod.reelay.app';
    }

    const getVisibility = () => {
        if (process.env.NODE_ENV === 'production' ||
            process.env.NODE_ENV === 'devg' ||
            process.env.NODE_ENV === 'localg') return 'global';
        if (process.env.NODE_ENV === 'staging' ||
            process.env.NODE_ENV === 'dev' ||
            process.env.NODE_ENV === 'local') return 'dev';

        // should be unreachable but just in case
        return 'global';
    }

    // setting up any constants we need throughout the app
    // aws-exports are handled in their own autogenerated file
    // todo: this file is not a great place to keep secrets
    const extra = {
        appEnv: process.env.NODE_ENV,
        amplitudeApiKey: '41cdcb8df4bfc40ab39155a7e3401d22',
        cloudfrontBaseUrl: 'https://di92fpd9s7eko.cloudfront.net',
        expoNotificationUrl: 'https://exp.host/--/api/v2/push/send',

        reelayApiBaseUrl: getReelayAPIBaseURL(),
        reelayApiKey: 'ac739ac2-5877-47de-a861-59bc776bdd27',
        reelayS3UploadBucket: 'reelay-content211002-dev',

        tmdbApiKey: '033f105cd28f507f3dc6ae794d5e44f5',
        tmdbApiBaseUrl: 'https://api.themoviedb.org/3',
        tmdbImageApiBaseUrl: 'http://image.tmdb.org/t/p/w500/',

        feedVisibility: getVisibility(),
        uploadVisibility: getVisibility(),
    };

    return {
        ...config,
        extra: extra,
    }
}