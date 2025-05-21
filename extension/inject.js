window.AITranslator = {
    translate: function(text) {
        return new Promise((resolve, reject) => {
            // Create a unique ID for this translation request
            const requestId = 'ait_' + Date.now();
            
            // Listen for the response
            const listener = function(event) {
                if (event.data && event.data.type === 'AITranslatorResponse' && event.data.requestId === requestId) {
                    window.removeEventListener('message', listener);
                    if (event.data.error) {
                        reject(event.data.error);
                    } else {
                        resolve(event.data.translation);
                    }
                }
            };
            
            window.addEventListener('message', listener);
            
            // Send message to content script
            window.postMessage({
                type: 'AITranslatorRequest',
                requestId: requestId,
                text: text
            }, window.location.origin);
        });
    }
};