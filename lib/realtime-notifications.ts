// Real-time notification manager using WebSocket-like functionality
// This will be used for more robust real-time features

export interface NotificationConnection {
  userId: string;
  lastSeen: Date;
  controller?: ReadableStreamDefaultController;
}

export class RealTimeNotificationManager {
  private connections: Map<string, NotificationConnection[]> = new Map();
  private static instance: RealTimeNotificationManager;
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): RealTimeNotificationManager {
    if (!RealTimeNotificationManager.instance) {
      RealTimeNotificationManager.instance = new RealTimeNotificationManager();
    }
    return RealTimeNotificationManager.instance;
  }

  constructor() {
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 60000); // Run cleanup every minute
  }

  // Add a new connection for a user
  addConnection(
    userId: string,
    controller: ReadableStreamDefaultController
  ): void {
    const userConnections = this.connections.get(userId) || [];
    userConnections.push({
      userId,
      lastSeen: new Date(),
      controller,
    });
    this.connections.set(userId, userConnections);

    console.log(
      `User ${userId} connected. Total connections: ${userConnections.length}`
    );
  }

  // Remove a connection for a user
  removeConnection(
    userId: string,
    controller: ReadableStreamDefaultController
  ): void {
    const userConnections = this.connections.get(userId) || [];
    const updatedConnections = userConnections.filter(
      conn => conn.controller !== controller
    );

    if (updatedConnections.length === 0) {
      this.connections.delete(userId);
    } else {
      this.connections.set(userId, updatedConnections);
    }

    console.log(
      `User ${userId} disconnected. Remaining connections: ${updatedConnections.length}`
    );
  }

  // Send notification to specific user
  async sendToUser(userId: string, notification: any): Promise<void> {
    const userConnections = this.connections.get(userId) || [];
    const encoder = new TextEncoder();

    const data = JSON.stringify({
      type: 'notification',
      notification,
      timestamp: new Date().toISOString(),
    });

    // Send to all active connections for this user
    const sendPromises = userConnections.map(async (connection) => {
      try {
        connection.controller?.enqueue(encoder.encode(`data: ${data}\n\n`));
        connection.lastSeen = new Date();
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
        // Remove failed connection
        this.removeConnection(userId, connection.controller!);
      }
    });

    // Wait for all sends to complete
    await Promise.all(sendPromises);
  }

  // Send notification to multiple users
  async sendToUsers(userIds: string[], notification: any): Promise<void> {
    // Batch notifications to reduce overhead
    const sendPromises = userIds.map(userId => this.sendToUser(userId, notification));
    await Promise.all(sendPromises);
  }

  // Broadcast system-wide notification
  async broadcast(notification: any): Promise<void> {
    const encoder = new TextEncoder();
    const data = JSON.stringify({
      type: 'system_notification',
      notification,
      timestamp: new Date().toISOString(),
    });

    const sendPromises: Promise<void>[] = [];

    for (const [userId, connections] of this.connections.entries()) {
      for (const connection of connections) {
        sendPromises.push(
          new Promise((resolve) => {
            try {
              connection.controller?.enqueue(encoder.encode(`data: ${data}\n\n`));
              connection.lastSeen = new Date();
              resolve();
            } catch (error) {
              console.error(`Error broadcasting to user ${userId}:`, error);
              this.removeConnection(userId, connection.controller!);
              resolve();
            }
          })
        );
      }
    }

    // Wait for all sends to complete
    await Promise.all(sendPromises);
  }

  // Get active users count
  getActiveUsersCount(): number {
    return this.connections.size;
  }

  // Get total connections count
  getTotalConnectionsCount(): number {
    let total = 0;
    for (const connections of this.connections.values()) {
      total += connections.length;
    }
    return total;
  }

  // Clean up stale connections
  cleanupStaleConnections(): void {
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    const now = new Date();

    for (const [userId, connections] of this.connections.entries()) {
      const activeConnections = connections.filter(conn => {
        const isStale =
          now.getTime() - conn.lastSeen.getTime() > staleThreshold;
        if (isStale) {
          try {
            conn.controller?.close();
          } catch (error) {
            console.error('Error closing stale connection:', error);
          }
        }
        return !isStale;
      });

      if (activeConnections.length === 0) {
        this.connections.delete(userId);
      } else {
        this.connections.set(userId, activeConnections);
      }
    }
  }

  // Send unread count update
  async sendUnreadCountUpdate(
    userId: string,
    unreadCount: number
  ): Promise<void> {
    await this.sendToUser(userId, {
      type: 'unread_count_update',
      unreadCount,
    });
  }

  // Send real-time contest updates
  async sendContestUpdate(contestId: string, update: any): Promise<void> {
    // In a real implementation, you'd get users registered for this contest
    // For now, broadcast to all connected users
    await this.broadcast({
      type: 'contest_update',
      contestId,
      ...update,
    });
  }

  // Send group message notification
  async sendGroupMessageNotification(
    groupId: string,
    message: any,
    excludeUserId?: string
  ): Promise<void> {
    // In a real implementation, you'd get group members from database
    // For now, this is a placeholder structure
    await this.broadcast({
      type: 'group_message',
      groupId,
      message,
      excludeUserId,
    });
  }

  // Clean up resources
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Close all connections
    for (const connections of this.connections.values()) {
      for (const connection of connections) {
        try {
          connection.controller?.close();
        } catch (error) {
          console.error('Error closing connection:', error);
        }
      }
    }
    
    this.connections.clear();
  }
}

export default RealTimeNotificationManager;