## ws: A nodejs websocket library - just reading docs

1. install ws in project

```bash
npm install ws
```

2. optional performance recommended for scaling and fast

[ws doc](https://github.com/websockets/ws?tab=readme-ov-file#opt-in-for-performance)

[claude explained](https://github.com/websockets/ws?tab=readme-ov-file#opt-in-for-performance)

[chatGPT explained](https://chatgpt.com/s/t_694b5d29eafc8191860c5d701b95fc7d)

3. read all general doc of ws to get basic understanding - [README.md](https://github.com/websockets/ws)

4. For specifically nodejs ws methods and properties, see this docs below.

[Node.js-like documentation of ws classes and utility functions.](https://github.com/websockets/ws/blob/master/doc/ws.md)

---

## Query-1 : different port or same port for websocket server (claude explains)

Also i have basic express app server. but i need to update this index.ts code to this.

[updated index.ts](https://claude.ai/public/artifacts/e7e6b1cc-3441-4a03-abc1-61014f9ed6ea)

And below is explaination

#### Answer: NO, you don't need another port! ✅

But you need to **modify your current setup** because `app.listen()` won't work for WebSockets.

---

#### The Problem with Your Current Code

```typescript
app.listen(PORT, () => {
  // ❌ This creates an HTTP server internally
  console.log(`server started at port ${PORT}`);
});
```

**Issue**: When you do `app.listen()`, Express creates an HTTP server internally that you **can't access**. You need access to that HTTP server to attach WebSockets to it.

---

#### The Solution (Simple Change)## What Changed? 🔍

#### Before (Your Current Code):

```typescript
app.listen(8000); // Express creates HTTP server internally
// You can't access it = Can't add WebSocket
```

#### After (New Code):

```typescript
const server = http.createServer(app); // You create HTTP server
const wss = new WebSocketServer({ server }); // Attach WebSocket to it
server.listen(8000); // Start ONE server
```

---

#### How It Actually Works (The Magic)

When you start the server, here's what happens:

```
Port 8000 is listening
         ↓
┌─────────────────────────────────────┐
│   HTTP Server (created from app)   │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │  Express     │  │ WebSocket   │ │
│  │  REST API    │  │  Server     │ │
│  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────┘
```

#### When a request comes in:

**1. Regular HTTP Request** (like `GET /api/users`)

```
Client → http://localhost:8000/api/users
         ↓
HTTP Server → Express handles it → Response
```

**2. WebSocket Upgrade Request** (like `new WebSocket("ws://localhost:8000/ws")`)

```
Client → ws://localhost:8000/ws
         ↓
HTTP Server receives upgrade request
         ↓
WebSocket Server handles it
         ↓
Connection upgraded → Persistent connection established
```

---

#### Your app.js Doesn't Change! ✅

Your existing `app.js` with all your routes stays **exactly the same**:

```typescript
// app.js - NO CHANGES NEEDED
import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/users", (req, res) => {
  // your logic
});

export default app;
```

---

#### Installation

If you don't have the `ws` package:

```bash
npm install ws
npm install --save-dev @types/ws  # If using TypeScript
```

---

#### Summary (The Key Insight)

- ❌ **Wrong thinking**: "WebSocket = Different server = Different port"
- ✅ **Right thinking**: "WebSocket = Extension of HTTP server = Same port"

**The only change**: Instead of `app.listen()`, you do `http.createServer(app).listen()`

This gives you access to the HTTP server object, so you can attach WebSocket to it.

**Result**:

- REST API: `http://localhost:8000/api/*`
- WebSocket: `ws://localhost:8000/ws`
- **Same port, one server, everything works together!**

---

## Query-2 : actuall flow starts and end.

```javascript
// ⚡ THIS LINE creates the connection
const ws = new WebSocket("ws://localhost:8000/ws");
```

What happens:

- Browser sends HTTP request to http://localhost:8000/ws with upgrade headers
- Backend sees upgrade request
- Connection transforms to WebSocket
- Now you have persistent connection

```javascript
// ⚡ THIS LINE closes the connection
ws.close();
```

What happens:

- Sends close frame to server
- Connection terminates
- Backend's ws.on('close') handler fires
