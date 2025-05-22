chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate') {
        translateText(request.text, request.language)
            .then(translation => {
                sendResponse({ translation });
            })
            .catch(error => {
                sendResponse({ error: error.message });
            });
        return true; // Keep the message channel open for the async response
    }
});

const chineseTranslationPrompt = `
Bạn là một giáo viên dạy tiếng trung, phân tích nghĩa câu tiếng Trung của người dùng WORD-BY-WORD, rõ ràng, ngắn gọn bằng tiếng Việt kèm theo pinyin. Đối với tên riêng tiếng Trung, hãy dịch ra Hán Việt.
Ví dụ:

Phân tích câu: 今天它叫山西晋南

今天 (jīn tiān): hôm nay
它 (tā): nó
叫 (jiào): gọi là
山西 (Shān xī): Sơn Tây (tên một tỉnh ở Trung Quốc)
晋南 (Jìn nán): Tấn Nam (khu vực phía nam của tỉnh Sơn Tây)

Dịch nghĩa: Hôm nay nó được gọi là Sơn Tây Tấn Nam.
`;

const defaultPrompt = `
Bạn là một chatbot phân tích ngôn ngữ, phân tích các idioms, slangs, từ vựng phức tạp trong câu được cung cấp. Ví dụ:

Phân tích câu: You did not tell me that you intended to go into harness.

- You did not tell me: "Bạn đã không nói với tôi"
- that you intended: "rằng bạn đã dự định"
- to go into harness: là một thành ngữ tiếng Anh, nghĩa đen là "vào ách kéo" (như ngựa kéo xe), nghĩa bóng là "bắt đầu làm việc trở lại" hoặc "bắt đầu gánh vác trách nhiệm công việc".

Dịch nghĩa: Bạn đã không nói với tôi rằng bạn dự định quay lại làm việc / bắt đầu công việc.
`;

let currentKeyIndex = 0;
async function translateText(text, language = "zh-CN") {
    const result = await chrome.storage.local.get(['apiKeys']);
    const apiKeys = result.apiKeys || [];

    if (apiKeys.length === 0) {
        throw new Error('Please add at least one API key in the extension popup');
    }

    try {
        const systemPrompt = language === "zh-CN" ? chineseTranslationPrompt : defaultPrompt;
        const apiKey = apiKeys[currentKeyIndex];
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: "Phân tích câu: " + text
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            let errorMsg = (await response.json().catch(() => {}))?.error?.message;
            if (errorMsg.includes("You exceeded your current quota")) {
                // Rotate to the next API key
                currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        const translation = data.choices[0].message.content;

        return translation;
    } catch (error) {
        console.error('Translation error:', error);
        throw new Error(`Failed to translate text: ${error.message}`);
    }
}