let realFetch = window.fetch;
window.fetch = function (url, opts) {
    return new Promise((resolve, reject) => {
        // wrap in timeout to simulate server api call
        setTimeout(() => {

            
 
            // pass through any requests not handled above
            realFetch(url, opts).then(response => resolve(response));

        }, 500);
    });
} 