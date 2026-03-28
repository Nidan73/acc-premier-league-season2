/**
 * HomePage - Main landing page for ACC Futsal League
 */

import { Link } from 'react-router-dom';
import { Gavel, Trophy, Monitor, Users, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import type { Player, Team } from '../types';

export default function HomePage() {
  const { players, teams, auctionState, matches, getTeamRoster, getTeamBudget } = useApp();

  // Stats
  const soldPlayers = players.filter((p: Player) => p.status === 'SOLD').length;
  const availablePlayers = players.filter((p: Player) => p.status === 'AVAILABLE' || p.status === 'UNSOLD').length;
  const completedMatches = matches.filter(m => m.status === 'COMPLETED').length;
  const totalMatches = matches.length;

  // Get phase display
  const getPhaseDisplay = () => {
    switch (auctionState.phase) {
      case 'NOT_STARTED': return { text: 'Not Started', color: 'bg-gray-500' };
      case 'IDLE': return { text: 'Auction Active', color: 'bg-green-500' };
      case 'BIDDING': return { text: 'Live Bidding!', color: 'bg-red-500 animate-pulse' };
      case 'PAUSED': return { text: 'Paused', color: 'bg-yellow-500' };
      case 'COMPLETED': return { text: 'Completed', color: 'bg-blue-500' };
      default: return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const phase = getPhaseDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            ⚽ ACC Futsal League
          </h1>
          <p className="text-xl text-purple-200 mb-6">Season 2 - Player Auction & Tournament</p>
          
          {/* Auction Status */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
            <span className={`w-3 h-3 rounded-full ${phase.color}`}></span>
            <span className="text-white font-medium">Auction: {phase.text}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-white">{players.length}</div>
            <div className="text-purple-200 text-sm">Total Players</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{soldPlayers}</div>
            <div className="text-purple-200 text-sm">Sold</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">{availablePlayers}</div>
            <div className="text-purple-200 text-sm">Available</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{completedMatches}/{totalMatches}</div>
            <div className="text-purple-200 text-sm">Matches Played</div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/live" className="group bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 hover:scale-105 transition-transform">
            <Monitor className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Live Auction</h3>
            <p className="text-red-100 text-sm">Watch the auction live on projector display</p>
          </Link>
          
          <Link to="/auction" className="group bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 hover:scale-105 transition-transform">
            <Gavel className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Player Pool</h3>
            <p className="text-purple-100 text-sm">View all players and team rosters</p>
          </Link>
          
          <Link to="/league" className="group bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 hover:scale-105 transition-transform">
            <Trophy className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">League</h3>
            <p className="text-blue-100 text-sm">Standings, fixtures, and results</p>
          </Link>
          
          <Link to="/admin" className="group bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-6 hover:scale-105 transition-transform">
            <Users className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Admin Panel</h3>
            <p className="text-gray-100 text-sm">Control auction and enter scores</p>
          </Link>
        </div>

        {/* Teams Overview */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Team Overview
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team: Team) => {
            const roster = getTeamRoster(team.id);
            const budget = getTeamBudget(team.id);
            const gkCount = roster.filter(p => p.position === 'GK').length;
            const alumniCount = roster.filter(p => p.category === 'ALUMNI').length;
            
            return (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors"
                style={{ borderLeft: `4px solid ${team.colorPrimary}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{team.logoEmoji}</span>
                  <div>
                    <h3 className="font-bold text-white">{team.name}</h3>
                    <p className="text-sm text-purple-200">Owner: {team.ownerName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="font-bold text-white">{roster.length}/8</div>
                    <div className="text-purple-300 text-xs">Squad</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="font-bold text-green-400">৳{(budget.remaining / 1000).toFixed(0)}K</div>
                    <div className="text-purple-300 text-xs">Budget</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="font-bold text-white">{gkCount}/1 GK</div>
                    <div className="text-purple-300 text-xs">{alumniCount}/1 AL</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
