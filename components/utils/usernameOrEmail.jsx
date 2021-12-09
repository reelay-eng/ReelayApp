import { getUserByEmail } from "../../api/ReelayDBApi";

export const getInputUsername = async (inputText) => {
    if (inputText.includes('@')) {
        const cleanedInputEmail = inputText.trim().toLowerCase();
        console.log(cleanedInputEmail);
        const userResult = await getUserByEmail(cleanedInputEmail);

        if (!userResult || userResult.error || !userResult?.username) {
            // handle error
            return '';
        }
        
        return userResult?.username;
    } else {
        return inputText.trim();
    }
}