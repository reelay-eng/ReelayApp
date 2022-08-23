import Constants from 'expo-constants';
import { getInfoAsync, deleteAsync } from 'expo-file-system';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { showErrorToast } from '../components/utils/toasts';

export const DEVICE_CAN_COMPRESS = (Constants.appOwnership !== 'expo');

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
    if (!DEVICE_CAN_COMPRESS) return;  
    let ReturnCode = require('ffmpeg-kit-react-native')?.ReturnCode;

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

export const compressVideoForUpload = async (inputURI) => {
    if (!DEVICE_CAN_COMPRESS) {
        console.log('skipping video compression');
        logAmplitudeEventProd('ffmpegApiSkipCompression', {
            appOwnership: Constants.appOwnership
        });

        return { 
            outputURI: inputURI,
            parsedSession: {},
            error: 'Device cannot compress video' 
        };
    }

    try {
        const FFmpegKit = require('ffmpeg-kit-react-native')?.FFmpegKit;
        const filenameEnd = inputURI.indexOf('.mp4');
        const outputURI = `${inputURI.slice(0, filenameEnd)}-ffmpeg.mp4`;
        const existingOutputFileInfo = await getInfoAsync(outputURI);

        if (existingOutputFileInfo?.exists) {
            console.log('Deleting existing file: ', outputURI);
            await deleteAsync(outputURI);        
        }


        const command = `-i ${inputURI} -vcodec libx264 -b:v 1000k -acodec copy -preset ultrafast -crf 25 ${outputURI}`;
        logAmplitudeEventProd('ffmpegCompressionBegun', {
            inputURI, command,
        });

        const session = await FFmpegKit.execute(command);

        logAmplitudeEventProd('ffmpegCompressionExecuted', {
            session,
        });
        const parsedSession = await parseFFmpegSession(session);   

        const inputFileInfo = await getInfoAsync(inputURI, { size: true });
        const outputFileInfo = await getInfoAsync(outputURI, { size: true });
        console.log('input file info: ', inputFileInfo);
        console.log('output file info: ', outputFileInfo);

        logAmplitudeEventProd('ffmpegCompressionComplete', {
            inputFileSize: inputFileInfo?.size,
            outputFileSize: outputFileInfo?.size,
            parsedSession: parsedSession,
        });

        return { outputURI, parsedSession, error: false };
    } catch (error) {
        showErrorToast(error);
        console.log(error);
        logAmplitudeEventProd('ffmpegApiError', { error });
        return {
            outputURI: null,
            parsedSession: null,
            error: error,
        };
    }
}
