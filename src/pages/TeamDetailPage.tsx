/**
 * TeamDetailPage - Individual team details
 */

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Wallet } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { POSITION_CONFIG, CATEGORY_CONFIG } from '../types';
import { getPlayerImageUrl } from '../constants';
import type { Player, TeamId } from '../types';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { getTeamById, getTeamRoster, getTeamBudget, getTeamConstraints } = useApp();

  const team = getTeamById(teamId as TeamId);
  const roster = team ? getTeamRoster(team.id) : [];
  const budget = team ? getTeamBudget(team.id) : { total: 150000, spent: 0, remaining: 150000 };
  const constraints = team ? getTeamConstraints(team.id) : { playerCount: 0, gkCount: 0, alumniCount: 0, canAddPlayer: true, canAddGK: true, canAddAlumni: true };

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">❓</div>
            <h2 className="text-2xl font-bold text-white mb-2">Team Not Found</h2>
            <Link to="/" className="text-purple-300 hover:text-white">Go back home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Link */}
        <Link to="/" className="text-purple-300 hover:text-white flex items-center gap-2 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {/* Team Header */}
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6"
          style={{ borderLeft: `6px solid ${team.colorPrimary}` }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{team.logoEmoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">{team.name}</h1>
              <p className="text-purple-200 text-lg">Owner: {team.ownerName}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-purple-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{constraints.playerCount}/8</div>
              <div className="text-purple-200 text-sm">Squad Size</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Wallet className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">৳{budget.remaining.toLocaleString()}</div>
              <div className="text-purple-200 text-sm">Remaining Budget</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{constraints.gkCount}/1</div>
              <div className="text-purple-200 text-sm">Goalkeeper</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{constraints.alumniCount}/1</div>
              <div className="text-purple-200 text-sm">Alumni</div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-purple-200">Budget Used</span>
              <span className="text-white">৳{budget.spent.toLocaleString()} / ৳{budget.total.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                style={{ width: `${((budget.total - budget.remaining) / budget.total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Roster */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Squad ({roster.length} players)
        </h2>

        {roster.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">👤</div>
            <p className="text-purple-200">No players in the squad yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {roster.map((player: Player) => (
              <div key={player.id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden flex">
                {/* Player Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600/50 to-blue-600/50 flex-shrink-0">
                  <img 
                    src={getPlayerImageUrl(player.photoUrl, player.name)} 
                    alt={player.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`;
                    }}
                  />
                </div>
                
                {/* Player Info */}
                <div className="p-3 flex-1">
                  <h3 className="font-bold text-white">{player.name}</h3>
                  
                  <div className="flex gap-2 mt-1 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${POSITION_CONFIG[player.position].bgColor} ${POSITION_CONFIG[player.position].color}`}>
                      {player.position}
                    </span>
                    {player.category === 'ALUMNI' && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_CONFIG[player.category].bgColor} ${CATEGORY_CONFIG[player.category].color}`}>
                        Alumni
                      </span>
                    )}
                  </div>
                  
                  <div className="text-green-400 font-bold">
                    {player.soldPrice ? `৳${player.soldPrice.toLocaleString()}` : 'Free'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
