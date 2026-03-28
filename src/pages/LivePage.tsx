/**
 * LivePage - Projector display for live auction
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Wifi } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { POSITION_CONFIG, CATEGORY_CONFIG } from '../types';
import { getPlayerImageUrl } from '../constants';
import type { Team, AuditLog } from '../types';

export default function LivePage() {
  const { 
    teams, 
    auctionState, 
    auditLogs,
    getPlayerById,
    getTeamById,
    getTeamRoster,
    getTeamBudget,
    getTeamConstraints,
    getNextBidAmount,
    getBidIncrement
  } = useApp();

  const currentPlayer = auctionState.currentPlayerId 
    ? getPlayerById(auctionState.currentPlayerId) 
    : null;
  
  const leadingTeam = auctionState.leadingTeamId 
    ? getTeamById(auctionState.leadingTeamId) 
    : null;

  // Get recent logs
  const recentLogs = auditLogs
    .filter((log: AuditLog) => ['BID_PLACED', 'PLAYER_SOLD', 'PLAYER_UNSOLD', 'PLAYER_BIDDING_START'].includes(log.type))
    .slice(0, 5);

  const nextBid = getNextBidAmount();
  const increment = auctionState.currentBid > 0 ? getBidIncrement(auctionState.currentBid) : 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-white flex items-center gap-2 hover:text-purple-300">
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden md:inline">Back</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-4xl font-bold text-white">⚽ ACC FUTSAL AUCTION</h1>
          {auctionState.phase === 'BIDDING' && (
            <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full animate-pulse">
              <Wifi className="w-5 h-5" />
              <span className="font-bold">LIVE</span>
            </div>
          )}
        </div>
        
        <div className="text-purple-300 text-sm">Press F11 for fullscreen</div>
      </div>

      {/* Main Content */}
      {auctionState.phase === 'BIDDING' && currentPlayer ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player Card - Large */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Player Image */}
              <div className="h-64 md:h-full bg-gradient-to-br from-purple-600/50 to-blue-600/50">
                <img 
                  src={getPlayerImageUrl(currentPlayer.photoUrl, currentPlayer.name)} 
                  alt={currentPlayer.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentPlayer.name}`;
                  }}
                />
              </div>
              
              {/* Player Info */}
              <div className="p-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{currentPlayer.name}</h2>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${CATEGORY_CONFIG[currentPlayer.category].bgColor} ${CATEGORY_CONFIG[currentPlayer.category].color}`}>
                    {CATEGORY_CONFIG[currentPlayer.category].label}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${POSITION_CONFIG[currentPlayer.position].bgColor} ${POSITION_CONFIG[currentPlayer.position].color}`}>
                    {POSITION_CONFIG[currentPlayer.position].label}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {currentPlayer.strongFoot} Foot
                  </span>
                </div>
                
                {/* Pitch Message */}
                <p className="text-purple-200 text-lg mb-6 italic">"{currentPlayer.pitchMessage}"</p>
                
                {/* Current Bid */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 mb-4">
                  <div className="text-green-100 text-sm mb-1">Current Bid</div>
                  <div className="text-4xl md:text-5xl font-bold text-white">
                    ৳{auctionState.currentBid > 0 ? auctionState.currentBid.toLocaleString() : auctionState.basePrice.toLocaleString()}
                  </div>
                  {leadingTeam && (
                    <div className="text-green-100 mt-2">
                      Leading: {leadingTeam.logoEmoji} {leadingTeam.name}
                    </div>
                  )}
                </div>
                
                {/* Next Bid Info */}
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <span className="text-purple-200">Next bid: </span>
                  <span className="text-white font-bold text-xl">৳{nextBid.toLocaleString()}</span>
                  <span className="text-purple-300 text-sm ml-2">(+৳{increment.toLocaleString()})</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Feed */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {recentLogs.length === 0 ? (
                <p className="text-purple-300 text-sm">No activity yet</p>
              ) : (
                recentLogs.map((log: AuditLog) => (
                  <div key={log.id} className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-purple-300 mb-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-white text-sm">
                      {log.type === 'BID_PLACED' && `${log.details.teamName} bid ৳${log.details.amount?.toLocaleString()}`}
                      {log.type === 'PLAYER_SOLD' && `✅ ${log.details.playerName} sold to ${log.details.teamName} for ৳${log.details.amount?.toLocaleString()}`}
                      {log.type === 'PLAYER_UNSOLD' && `❌ ${log.details.playerName} went unsold`}
                      {log.type === 'PLAYER_BIDDING_START' && `🎯 Bidding started for ${log.details.playerName}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {auctionState.phase === 'NOT_STARTED' && 'Auction Not Started'}
              {auctionState.phase === 'IDLE' && 'Waiting for Next Player...'}
              {auctionState.phase === 'PAUSED' && 'Auction Paused'}
              {auctionState.phase === 'COMPLETED' && '🎉 Auction Complete!'}
            </h2>
            <p className="text-purple-200">
              {auctionState.phase === 'NOT_STARTED' && 'The auction will begin shortly'}
              {auctionState.phase === 'IDLE' && 'Admin is selecting the next player'}
              {auctionState.phase === 'PAUSED' && 'Please wait for the auction to resume'}
              {auctionState.phase === 'COMPLETED' && 'All players have been auctioned'}
            </p>
          </div>
        </div>
      )}

      {/* Team Budget Cards */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Team Budgets</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {teams.map((team: Team) => {
            const roster = getTeamRoster(team.id);
            const budget = getTeamBudget(team.id);
            const constraints = getTeamConstraints(team.id);
            const isLeading = auctionState.leadingTeamId === team.id;
            
            return (
              <div 
                key={team.id}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 ${isLeading ? 'ring-2 ring-green-400' : ''}`}
                style={{ borderTop: `3px solid ${team.colorPrimary}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{team.logoEmoji}</span>
                  <span className="text-white font-bold">{team.shortName}</span>
                  {isLeading && <span className="text-green-400 text-xs">LEADING</span>}
                </div>
                
                <div className="text-2xl font-bold text-green-400 mb-2">
                  ৳{(budget.remaining / 1000).toFixed(0)}K
                </div>
                
                <div className="flex gap-2 text-xs">
                  <span className="text-purple-200">{roster.length}/8</span>
                  <span className={constraints.canAddGK ? 'text-green-400' : 'text-red-400'}>GK:{constraints.gkCount}</span>
                  <span className={constraints.canAddAlumni ? 'text-green-400' : 'text-red-400'}>AL:{constraints.alumniCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
