import Constants from 'expo-constants';
import { getInfoAsync, deleteAsync } from 'expo-file-system';
import { logAmplitudeEventProd } from '../components/utils/EventLogger';
import { showErrorToast } from '../components/utils/toasts';

export const DEVICE_CAN_USE_FFMPEG = (Constants.appOwnership !== 'expo');
const INSTA_STORY_HEIGHT = 1920
const INSTA_STORY_WIDTH = 1080;

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
    if (!DEVICE_CAN_USE_FFMPEG) return;  
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
    if (!DEVICE_CAN_USE_FFMPEG) {
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

export const compositeReviewForInstagramStories = async ({ inputURIs, offsets }) => {
    /**
     * 1. Crop video to proper dimensions
     * 2. Paste reelay on premade background
     * 3. Add star rating and title to top of reelay
     * 4. Add title poster, username, and profile pic on top of reelay + background
     * 5. Return to sender
     */

    if (!DEVICE_CAN_USE_FFMPEG) return inputURIs?.videoURI;
    try {
        const FFmpegKit = require('ffmpeg-kit-react-native')?.FFmpegKit;
        const { backplateURI, videoURI, overlayURI } = inputURIs;
        const outputVideoURI = `${videoURI}-insta-story.mp4`;
        console.log('output video URI: ', outputVideoURI);
        const BORDER_RADIUS = 20;

        /**
         * Commands in order:
         * 1. Scale original video to 600x1240 with black bar letterboxing
         * 2. Round the edges of the scaled video
         * 3. Overlay the scaled, rounded video onto the background image
         * 4. Overlay the title poster, creator info, and star rating
         */

        const command = `-i ${backplateURI} -i ${videoURI} -i ${overlayURI} -filter_complex \
            "[1:v] scale=600:1240:force_original_aspect_ratio=decrease,pad=600:1240:(ow-iw)/2:(oh-ih)/2 [scl], \
            [scl] format=yuva420p,geq=lum='p(X,Y)':a='if(gt(abs(W/2-X),W/2-${BORDER_RADIUS})*gt(abs(H/2-Y),H/2-${BORDER_RADIUS}),if(lte(hypot(${BORDER_RADIUS}-(W/2-abs(W/2-X)),${BORDER_RADIUS}-(H/2-abs(H/2-Y))),${BORDER_RADIUS}),255,0),255)'[rounded], \
            [0:v][rounded] overlay=${offsets.left}:${offsets.top + 10} [penult], \
            [penult][2:v] overlay=${offsets.left}:${offsets.top}" \
            ${outputVideoURI}`;

        
        const session = await FFmpegKit.execute(command);
        const parsedSession = await parseFFmpegSession(session); 
        console.log('parsed session: ', parsedSession);  
        const outputFileInfo = await getInfoAsync(outputVideoURI, { size: true });
        console.log('output file info: ', outputFileInfo);
        return outputFileInfo?.uri;
    } catch (error) {
        console.log(error);
        logAmplitudeEventProd('ffmpegApiError', { error });
        return localVideoURI;
    }
}