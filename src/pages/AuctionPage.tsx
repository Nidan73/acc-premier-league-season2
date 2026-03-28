/**
 * AuctionPage - View player pool and team rosters
 */

import { useState, useMemo } from 'react';
import { Users, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { POSITION_CONFIG, CATEGORY_CONFIG, STATUS_CONFIG } from '../types';
import { getPlayerImageUrl } from '../constants';
import type { Player, Team, PlayerPosition, PlayerCategory, PlayerStatus } from '../types';

export default function AuctionPage() {
  const { players, teams, getTeamRoster, getTeamBudget, getTeamConstraints } = useApp();
  
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  const [positionFilter, setPositionFilter] = useState<PlayerPosition | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<PlayerCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<PlayerStatus | 'ALL'>('ALL');

  // Filter players
  const filteredPlayers = useMemo(() => {
    return players.filter((p: Player) => {
      if (positionFilter !== 'ALL' && p.position !== positionFilter) return false;
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      return true;
    });
  }, [players, positionFilter, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = players.length;
    const sold = players.filter((p: Player) => p.status === 'SOLD').length;
    const available = players.filter((p: Player) => p.status === 'AVAILABLE').length;
    const unsold = players.filter((p: Player) => p.status === 'UNSOLD').length;
    return { total, sold, available, unsold };
  }, [players]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8" />
            Auction
          </h1>
          
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <span className="text-white bg-white/10 px-3 py-1 rounded-full">{stats.total} Total</span>
            <span className="text-green-400 bg-green-500/20 px-3 py-1 rounded-full">{stats.sold} Sold</span>
            <span className="text-orange-400 bg-orange-500/20 px-3 py-1 rounded-full">{stats.available} Available</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'players' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            Player Pool
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'teams' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            Team Rosters
          </button>
        </div>

        {activeTab === 'players' && (
          <>
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-purple-300" />
                <span className="text-white font-medium">Filters</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value as PlayerPosition | 'ALL')}
                  className="bg-white/20 text-white border border-white/20 rounded-lg px-3 py-2"
                >
                  <option value="ALL">All Positions</option>
                  <option value="GK">Goalkeeper</option>
                  <option value="DEF">Defender</option>
                  <option value="MID">Midfielder</option>
                  <option value="FWD">Forward</option>
                </select>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as PlayerCategory | 'ALL')}
                  className="bg-white/20 text-white border border-white/20 rounded-lg px-3 py-2"
                >
                  <option value="ALL">All Categories</option>
                  <option value="MEMBER">Member</option>
                  <option value="ALUMNI">Alumni</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PlayerStatus | 'ALL')}
                  className="bg-white/20 text-white border border-white/20 rounded-lg px-3 py-2"
                >
                  <option value="ALL">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="UNSOLD">Unsold</option>
                </select>
              </div>
            </div>

            {/* Player Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map((player: Player) => {
                const posConfig = POSITION_CONFIG[player.position];
                const catConfig = CATEGORY_CONFIG[player.category];
                const statusConfig = STATUS_CONFIG[player.status];
                const soldToTeam = player.soldToTeamId 
                  ? teams.find((t: Team) => t.id === player.soldToTeamId) 
                  : null;
                
                return (
                  <div 
                    key={player.id}
                    className={`bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden ${
                      player.status === 'SOLD' ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Player Image */}
                    <div className="h-48 bg-gradient-to-br from-purple-600/50 to-blue-600/50 relative">
                      <img 
                        src={getPlayerImageUrl(player.photoUrl, player.name)} 
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`;
                        }}
                      />
                      {/* Status Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </div>
                    </div>
                    
                    {/* Player Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-white text-lg mb-2">{player.name}</h3>
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${catConfig.bgColor} ${catConfig.color}`}>
                          {catConfig.label}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${posConfig.bgColor} ${posConfig.color}`}>
                          {posConfig.label}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {player.strongFoot} Foot
                        </span>
                      </div>
                      
                      {/* Pitch Message */}
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">{player.pitchMessage}</p>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-purple-300 text-sm">Base: </span>
                          <span className="text-white font-bold">৳{player.basePrice.toLocaleString()}</span>
                        </div>
                        {player.soldPrice && (
                          <div>
                            <span className="text-green-300 text-sm">Sold: </span>
                            <span className="text-green-400 font-bold">৳{player.soldPrice.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Sold To */}
                      {soldToTeam && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="text-purple-300 text-sm">Sold to: </span>
                          <span className="text-white font-medium">{soldToTeam.logoEmoji} {soldToTeam.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'teams' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team: Team) => {
              const roster = getTeamRoster(team.id);
              const budget = getTeamBudget(team.id);
              const constraints = getTeamConstraints(team.id);
              
              return (
                <div 
                  key={team.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                  style={{ borderLeft: `4px solid ${team.colorPrimary}` }}
                >
                  {/* Team Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{team.logoEmoji}</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{team.name}</h3>
                      <p className="text-purple-200 text-sm">Owner: {team.ownerName}</p>
                    </div>
                  </div>
                  
                  {/* Budget */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-200">Budget</span>
                      <span className="text-white">৳{budget.remaining.toLocaleString()} / ৳{budget.total.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(budget.remaining / budget.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Constraints */}
                  <div className="flex gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs ${constraints.canAddGK ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      GK: {constraints.gkCount}/1
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${constraints.canAddAlumni ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      Alumni: {constraints.alumniCount}/1
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${constraints.canAddPlayer ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      Squad: {constraints.playerCount}/8
                    </span>
                  </div>
                  
                  {/* Roster */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium text-sm">Roster</h4>
                    {roster.length === 0 ? (
                      <p className="text-purple-300 text-sm italic">No players yet</p>
                    ) : (
                      roster.map((player: Player) => (
                        <div key={player.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${POSITION_CONFIG[player.position].bgColor} ${POSITION_CONFIG[player.position].color}`}>
                              {player.position}
                            </span>
                            <span className="text-white text-sm">{player.name}</span>
                            {player.category === 'ALUMNI' && (
                              <span className="text-purple-400 text-xs">⭐</span>
                            )}
                          </div>
                          <span className="text-green-400 text-sm font-medium">
                            {player.soldPrice ? `৳${player.soldPrice.toLocaleString()}` : 'Free'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
