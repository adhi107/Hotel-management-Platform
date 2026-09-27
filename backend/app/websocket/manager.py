from typing import Dict, List, Set, Any
from fastapi import WebSocket
import logging
import json

logger = logging.getLogger("aura.websocket")

class ConnectionManager:
    def __init__(self):
        # Map of channel/room name -> Set of active WebSocket connections
        self.active_rooms: Dict[str, Set[WebSocket]] = {}
        # Map of WebSocket -> Set of room names it subscribed to
        self.socket_rooms: Dict[WebSocket, Set[str]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_rooms:
            self.active_rooms[channel] = set()
        self.active_rooms[channel].add(websocket)
        
        if websocket not in self.socket_rooms:
            self.socket_rooms[websocket] = set()
        self.socket_rooms[websocket].add(channel)
        logger.info(f"WebSocket connected to channel: {channel} (Total sockets in room: {len(self.active_rooms[channel])})")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.socket_rooms:
            for channel in self.socket_rooms[websocket]:
                if channel in self.active_rooms:
                    self.active_rooms[channel].discard(websocket)
                    if not self.active_rooms[channel]:
                        del self.active_rooms[channel]
            del self.socket_rooms[websocket]
        logger.info("WebSocket disconnected and cleaned up.")

    async def broadcast_to_channel(self, channel: str, message: Dict[str, Any]):
        if channel in self.active_rooms:
            payload = json.dumps(message)
            stale_sockets = []
            for connection in self.active_rooms[channel]:
                try:
                    await connection.send_text(payload)
                except Exception as e:
                    logger.warning(f"Error sending message to socket: {e}")
                    stale_sockets.append(connection)
            for stale in stale_sockets:
                self.disconnect(stale)

ws_manager = ConnectionManager()
