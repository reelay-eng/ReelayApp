export const checkUsername = (username) => {
    // original regex = /^([a-zA-z]+[a-zA-z0-9]*(?:[.\-_+][a-zA-Z0-9]+)*)$/g;
    // must be between 4 and 25 characters
    // cannot start with symbols
    // only connectors allowed are .-_+
    // has to be alphanumeric
    if (username.length<4 || username.length>16) {
        return false;
    }
    if (!isAlphaNumeric(username[0]) || !isAlphaNumeric(username[username.length-1])) {
        return false;
    }

    for (let i = 0; i<username.length; i++) {
        if (!isAlphaNumeric(username[i]) && !isValidConnector(username[i])) {
            return false;
        }
    }

    return true;
}

const isAlphaNumeric = (str) => {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
        }
    }
    return true;
};

const isValidConnector = (str) => {
    switch (str) {
        case ".":
            return true;
        case "_":
            return true;
        case "-":
            return true;
        case "+":
            return true;
        default:
            return false;
    }
};