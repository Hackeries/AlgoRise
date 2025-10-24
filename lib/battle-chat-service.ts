// Battle chat service for Code Battle Arena

import { createClient } from '@/lib/supabase/server';
import { RealTimeNotificationManager } from '@/lib/realtime-notifications';

export interface BattleChatMessage {
  id: string;
  battle_id: string;
  user_id: string;
  message: string;
  created_at: string;
  users?: {
    email: string;
  };
}

export class BattleChatService {
  private supabase: any;
  private rtManager: RealTimeNotificationManager;

  constructor() {
    this.supabase = createClient();
    this.rtManager = RealTimeNotificationManager.getInstance();
  }

  /**
   * Send a chat message in a battle
   * @param battleId The battle ID
   * @param userId The user ID sending the message
   * @param message The message content
   * @returns Success status and message
   */
  async sendMessage(battleId: string, userId: string, message: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate message
      if (!message || message.trim().length === 0) {
        return { success: false, message: 'Message cannot be empty' };
      }

      if (message.length > 1000) {
        return { success: false, message: 'Message too long (max 1000 characters)' };
      }

      // Check if user is allowed to send messages in this battle
      const canSendMessage = await this.canUserSendMessage(battleId, userId);
      if (!canSendMessage) {
        return { success: false, message: 'You are not authorized to send messages in this battle' };
      }

      // Insert message
      const { error: insertError } = await this.supabase
        .from('battle_chat')
        .insert({
          battle_id: battleId,
          user_id: userId,
          message: message.trim()
        });

      if (insertError) {
        console.error('Error sending chat message:', insertError);
        return { success: false, message: 'Failed to send message' };
      }

      // Get the inserted message with user info
      const { data: messageData, error: messageError } = await this.supabase
        .from('battle_chat')
        .select(`
          *,
          users(email)
        `)
        .eq('battle_id', battleId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (messageError) {
        console.error('Error fetching inserted message:', messageError);
        // We still consider the message sent even if we can't fetch it back
        return { success: true, message: 'Message sent successfully' };
      }

      // Notify all participants and spectators about the new message
      const recipients = await this.getBattleRecipients(battleId);
      await this.rtManager.sendToUsers(recipients, {
        type: 'battle_chat_message',
        battleId,
        message: messageData
      });

      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error sending chat message:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Get chat messages for a battle
   * @param battleId The battle ID
   * @param limit Number of messages to fetch (default: 50)
   * @returns Array of chat messages
   */
  async getMessages(battleId: string, limit: number = 50): Promise<BattleChatMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from('battle_chat')
        .select(`
          *,
          users(email)
        `)
        .eq('battle_id', battleId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }

      // Reverse to show oldest first
      return data ? data.reverse() : [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  /**
   * Check if a user can send messages in a battle
   * @param battleId The battle ID
   * @param userId The user ID
   * @returns Boolean indicating if user can send messages
   */
  private async canUserSendMessage(battleId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is a participant
      const { data: participant, error: participantError } = await this.supabase
        .from('battle_participants')
        .select('id')
        .eq('battle_id', battleId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!participantError && participant) {
        return true;
      }

      // Check if user is a spectator
      const { data: spectator, error: spectatorError } = await this.supabase
        .from('battle_spectators')
        .select('id')
        .eq('battle_id', battleId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!spectatorError && spectator) {
        return true;
      }

      // Check if user is host or guest
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .select('host_user_id, guest_user_id')
        .eq('id', battleId)
        .single();

      if (!battleError && battle) {
        return battle.host_user_id === userId || battle.guest_user_id === userId;
      }

      return false;
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return false;
    }
  }

  /**
   * Get all recipients (participants and spectators) of a battle
   * @param battleId The battle ID
   * @returns Array of user IDs
   */
  private async getBattleRecipients(battleId: string): Promise<string[]> {
    try {
      // Get participants
      const { data: participants, error: participantsError } = await this.supabase
        .from('battle_participants')
        .select('user_id')
        .eq('battle_id', battleId);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return [];
      }

      // Get spectators
      const { data: spectators, error: spectatorsError } = await this.supabase
        .from('battle_spectators')
        .select('user_id')
        .eq('battle_id', battleId);

      if (spectatorsError) {
        console.error('Error fetching spectators:', spectatorsError);
        return [];
      }

      // Get host and guest
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .select('host_user_id, guest_user_id')
        .eq('id', battleId)
        .single();

      if (battleError) {
        console.error('Error fetching battle:', battleError);
        return [];
      }

      // Combine all user IDs and remove duplicates
      const userIds = new Set<string>();
      
      // Add participants
      participants.forEach((p: any) => userIds.add(p.user_id));
      
      // Add spectators
      spectators.forEach((s: any) => userIds.add(s.user_id));
      
      // Add host and guest
      if (battle.host_user_id) userIds.add(battle.host_user_id);
      if (battle.guest_user_id) userIds.add(battle.guest_user_id);

      return Array.from(userIds);
    } catch (error) {
      console.error('Error getting battle recipients:', error);
      return [];
    }
  }

  /**
   * Delete a chat message (only for message sender or battle host)
   * @param messageId The message ID
   * @param userId The user ID requesting deletion
   * @param battleId The battle ID
   * @returns Success status and message
   */
  async deleteMessage(messageId: string, userId: string, battleId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get the message to check ownership
      const { data: message, error: fetchError } = await this.supabase
        .from('battle_chat')
        .select('user_id')
        .eq('id', messageId)
        .eq('battle_id', battleId)
        .single();

      if (fetchError) {
        console.error('Error fetching message:', fetchError);
        return { success: false, message: 'Message not found' };
      }

      // Check if user is the message owner or battle host
      const isOwner = message.user_id === userId;
      
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .select('host_user_id')
        .eq('id', battleId)
        .single();

      const isHost = !battleError && battle.host_user_id === userId;

      if (!isOwner && !isHost) {
        return { success: false, message: 'You are not authorized to delete this message' };
      }

      // Delete the message
      const { error: deleteError } = await this.supabase
        .from('battle_chat')
        .delete()
        .eq('id', messageId);

      if (deleteError) {
        console.error('Error deleting message:', deleteError);
        return { success: false, message: 'Failed to delete message' };
      }

      // Notify all recipients about the deleted message
      const recipients = await this.getBattleRecipients(battleId);
      await this.rtManager.sendToUsers(recipients, {
        type: 'battle_chat_message_deleted',
        battleId,
        messageId
      });

      return { success: true, message: 'Message deleted successfully' };
    } catch (error) {
      console.error('Error deleting chat message:', error);
      return { success: false, message: 'Internal server error' };
    }
  }
}

export default BattleChatService;