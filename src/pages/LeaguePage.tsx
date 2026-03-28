/**
 * LeaguePage - League standings, schedule and results
 */

import { useMemo } from 'react';
import { Trophy, Calendar, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import type { LeagueMatch, TeamId, TeamStanding } from '../types';

export default function LeaguePage() {
  const { matches, finalMatch, getTeamById } = useApp();

  // Calculate standings
  const standings = useMemo((): TeamStanding[] => {
    const standingsMap: Record<TeamId, TeamStanding> = {
      rabies: { teamId: 'rabies', position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] },
      meow: { teamId: 'meow', position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] },
      nazi: { teamId: 'nazi', position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] },
      goaldiggers: { teamId: 'goaldiggers', position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] },
      crazy: { teamId: 'crazy', position: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: [] },
    };

    matches.filter((m: LeagueMatch) => m.status === 'COMPLETED').forEach((match: LeagueMatch) => {
      if (match.homeGoals === null || match.awayGoals === null) return;
      
      const home = standingsMap[match.homeTeamId];
      const away = standingsMap[match.awayTeamId];
      
      home.played++;
      away.played++;
      home.goalsFor += match.homeGoals;
      home.goalsAgainst += match.awayGoals;
      away.goalsFor += match.awayGoals;
      away.goalsAgainst += match.homeGoals;
      
      if (match.homeGoals > match.awayGoals) {
        home.won++;
        home.points += 3;
        home.form.push('W');
        away.lost++;
        away.form.push('L');
      } else if (match.homeGoals < match.awayGoals) {
        away.won++;
        away.points += 3;
        away.form.push('W');
        home.lost++;
        home.form.push('L');
      } else {
        home.drawn++;
        away.drawn++;
        home.points += 1;
        away.points += 1;
        home.form.push('D');
        away.form.push('D');
      }
    });

    // Calculate GD and sort
    const sorted = Object.values(standingsMap)
      .map(s => ({ ...s, goalDifference: s.goalsFor - s.goalsAgainst }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    return sorted.map((s, i) => ({ ...s, position: i + 1 }));
  }, [matches]);

  // Group matches by round
  const matchesByRound = useMemo(() => {
    const rounds: Record<number, LeagueMatch[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    matches.forEach((match: LeagueMatch) => {
      rounds[match.roundNumber].push(match);
    });
    return rounds;
  }, [matches]);

  const completedMatches = matches.filter((m: LeagueMatch) => m.status === 'COMPLETED').length;
  const allMatchesComplete = completedMatches === 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-10 h-10 text-yellow-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">League</h1>
            <p className="text-purple-200">{completedMatches}/10 matches played</p>
          </div>
        </div>

        {/* Standings Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 overflow-x-auto">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-6 h-6" />
            Standings
          </h2>
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-white/20 text-left">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Team</th>
                <th className="py-2 px-2 text-center">P</th>
                <th className="py-2 px-2 text-center">W</th>
                <th className="py-2 px-2 text-center">D</th>
                <th className="py-2 px-2 text-center">L</th>
                <th className="py-2 px-2 text-center hidden sm:table-cell">GF</th>
                <th className="py-2 px-2 text-center hidden sm:table-cell">GA</th>
                <th className="py-2 px-2 text-center">GD</th>
                <th className="py-2 px-2 text-center">PTS</th>
                <th className="py-2 px-2 text-center hidden md:table-cell">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing: TeamStanding) => {
                const team = getTeamById(standing.teamId);
                if (!team) return null;
                const isQualified = standing.position <= 2;
                
                return (
                  <tr 
                    key={standing.teamId}
                    className={`border-b border-white/10 ${isQualified ? 'bg-green-500/10' : ''}`}
                  >
                    <td className="py-3 px-2 font-bold">{standing.position}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{team.logoEmoji}</span>
                        <span className="font-medium">{team.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">{standing.played}</td>
                    <td className="py-3 px-2 text-center text-green-400">{standing.won}</td>
                    <td className="py-3 px-2 text-center text-yellow-400">{standing.drawn}</td>
                    <td className="py-3 px-2 text-center text-red-400">{standing.lost}</td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">{standing.goalsFor}</td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">{standing.goalsAgainst}</td>
                    <td className="py-3 px-2 text-center font-medium">
                      {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-lg">{standing.points}</td>
                    <td className="py-3 px-2 text-center hidden md:table-cell">
                      <div className="flex gap-1 justify-center">
                        {standing.form.slice(-5).map((result: 'W' | 'D' | 'L', i: number) => (
                          <span 
                            key={i}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              result === 'W' ? 'bg-green-500' : 
                              result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 text-sm text-purple-300">
            <span className="inline-block w-3 h-3 bg-green-500/30 rounded mr-2"></span>
            Top 2 qualify for Final
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Schedule & Results
          </h2>
          
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(round => (
              <div key={round}>
                <h3 className="text-lg font-semibold text-purple-200 mb-3">Round {round}</h3>
                <div className="space-y-2">
                  {matchesByRound[round].map((match: LeagueMatch) => {
                    const homeTeam = getTeamById(match.homeTeamId);
                    const awayTeam = getTeamById(match.awayTeamId);
                    if (!homeTeam || !awayTeam) return null;
                    
                    return (
                      <div 
                        key={match.id}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xl">{homeTeam.logoEmoji}</span>
                          <span className="text-white font-medium">{homeTeam.shortName}</span>
                        </div>
                        
                        <div className="px-4 text-center">
                          {match.status === 'COMPLETED' ? (
                            <span className="text-xl font-bold text-white">
                              {match.homeGoals} - {match.awayGoals}
                            </span>
                          ) : (
                            <span className="text-purple-300">vs</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-white font-medium">{awayTeam.shortName}</span>
                          <span className="text-xl">{awayTeam.logoEmoji}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Match */}
        {allMatchesComplete && (
          <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 justify-center">
              🏆 THE FINAL
            </h2>
            
            {standings.length >= 2 && (
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <span className="text-4xl">{getTeamById(standings[0].teamId)?.logoEmoji}</span>
                  <p className="text-white font-bold mt-2">{getTeamById(standings[0].teamId)?.name}</p>
                  <p className="text-yellow-400 text-sm">#1 in League</p>
                </div>
                
                <div className="text-center">
                  {finalMatch && finalMatch.status === 'COMPLETED' ? (
                    <div className="text-3xl font-bold text-white">
                      {finalMatch.scoreA} - {finalMatch.scoreB}
                    </div>
                  ) : (
                    <span className="text-2xl text-purple-200">VS</span>
                  )}
                </div>
                
                <div className="text-center">
                  <span className="text-4xl">{getTeamById(standings[1].teamId)?.logoEmoji}</span>
                  <p className="text-white font-bold mt-2">{getTeamById(standings[1].teamId)?.name}</p>
                  <p className="text-yellow-400 text-sm">#2 in League</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
