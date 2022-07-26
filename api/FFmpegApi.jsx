let FFmpegKit, ReturnCode;
import Constants from 'expo-constants';
import { getInfoAsync, deleteAsync } from 'expo-file-system';
import { showErrorToast } from '../components/utils/toasts';

export const deviceCanCompress = (Constants.appOwnership !== 'expo');

if (deviceCanCompress) {
    FFmpegKit = require('ffmpeg-kit-react-native').FFmpegKit;
    ReturnCode = require('ffmpeg-kit-react-native').ReturnCode;
} else {
    FFmpegKit = null;
    ReturnCode = null;
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
    if (!deviceCanCompress) {
        console.log('skipping video compression');
        return { 
            outputURI: inputURI,
            parsedSession: {},
            error: 'Device cannot compress video' 
        };
    }
    console.log('starting video compression');

    try {
        const filenameEnd = inputURI.indexOf('.mp4');
        const outputURI = `${inputURI.slice(0, filenameEnd)}-ffmpeg.mp4`;
        const existingOutputFileInfo = await getInfoAsync(outputURI);
        if (existingOutputFileInfo?.exists) {
            console.log('Deleting existing file: ', outputURI);
            await deleteAsync(outputURI);
        }

        const command = `-i ${inputURI} -vcodec h264 -acodec aac ${outputURI}`;
        const session = await FFmpegKit.execute(command);
        const parsedSession = await parseFFmpegSession(session);   

        const inputFileInfo = await getInfoAsync(inputURI, { size: true });
        const outputFileInfo = await getInfoAsync(outputURI, { size: true });
        console.log('input file info: ', inputFileInfo);
        console.log('output file info: ', outputFileInfo);
        return { outputURI, parsedSession, error: false };
    } catch (error) {
        showErrorToast('An error occurred. Could not complete video compression.');
        console.log(error);
        return null;
    }
}
