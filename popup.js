document.addEventListener('DOMContentLoaded', function () {
    const apiKeyInput = document.getElementById('apiKey');
    const addKeyButton = document.getElementById('addKey');
    const apiKeyList = document.getElementById('apiKeyList');
    const statusDiv = document.getElementById('status');

    // Load existing API keys
    loadApiKeys();

    addKeyButton.addEventListener('click', addApiKey);
    apiKeyInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addApiKey();
        }
    });

    function addApiKey() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        chrome.storage.local.get(['apiKeys'], function (result) {
            const apiKeys = result.apiKeys || [];
            if (apiKeys.includes(apiKey)) {
                showStatus('This API key already exists', 'error');
                return;
            }

            apiKeys.push(apiKey);
            chrome.storage.local.set({ apiKeys: apiKeys }, function () {
                apiKeyInput.value = '';
                loadApiKeys();
                showStatus('API key added successfully', 'success');
            });
        });
    }

    function loadApiKeys() {
        chrome.storage.local.get(['apiKeys'], function (result) {
            const apiKeys = result.apiKeys || [];
            apiKeyList.innerHTML = '';

            apiKeys.forEach((key, index) => {
                const keyElement = document.createElement('div');
                keyElement.className = 'api-key-item';

                const keyText = document.createElement('span');
                keyText.textContent = `Key ${index + 1}: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteApiKey(index);

                keyElement.appendChild(keyText);
                keyElement.appendChild(deleteButton);
                apiKeyList.appendChild(keyElement);
            });
        });
    }

    function deleteApiKey(index) {
        chrome.storage.local.get(['apiKeys'], function (result) {
            const apiKeys = result.apiKeys || [];
            apiKeys.splice(index, 1);
            chrome.storage.local.set({ apiKeys: apiKeys }, function () {
                loadApiKeys();
                showStatus('API key deleted successfully', 'success');
            });
        });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status';
        }, 3000);
    }
}); 