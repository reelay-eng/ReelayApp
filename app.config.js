export default ({ config }) => {
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production';
    }

    // setting up any constants we need throughout the app
    // aws-exports are handled in their own autogenerated file
    // todo: this file is not a great place to keep secrets
    const extra = {
        amplitudeApiKey: '41cdcb8df4bfc40ab39155a7e3401d22',
        cloudfrontBaseUrl: 'https://di92fpd9s7eko.cloudfront.net',
        expoNotificationsUrl: 'https://exp.host/--/api/v2/push/send',
        reelayApiBaseUrl: 'http://data.reelay.app/',

        tmdbApiKey: '033f105cd28f507f3dc6ae794d5e44f5',
        tmdbApiBaseUrl: 'https://api.themoviedb.org/3',
        tmdbImageApiBaseUrl: 'http://image.tmdb.org/t/p/w500/',

        feedVisibility: process.env.NODE_ENV == 'production' ? 'global' : 'dev',
        uploadVisibility: process.env.NODE_ENV == 'production' ? 'global' : 'dev',
    };

    return {
        ...config,
        extra: extra,
    }
}