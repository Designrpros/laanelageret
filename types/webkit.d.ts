// lane-lageret/types/webkit.d.ts
interface WebkitMessageHandler {
  postMessage: (message: any) => void;
}

interface WebkitMessageHandlers {
  [key: string]: WebkitMessageHandler;
}

interface Webkit {
  messageHandlers: WebkitMessageHandlers;
}

interface Window {
  webkit?: Webkit;
}