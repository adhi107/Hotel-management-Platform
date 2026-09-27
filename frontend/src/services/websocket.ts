type WebSocketListener = (payload: any) => void;

class RealtimeWebSocketService {
  private sockets: Map<string, WebSocket> = new Map();
  private listeners: Map<string, Set<WebSocketListener>> = new Map();
  private reconnectTimers: Map<string, any> = new Map();

  private getWebSocketUrl(channel: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/${channel}`;
  }

  public subscribe(channel: string, listener: WebSocketListener): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(listener);

    if (!this.sockets.has(channel) || this.sockets.get(channel)?.readyState === WebSocket.CLOSED) {
      this.connect(channel);
    }

    return () => {
      const channelListeners = this.listeners.get(channel);
      if (channelListeners) {
        channelListeners.delete(listener);
        if (channelListeners.size === 0) {
          this.disconnect(channel);
        }
      }
    };
  }

  private connect(channel: string) {
    if (this.sockets.has(channel)) {
      const existing = this.sockets.get(channel);
      if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
        return;
      }
    }

    try {
      const url = this.getWebSocketUrl(channel);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        // Clear any reconnect timer
        if (this.reconnectTimers.has(channel)) {
          clearTimeout(this.reconnectTimers.get(channel));
          this.reconnectTimers.delete(channel);
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const channelListeners = this.listeners.get(channel);
          if (channelListeners) {
            channelListeners.forEach((fn) => fn(parsed));
          }
        } catch (err) {
          // Non-JSON message or raw ping
        }
      };

      ws.onclose = () => {
        this.sockets.delete(channel);
        // Attempt reconnection if listeners still exist
        if (this.listeners.has(channel) && this.listeners.get(channel)!.size > 0) {
          const timer = setTimeout(() => this.connect(channel), 3000);
          this.reconnectTimers.set(channel, timer);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      this.sockets.set(channel, ws);
    } catch (err) {
      console.warn('WebSocket connection error:', err);
    }
  }

  private disconnect(channel: string) {
    if (this.reconnectTimers.has(channel)) {
      clearTimeout(this.reconnectTimers.get(channel));
      this.reconnectTimers.delete(channel);
    }
    const ws = this.sockets.get(channel);
    if (ws) {
      ws.close();
      this.sockets.delete(channel);
    }
    this.listeners.delete(channel);
  }
}

export const realtimeWS = new RealtimeWebSocketService();
