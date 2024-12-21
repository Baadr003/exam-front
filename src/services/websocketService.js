import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export class WebSocketService {
    constructor(userId) {
        this.userId = userId;
        this.client = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
    }

    connect(onMessageReceived) {
        const authData = localStorage.getItem('authData');
        if (!authData) {
            console.error('Authentication data not found');
            return;
        }

        const parsedAuthData = JSON.parse(authData);
        if (!parsedAuthData.isAuthenticated) {
            console.error('User not authenticated');
            return;
        }

        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                userId: this.userId
            },
            onConnect: () => {
                console.log('WebSocket Connected with userId:', this.userId);
                this.connected = true;
                this.reconnectAttempts = 0;
                this.subscribeToAlerts(onMessageReceived);
            },
            onDisconnect: () => {
                console.log('WebSocket Disconnected');
                this.connected = false;
                this.handleReconnect(onMessageReceived);
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                this.handleReconnect(onMessageReceived);
            }
        });

        this.client.activate();
    }

    handleReconnect(onMessageReceived) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(onMessageReceived), 2000);
        }
    }

    disconnect() {
        if (this.client && this.connected) {
            console.log('Disconnecting WebSocket');
            this.client.deactivate();
            this.connected = false;
        }
    }

    subscribeToAlerts(onMessageReceived) {
        if (this.client && this.userId) {
            return this.client.subscribe(`/user/${this.userId}/topic/alerts`, message => {
                const alert = JSON.parse(message.body);
                onMessageReceived(alert);
            });
        }
    }
}