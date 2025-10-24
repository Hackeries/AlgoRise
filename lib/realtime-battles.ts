// Realtime battles functionality using the existing realtime notifications pattern

import { RealTimeNotificationManager } from '@/lib/realtime-notifications';

export class RealtimeBattles {
  private rtManager: RealTimeNotificationManager;

  constructor() {
    this.rtManager = RealTimeNotificationManager.getInstance();
  }

  /**
   * Send a battle event to specific users
   * @param userIds Array of user IDs to send the event to
   * @param battleId ID of the battle
   * @param eventType Type of the event
   * @param data Additional data for the event
   */
  async sendBattleEvent(
    userIds: string[],
    battleId: string,
    eventType: string,
    data?: any
  ): Promise<void> {
    await this.rtManager.sendToUsers(userIds, {
      type: `battle_${eventType}`,
      battleId,
      ...data
    });
  }

  /**
   * Send a battle event to all connected users
   * @param battleId ID of the battle
   * @param eventType Type of the event
   * @param data Additional data for the event
   */
  async broadcastBattleEvent(
    battleId: string,
    eventType: string,
    data?: any
  ): Promise<void> {
    await this.rtManager.broadcast({
      type: `battle_${eventType}`,
      battleId,
      ...data
    });
  }

  /**
   * Send a battle update to participants and spectators
   * @param battleId ID of the battle
   * @param updateData Data about the update
   */
  async sendBattleUpdate(
    battleId: string,
    updateData: any
  ): Promise<void> {
    // In a real implementation, you would fetch participants and spectators from the database
    // For now, we'll just broadcast to all connected users
    await this.broadcastBattleEvent(battleId, 'update', updateData);
  }

  /**
   * Send a round start notification
   * @param battleId ID of the battle
   * @param roundNumber Number of the round
   * @param participantIds IDs of the participants
   */
  async sendRoundStart(
    battleId: string,
    roundNumber: number,
    participantIds: string[]
  ): Promise<void> {
    await this.sendBattleEvent(participantIds, battleId, 'round_started', {
      roundNumber
    });
  }

  /**
   * Send a round end notification
   * @param battleId ID of the battle
   * @param roundNumber Number of the round
   * @param winnerUserId ID of the winner
   * @param participantIds IDs of the participants
   */
  async sendRoundEnd(
    battleId: string,
    roundNumber: number,
    winnerUserId: string,
    participantIds: string[]
  ): Promise<void> {
    await this.sendBattleEvent(participantIds, battleId, 'round_ended', {
      roundNumber,
      winnerUserId
    });
  }

  /**
   * Send a submission received notification
   * @param userId ID of the user who submitted
   * @param battleId ID of the battle
   * @param roundId ID of the round
   */
  async sendSubmissionReceived(
    userId: string,
    battleId: string,
    roundId: string
  ): Promise<void> {
    await this.sendBattleEvent([userId], battleId, 'submission_received', {
      roundId
    });
  }

  /**
   * Send a submission judged notification
   * @param userId ID of the user who submitted
   * @param battleId ID of the battle
   * @param roundId ID of the round
   * @param status Status of the submission
   */
  async sendSubmissionJudged(
    userId: string,
    battleId: string,
    roundId: string,
    status: string
  ): Promise<void> {
    await this.sendBattleEvent([userId], battleId, 'submission_judged', {
      roundId,
      status
    });
  }
}

// Export singleton instance
export default new RealtimeBattles();