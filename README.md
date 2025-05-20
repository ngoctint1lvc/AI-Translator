# AI Text Translator Chrome Extension

A Chrome extension that allows you to translate selected text using ChatGPT. The extension provides detailed translations with pinyin and explanations in Vietnamese.

## Features

- Select any text and press the `H` key to translate
- Support for multiple OpenAI API keys with automatic rotation
- Detailed translations with pinyin and explanations for Chinese
- Easy-to-use popup interface for managing API keys

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon in your browser toolbar
2. Add your OpenAI API key(s) in the popup
3. Select any text on a webpage
4. Press the `H` key
5. The translation will appear in a notification

## API Key Management

- You can add multiple API keys for automatic rotation
- The extension will automatically switch to the next key if one fails
- API keys are stored securely in Chrome's storage
- You can delete API keys at any time through the popup interface

## Requirements

- Chrome browser
- OpenAI API key(s)

## Note

Make sure you have valid OpenAI API keys with sufficient credits for the translation service to work properly.