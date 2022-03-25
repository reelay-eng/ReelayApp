// https://dmitripavlutin.com/timeout-fetch-request/
export const fetchResults = async (query, options={ timeout: 8000 }) => {
    const { timeout = 8000 } = options;

    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
      
        const response = await fetch(query, {
            ...options,
            signal: controller.signal  
          }).then((response) => response.json())
            .catch((error) => {
                console.log('Error in fetch results: ');
                console.log(error);
            });
        clearTimeout(id);
        return response;
    
    } catch (error) {
        console.log(error);
        return null;
    }
}