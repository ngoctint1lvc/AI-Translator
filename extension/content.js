// Create and inject the popup container
function createPopupContainer() {
    const container = document.createElement('div');
    container.id = 'ai-translator-popup';
    container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000000 !important;
    font-family: Arial, sans-serif;
    display: none;
    overflow: auto;
    max-height: 90vh;
  `;
    document.body.appendChild(container);
    return container;
}

// Create the popup content
function createPopupContent() {
    const container = document.getElementById('ai-translator-popup') || createPopupContainer();

    // Create main wrapper
    const wrapper = document.createElement('div');
    wrapper.style.padding = '15px';

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

    // Create original text container
    const originalText = document.createElement('div');
    originalText.id = 'ai-translator-original';
    originalText.style.cssText = `
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
  `;

    // Create translation container
    const translationText = document.createElement('div');
    translationText.id = 'ai-translator-translation';
    translationText.style.cssText = `
    padding: 10px;
    background-color: #e8f5e9;
    border-radius: 4px;
    font-size: 14px;
    color: #2e7d32;
    white-space: pre-wrap;
  `;

    // Assemble the DOM
    contentWrapper.appendChild(originalText);
    contentWrapper.appendChild(translationText);
    wrapper.appendChild(contentWrapper);
    container.appendChild(wrapper);

    // Close when clicking outside
    document.addEventListener('click', (event) => {
        if (!container.contains(event.target) && event.target !== container) {
            container.remove();
        }
    });

    return container;
}

// Show the popup with loading state
function showTranslationPopup(text) {
    const container = createPopupContent();
    const originalText = container.querySelector('#ai-translator-original');
    const translationText = container.querySelector('#ai-translator-translation');

    originalText.textContent = text;

    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'text-align: center; padding: 20px; color: #666;';
    loadingDiv.textContent = 'Loading translation...';
    translationText.appendChild(loadingDiv);

    container.style.display = 'block';

    return container;
}

// Update the popup with translation
function updateTranslationPopup(translation) {
    const container = document.getElementById('ai-translator-popup');
    if (container) {
        const translationText = container.querySelector('#ai-translator-translation');
        translationText.textContent = translation;
    }
}

let hasModifierKeys = false;
document.addEventListener('keydown', function (event) {
    // Check if the pressed key is 'g' or 'G' and no modifier keys are pressed
    if ((event.key === 'h' || event.key === 'H') &&
        (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)) {
        hasModifierKeys = true;
    }
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'h' || event.key === 'H') {
        if (hasModifierKeys) {
            hasModifierKeys = false;
            return;
        }

        // if the translation popup is already open, close it
        let translationPopup = document.getElementById('ai-translator-popup');
        if (translationPopup) {
            translationPopup.remove();
            return;
        }

        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            let isChinese = /[\u4E00-\u9FFF]/.test(selectedText);
            let maxLength = isChinese ? 50: 150;
            if (selectedText.length > maxLength) {
                // notify user that the text is too long
                alert("Text is too long, please select a shorter text.");
                return;
            }

            // Show popup immediately with loading state
            showTranslationPopup(selectedText);

            // Send message to background script for translation
            chrome.runtime.sendMessage({
                action: 'translate',
                text: selectedText,
                language: isChinese ? 'zh-CN' : 'en-US'
            }, (response) => {
                if (response && response.translation) {
                    updateTranslationPopup(response.translation);
                } else if (response && response.error) {
                    updateTranslationPopup(response.error);
                }
            });
        }
    }
});

// Listen for messages from the injected AITranslator object
window.addEventListener('message', function (event) {
    // console.log("[DEBUG] event", event);
    if (event.source !== window) {
        return;
    }
    if (event.data && event.data.type === 'AITranslatorRequest') {
        const { requestId, text } = event.data;

        // if the translation popup is already open, close it
        let translationPopup = document.getElementById('ai-translator-popup');
        if (translationPopup) {
            translationPopup.remove();
            return;
        }

        let isChinese = /[\u4E00-\u9FFF]/.test(text);
        let maxLength = isChinese ? 50: 150;
        if (text.length > maxLength) {
            // notify user that the text is too long
            alert("Text is too long, please select a shorter text.");
            return;
        }
        
        // Show popup with loading state
        showTranslationPopup(text);
        
        // Send message to background script for translation
        chrome.runtime.sendMessage({
            action: 'translate',
            text: text,
            language: isChinese ? 'zh-CN' : 'en-US'
        }, (response) => {
            // Update the popup
            if (response && response.translation) {
                updateTranslationPopup(response.translation);
            } else if (response && response.error) {
                updateTranslationPopup(response.error);
            }

            // Send response back to the webpage
            window.postMessage({
                type: 'AITranslatorResponse',
                requestId: requestId,
                success: true,
            }, window.location.origin);
        });
    }
});

// Inject the AITranslator object
function injectAITranslator() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function() {
        script.remove();
    };
    (document.head || document.documentElement).appendChild(script);
}

// Inject as soon as possible
injectAITranslator();