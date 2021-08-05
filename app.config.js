export default ({ config }) => {
    // maybe the single worst line of code in the whole project
    if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

    const extra = {
        feedVisibility: process.env.NODE_ENV == 'production' ? 'global' : 'dev',
        uploadVisibility: process.env.NODE_ENV == 'production' ? 'global' : 'dev',
        sentryEnvironment: process.env.NODE_ENV == 'production' ? 'production' : 'development'
    };
    return {
        ...config,
        extra: extra,
    }
}