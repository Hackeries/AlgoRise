#!/usr/bin/env node
/**
 * Matchmaking Worker
 * Continuously finds matches for players in queue
 */

import MatchmakingService from '../lib/battle-arena/matchmaking-service';
import GameServer from '../lib/battle-arena/game-server';

const POLL_INTERVAL = 3000; // 3 seconds

async function runMatchmaking() {
  console.log('Matchmaking worker started');
  
  setInterval(async () => {
    try {
      // Find matches for each mode
      const modes: Array<'quick_1v1' | 'ranked_1v1' | '3v3_team'> = [
        'quick_1v1',
        'ranked_1v1',
        '3v3_team'
      ];
      
      for (const mode of modes) {
        const matches = await MatchmakingService.findMatches(mode);
        
        if (matches.length > 0) {
          console.log(`Found ${matches.length} matches for ${mode}`);
          
          for (const match of matches) {
            // Initialize game room
            await GameServer.initializeRoom(match.matchId);
            
            // TODO: Notify players via WebSocket
            console.log(`Match ${match.matchId} initialized for players:`, 
              match.players.map(p => p.userId));
          }
        }
      }
    } catch (error) {
      console.error('Error in matchmaking worker:', error);
    }
  }, POLL_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Matchmaking worker shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Matchmaking worker shutting down...');
  process.exit(0);
});

// Start worker
runMatchmaking().catch(console.error);
