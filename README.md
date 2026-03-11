# Simple AI Q&A Website

This is a small Node.js + Express app that serves a single-page website.  
You type a question, it sends it to an AI model on the server, and shows the reply.

The API key is **never exposed in the browser**: the frontend only talks to your local backend.

## 1. Requirements

- Node.js 18+ installed (check with `node -v`)
- An OpenAI API key (you can get one from your OpenAI account dashboard)

## 2. Install dependencies

Open a terminal in this folder:

```bash
cd "c:\Users\ira\Downloads"
npm install
```

This installs `express`, `openai`, and other dependencies defined in `package.json`.

## 3. Set your API key

Create a file named `.env` next to `server.js` with this content:

```bash
OPENAI_API_KEY=your_openai_key_here
PORT=3000
```

- Replace `your_openai_key_here` with your real key.
- Never commit `.env` to any public repo.

## 4. Run the app

In the same folder, start the server:

```bash
npm start
```

You should see something like:

```text
Server running on http://localhost:3000BETTER - ITS WORKING.. HOW COME IT IS CONNECTED TO CHATGPT 4.0 AND WONT USE WEB SEARCH

```

Now open a browser and go to:

```text
http://localhost:3000
```

You can type a question on the left and hit **Ask the AI**; the answer will appear on the right.

## 5. Changing the model (optional)

By default, `server.js` uses the `gpt-4.1-mini` model.  
If you want to change the model name, open `server.js` and update the `model` field in the `openai.chat.completions.create` call.

