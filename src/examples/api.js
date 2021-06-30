import {GetDataContext} from "@app/common/type-defs";

export function get(url, queryParams: GetDataContext) {
    try {
        const result = await fetch(url, queryParams);
        return result; 
    } catch (e) {
        throw e; 
    }
}

export function put(url, queryParams) {
    try {
        const result = await fetch(url, queryParams, "PUT");
        return result; 
    } catch (e) {
        throw e; 

        // whatever function
    }


}


export fetchHomeFeed() {
    try {

    } catch (e) {

    }
}