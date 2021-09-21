
export const sendPushNotification = async ({
    body='Default notification body', 
    data={},
    title='Default notification title', 
    token, 
    sound='default'
}) => {
    const message = { body, data, sound, title, to: token };
    console.log('push notification message: ');
    console.log(message);
    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}