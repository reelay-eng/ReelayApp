let FFmpegKit, ReturnCode;
import Constants from 'expo-constants';

if (Constants.appOwnership === 'expo') {
    FFmpegKit = null;
    ReturnCode = null;
} else {
    FFmpegKit = require('ffmpeg-kit-react-native').FFmpegKit;
    ReturnCode = require('ffmpeg-kit-react-native').ReturnCode;
}

const parseSessionLogs = async (session) => {
    try {
        const [failStackTrace, logs, statistics] = await Promise.all([
            session.getFailStackTrace(),
            session.getLogs(),
            session.getStatistics(),
        ]);
        return { failStackTrace, logs, statistics };    
    } catch (error) {
        console.log(error);
        return null;
    }
}

const parseFFmpegSession = async (session) => {
    try {
        const returnCode = await session.getReturnCode();
        const sessionID = session.getSessionId();
        const success = ReturnCode.isSuccess(returnCode);
        const cancel = ReturnCode.isCancel(returnCode);
        const error = !success && !cancel;
    
        const output = await session.getOutput();   
        
        return {
            returnCode,
            sessionID,
            success,
            cancel,
            error,
            output,
        };
    } catch (error) {
        console.log(error);
        const sessionLogs = await parseSessionLogs(session);
        if (sessionLogs) {
            console.log('session logs: ', sessionLogs);
        } else {
            console.log('session logs unreadable');
        }
        return null;
    }
}

export const compressVideoForUpload = async (inputURI, crf=24) => {
    if (!FFmpegKit) return inputURI;

    try {
        const filenameEnd = outputURI.indexOf('.mp4');
        const outputURI = `${inputURI.slice(0, filenameEnd)}-ffmpeg.mp4`

        // const command = `ffmpeg -i ${inputURI} -vcodec libx264 -acodec aac -crf ${crf} ${outputURI}`;
        const command = `ffmpeg -i ${inputURI} ${outputURI}`;
        const session = await FFmpegKit.execute(command);
        return await parseFFmpegSession(session);   
    } catch (error) {
        console.log('An error occurred. Could not complete video compression.');
        return null;
    }
}

