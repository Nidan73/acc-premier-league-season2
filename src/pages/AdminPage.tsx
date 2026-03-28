/**
 * AdminPage - Control panel for auction and league management
 * With comprehensive undo/reset options
 */

import { useState, useMemo } from "react";
import {
  Shield,
  Play,
  Pause,
  Check,
  X,
  RotateCcw,
  Shuffle,
  LogOut,
  StopCircle,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useApp } from "../context/AppContext";
import { POSITION_CONFIG, CATEGORY_CONFIG } from "../types";
import { getPlayerImageUrl } from "../constants";
import type {
  Player,
  Team,
  PlayerPosition,
  PlayerCategory,
  LeagueMatch,
} from "../types";

export default function AdminPage() {
  const {
    isAdmin,
    login,
    logout,
    teams,
    matches,
    auctionState,
    getTeamById,
    getPlayerById,
    getTeamRoster,
    getTeamBudget,
    getTeamConstraints,
    canTeamBidOnPlayer,
    getNextBidAmount,
    getAvailablePlayers,
    getPlayersByPosition,
    getSoldPlayers,
    getUnsoldPlayers,
    startAuction,
    stopAuction,
    startBidding,
    cancelBidding,
    placeBid,
    sellPlayer,
    markUnsold,
    undoLastSale,
    pauseAuction,
    resumeAuction,
    completeAuction,
    reAuctionPlayer,
    removePlayerFromTeam,
    updateMatchScore,
    resetMatchScore,
    resetAuctionData,
    resetLeagueData,
    resetAllData,
    isLoading,
  } = useApp();

  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "auction" | "league" | "teams" | "danger"
  >("auction");
  const [categoryFilter, setCategoryFilter] = useState<PlayerCategory | "ALL">(
    "ALL",
  );
  const [positionFilter, setPositionFilter] = useState<PlayerPosition | "ALL">(
    "ALL",
  );

  // Spinner state
  const [spinningPosition, setSpinningPosition] =
    useState<PlayerPosition | null>(null);
  const [spinResult, setSpinResult] = useState<Player | null>(null);

  // Match score editing
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Reset confirmations
  const [confirmResetAuction, setConfirmResetAuction] = useState(false);
  const [confirmResetLeague, setConfirmResetLeague] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  const handleLogin = () => {
    if (login(passcode)) {
      setPasscodeError("");
    } else {
      setPasscodeError("Incorrect passcode");
    }
  };

  // Random spinner for position
  const spinForPosition = (position: PlayerPosition) => {
    const availablePlayers = getPlayersByPosition(position);
    if (availablePlayers.length === 0) {
      alert(`No available ${POSITION_CONFIG[position].label}s`);
      return;
    }

    setSpinningPosition(position);
    setSpinResult(null);

    // Animate through players
    let count = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
      const randomPlayer =
        availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
      setSpinResult(randomPlayer);
      count++;

      if (count >= maxSpins) {
        clearInterval(interval);
        setSpinningPosition(null);
      }
    }, 100);
  };

  // Get current player being auctioned
  const currentPlayer = auctionState.currentPlayerId
    ? getPlayerById(auctionState.currentPlayerId)
    : null;

  // Get available players for auction
  const availablePlayers = useMemo(() => {
    let filtered = getAvailablePlayers();
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((p: Player) => p.category === categoryFilter);
    }
    if (positionFilter !== "ALL") {
      filtered = filtered.filter((p: Player) => p.position === positionFilter);
    }
    return filtered;
  }, [getAvailablePlayers, categoryFilter, positionFilter]);

  // Get sold and unsold players
  const soldPlayers = useMemo(() => getSoldPlayers(), [getSoldPlayers]);
  const unsoldPlayers = useMemo(() => getUnsoldPlayers(), [getUnsoldPlayers]);

  // Group matches by round
  const matchesByRound = useMemo(() => {
    const rounds: Record<number, LeagueMatch[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };
    matches.forEach((match: LeagueMatch) => {
      rounds[match.roundNumber].push(match);
    });
    return rounds;
  }, [matches]);

  // Handle reset functions
  const handleResetAuction = async () => {
    await resetAuctionData();
    setConfirmResetAuction(false);
  };

  const handleResetLeague = async () => {
    await resetLeagueData();
    setConfirmResetLeague(false);
  };

  const handleResetAll = async () => {
    if (resetConfirmText !== "RESET") return;
    await resetAllData();
    setConfirmResetAll(false);
    setResetConfirmText("");
  };

  // Login Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white">Admin Login</h1>
              <p className="text-purple-200 text-sm mt-2">
                Enter the 6-digit passcode to access admin panel
              </p>
            </div>

            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest mb-4"
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            {passcodeError && (
              <p className="text-red-400 text-sm text-center mb-4">
                {passcodeError}
              </p>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-purple-300 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["auction", "league", "teams", "danger"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeTab === tab
                  ? tab === "danger"
                    ? "bg-red-600 text-white"
                    : "bg-purple-600 text-white"
                  : "bg-white/10 text-purple-200 hover:bg-white/20"
              }`}
            >
              {tab === "danger" ? "⚠️ Reset/Undo" : tab}
            </button>
          ))}
        </div>

        {/* Auction Tab */}
        {activeTab === "auction" && (
          <div className="space-y-6">
            {/* Auction Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-purple-200 text-sm">
                    Auction Status:
                  </span>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                      auctionState.phase === "BIDDING"
                        ? "bg-red-500 text-white"
                        : auctionState.phase === "IDLE"
                          ? "bg-green-500 text-white"
                          : auctionState.phase === "PAUSED"
                            ? "bg-yellow-500 text-black"
                            : auctionState.phase === "COMPLETED"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-500 text-white"
                    }`}
                  >
                    {auctionState.phase}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {auctionState.phase === "NOT_STARTED" && (
                    <button
                      onClick={startAuction}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      <Play className="w-4 h-4" />
                      Start Auction
                    </button>
                  )}
                  {auctionState.phase === "BIDDING" && (
                    <>
                      <button
                        onClick={pauseAuction}
                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                      <button
                        onClick={cancelBidding}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                        Cancel Bidding
                      </button>
                    </>
                  )}
                  {auctionState.phase === "PAUSED" && (
                    <>
                      <button
                        onClick={resumeAuction}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        <Play className="w-4 h-4" />
                        Resume
                      </button>
                      <button
                        onClick={cancelBidding}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                        Cancel Bidding
                      </button>
                    </>
                  )}
                  {(auctionState.phase === "IDLE" ||
                    auctionState.phase === "PAUSED") && (
                    <>
                      <button
                        onClick={completeAuction}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                        Complete Auction
                      </button>
                      <button
                        onClick={stopAuction}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                      >
                        <StopCircle className="w-4 h-4" />
                        Stop & Reset
                      </button>
                    </>
                  )}
                  {auctionState.phase === "IDLE" && (
                    <button
                      onClick={stopAuction}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      <StopCircle className="w-4 h-4" />
                      Stop Auction
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Active Bidding */}
            {auctionState.phase === "BIDDING" && currentPlayer && (
              <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-red-500/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  🔴 Active Bidding
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current Player */}
                  <div className="flex gap-4">
                    <img
                      src={getPlayerImageUrl(
                        currentPlayer.photoUrl,
                        currentPlayer.name,
                      )}
                      alt={currentPlayer.name}
                      className="w-24 h-32 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {currentPlayer.name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${CATEGORY_CONFIG[currentPlayer.category].bgColor} ${CATEGORY_CONFIG[currentPlayer.category].color}`}
                        >
                          {CATEGORY_CONFIG[currentPlayer.category].label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${POSITION_CONFIG[currentPlayer.position].bgColor} ${POSITION_CONFIG[currentPlayer.position].color}`}
                        >
                          {POSITION_CONFIG[currentPlayer.position].label}
                        </span>
                      </div>
                      <div className="mt-2 text-3xl font-bold text-green-400">
                        ৳
                        {(
                          auctionState.currentBid || auctionState.basePrice
                        ).toLocaleString()}
                      </div>
                      {auctionState.leadingTeamId && (
                        <p className="text-purple-200">
                          Leading:{" "}
                          {getTeamById(auctionState.leadingTeamId)?.logoEmoji}{" "}
                          {getTeamById(auctionState.leadingTeamId)?.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bid Buttons */}
                  <div>
                    <p className="text-white mb-2">
                      Next bid:{" "}
                      <span className="font-bold text-green-400">
                        ৳{getNextBidAmount().toLocaleString()}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {teams.map((team: Team) => {
                        const canBid = canTeamBidOnPlayer(
                          team.id,
                          currentPlayer,
                          getNextBidAmount(),
                        );
                        const budget = getTeamBudget(team.id);

                        return (
                          <button
                            key={team.id}
                            onClick={() => placeBid(team.id)}
                            disabled={!canBid.allowed}
                            className={`p-3 rounded-lg text-left transition-colors ${
                              canBid.allowed
                                ? "bg-white/20 hover:bg-white/30"
                                : "bg-white/5 opacity-50 cursor-not-allowed"
                            }`}
                            title={canBid.reason}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{team.logoEmoji}</span>
                              <span className="text-white font-medium">
                                {team.shortName}
                              </span>
                            </div>
                            <div className="text-xs text-purple-300 mt-1">
                              ৳{(budget.remaining / 1000).toFixed(0)}K left
                            </div>
                            {!canBid.allowed && (
                              <div className="text-xs text-red-400 mt-1">
                                {canBid.reason}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6 flex-wrap">
                  <button
                    onClick={markUnsold}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                    Mark Unsold
                  </button>
                  <button
                    onClick={cancelBidding}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Cancel & Return to List
                  </button>
                  <button
                    onClick={sellPlayer}
                    disabled={!auctionState.leadingTeamId}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg"
                  >
                    <Check className="w-5 h-5" />
                    Sell to{" "}
                    {getTeamById(auctionState.leadingTeamId!)?.name || "Team"}
                  </button>
                </div>
              </div>
            )}

            {/* Undo Last Sale */}
            {auctionState.lastSoldLogId && (
              <div className="bg-yellow-600/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/50">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <span className="font-medium">Last sale:</span>{" "}
                    {getPlayerById(auctionState.lastSoldLogId)?.name} →{" "}
                    {
                      getTeamById(
                        getPlayerById(auctionState.lastSoldLogId)
                          ?.soldToTeamId!,
                      )?.name
                    }{" "}
                    for ৳
                    {getPlayerById(
                      auctionState.lastSoldLogId,
                    )?.soldPrice?.toLocaleString()}
                  </div>
                  <button
                    onClick={undoLastSale}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Undo Sale
                  </button>
                </div>
              </div>
            )}

            {/* Position Spinners */}
            {auctionState.phase === "IDLE" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shuffle className="w-5 h-5" />
                  Random Player Picker
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(["GK", "DEF", "MID", "FWD"] as PlayerPosition[]).map(
                    (pos) => (
                      <button
                        key={pos}
                        onClick={() => spinForPosition(pos)}
                        disabled={spinningPosition !== null}
                        className={`p-4 rounded-xl text-center transition-all ${
                          spinningPosition === pos
                            ? "bg-purple-600 animate-pulse"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        <div
                          className={`text-lg font-bold ${POSITION_CONFIG[pos].color}`}
                        >
                          {POSITION_CONFIG[pos].label}
                        </div>
                        <div className="text-purple-300 text-sm">
                          {getPlayersByPosition(pos).length} available
                        </div>
                      </button>
                    ),
                  )}
                </div>

                {/* Spin Result */}
                {spinResult && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl">
                    <div className="flex items-center gap-4">
                      <img
                        src={getPlayerImageUrl(
                          spinResult.photoUrl,
                          spinResult.name,
                        )}
                        alt={spinResult.name}
                        className="w-16 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white">
                          {spinResult.name}
                        </h4>
                        <p className="text-purple-200">
                          {POSITION_CONFIG[spinResult.position].label} • Base: ৳
                          {spinResult.basePrice.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => startBidding(spinResult.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        Start Bidding
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Player Selection */}
            {auctionState.phase === "IDLE" && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4">
                  Select Player to Auction
                </h3>

                {/* Filters */}
                <div className="flex gap-3 mb-4 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(
                        e.target.value as PlayerCategory | "ALL",
                      )
                    }
                    className="bg-white/20 text-white border border-white/20 rounded-lg px-3 py-2"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="MEMBER">Member</option>
                    <option value="ALUMNI">Alumni</option>
                  </select>

                  <select
                    value={positionFilter}
                    onChange={(e) =>
                      setPositionFilter(
                        e.target.value as PlayerPosition | "ALL",
                      )
                    }
                    className="bg-white/20 text-white border border-white/20 rounded-lg px-3 py-2"
                  >
                    <option value="ALL">All Positions</option>
                    <option value="GK">Goalkeeper</option>
                    <option value="DEF">Defender</option>
                    <option value="MID">Midfielder</option>
                    <option value="FWD">Forward</option>
                  </select>

                  <span className="text-purple-200 py-2">
                    {availablePlayers.length} players available
                  </span>
                </div>

                {/* Player List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availablePlayers.length === 0 ? (
                    <p className="text-purple-300">No players available</p>
                  ) : (
                    availablePlayers.map((player: Player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-4 bg-white/5 rounded-lg p-3 hover:bg-white/10 cursor-pointer"
                        onClick={() => startBidding(player.id)}
                      >
                        <img
                          src={getPlayerImageUrl(player.photoUrl, player.name)}
                          alt={player.name}
                          className="w-12 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">
                            {player.name}
                          </h4>
                          <div className="flex gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${CATEGORY_CONFIG[player.category].bgColor} ${CATEGORY_CONFIG[player.category].color}`}
                            >
                              {player.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${POSITION_CONFIG[player.position].bgColor} ${POSITION_CONFIG[player.position].color}`}
                            >
                              {player.position}
                            </span>
                          </div>
                        </div>
                        <div className="text-green-400 font-bold">
                          ৳{player.basePrice.toLocaleString()}
                        </div>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                          Start Bid
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sold Players List */}
            {soldPlayers.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  ✅ Sold Players ({soldPlayers.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {soldPlayers.map((player: Player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getPlayerImageUrl(player.photoUrl, player.name)}
                          alt={player.name}
                          className="w-10 h-12 rounded object-cover"
                        />
                        <div>
                          <span className="text-white font-medium">
                            {player.name}
                          </span>
                          <div className="text-purple-300 text-sm">
                            {getTeamById(player.soldToTeamId!)?.logoEmoji}{" "}
                            {getTeamById(player.soldToTeamId!)?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 font-bold">
                          ৳{player.soldPrice?.toLocaleString()}
                        </span>
                        <button
                          onClick={() =>
                            player.soldToTeamId &&
                            removePlayerFromTeam(player.soldToTeamId, player.id)
                          }
                          className="text-red-400 hover:text-red-300 p-2"
                          title="Remove from team"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unsold Players List */}
            {unsoldPlayers.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  ❌ Unsold Players ({unsoldPlayers.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {unsoldPlayers.map((player: Player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getPlayerImageUrl(player.photoUrl, player.name)}
                          alt={player.name}
                          className="w-10 h-12 rounded object-cover"
                        />
                        <span className="text-white font-medium">
                          {player.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${POSITION_CONFIG[player.position].bgColor} ${POSITION_CONFIG[player.position].color}`}
                        >
                          {player.position}
                        </span>
                      </div>
                      <button
                        onClick={() => reAuctionPlayer(player.id)}
                        className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Re-auction
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* League Tab */}
        {activeTab === "league" && (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((round) => (
              <div
                key={round}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <h3 className="text-lg font-bold text-white mb-4">
                  Round {round}
                </h3>
                <div className="space-y-3">
                  {matchesByRound[round].map((match: LeagueMatch) => {
                    const homeTeam = getTeamById(match.homeTeamId);
                    const awayTeam = getTeamById(match.awayTeamId);
                    if (!homeTeam || !awayTeam) return null;

                    const isEditing = editingMatch === match.id;

                    return (
                      <div key={match.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {homeTeam.logoEmoji}
                            </span>
                            <span className="text-white font-medium">
                              {homeTeam.shortName}
                            </span>
                          </div>

                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={homeScore}
                                onChange={(e) =>
                                  setHomeScore(parseInt(e.target.value) || 0)
                                }
                                className="w-16 bg-white/20 text-white text-center rounded px-2 py-1"
                                min="0"
                              />
                              <span className="text-white">-</span>
                              <input
                                type="number"
                                value={awayScore}
                                onChange={(e) =>
                                  setAwayScore(parseInt(e.target.value) || 0)
                                }
                                className="w-16 bg-white/20 text-white text-center rounded px-2 py-1"
                                min="0"
                              />
                              <button
                                onClick={() => {
                                  updateMatchScore(
                                    match.id,
                                    homeScore,
                                    awayScore,
                                  );
                                  setEditingMatch(null);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMatch(null)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {match.status === "COMPLETED" ? (
                                <span className="text-xl font-bold text-white">
                                  {match.homeGoals} - {match.awayGoals}
                                </span>
                              ) : (
                                <span className="text-purple-300">vs</span>
                              )}
                              <button
                                onClick={() => {
                                  setEditingMatch(match.id);
                                  setHomeScore(match.homeGoals || 0);
                                  setAwayScore(match.awayGoals || 0);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                              >
                                {match.status === "COMPLETED"
                                  ? "Edit"
                                  : "Enter Score"}
                              </button>
                              {match.status === "COMPLETED" && (
                                <button
                                  onClick={() => resetMatchScore(match.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                  title="Reset score"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">
                              {awayTeam.shortName}
                            </span>
                            <span className="text-2xl">
                              {awayTeam.logoEmoji}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === "teams" && (
          <div className="grid md:grid-cols-2 gap-6">
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
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{team.logoEmoji}</span>
                    <div>
                      <h3 className="font-bold text-white">{team.name}</h3>
                      <p className="text-purple-200 text-sm">
                        Owner: {team.ownerName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="font-bold text-white">
                        {constraints.playerCount}/8
                      </div>
                      <div className="text-purple-300 text-xs">Squad</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="font-bold text-green-400">
                        ৳{(budget.remaining / 1000).toFixed(0)}K
                      </div>
                      <div className="text-purple-300 text-xs">Budget</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <div className="font-bold text-white">
                        {constraints.gkCount}/1 GK
                      </div>
                      <div className="text-purple-300 text-xs">
                        {constraints.alumniCount}/1 AL
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {roster.map((player: Player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between bg-white/5 rounded-lg p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${POSITION_CONFIG[player.position].bgColor} ${POSITION_CONFIG[player.position].color}`}
                          >
                            {player.position}
                          </span>
                          <span className="text-white text-sm">
                            {player.name}
                          </span>
                          {player.category === "ALUMNI" && (
                            <span className="text-xs text-yellow-400">
                              (Alumni)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm">
                            {player.soldPrice
                              ? `৳${player.soldPrice.toLocaleString()}`
                              : "Free"}
                          </span>
                          {player.soldPrice !== null &&
                            player.soldPrice > 0 && (
                              <button
                                onClick={() =>
                                  removePlayerFromTeam(team.id, player.id)
                                }
                                className="text-red-400 hover:text-red-300"
                                title="Remove from team"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                    {roster.length === 0 && (
                      <p className="text-purple-300 text-sm text-center py-2">
                        No players yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <div className="bg-red-600/20 backdrop-blur-sm rounded-xl p-6 border border-red-500/50">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
              </div>
              <p className="text-red-200 mb-6">
                These actions are destructive and cannot be easily undone. Use
                with caution.
              </p>

              {/* Reset Auction Data */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">Reset Auction Data</h3>
                    <p className="text-purple-300 text-sm">
                      Clear all auction progress. Players return to available
                      (except team owners).
                    </p>
                  </div>
                  {!confirmResetAuction ? (
                    <button
                      onClick={() => setConfirmResetAuction(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reset Auction
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetAuction}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                      >
                        Confirm Reset
                      </button>
                      <button
                        onClick={() => setConfirmResetAuction(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reset League Data */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">Reset League Data</h3>
                    <p className="text-purple-300 text-sm">
                      Clear all match scores. Standings will be reset.
                    </p>
                  </div>
                  {!confirmResetLeague ? (
                    <button
                      onClick={() => setConfirmResetLeague(true)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reset League
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetLeague}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                      >
                        Confirm Reset
                      </button>
                      <button
                        onClick={() => setConfirmResetLeague(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reset All Data */}
              <div className="bg-red-900/50 rounded-lg p-4 border border-red-500">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      RESET EVERYTHING
                    </h3>
                    <p className="text-red-300 text-sm">
                      This will delete ALL data including auction, rosters,
                      league, and settings. Type "RESET" to confirm.
                    </p>
                  </div>
                  {!confirmResetAll ? (
                    <button
                      onClick={() => setConfirmResetAll(true)}
                      className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reset All
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder='Type "RESET"'
                        value={resetConfirmText}
                        onChange={(e) => setResetConfirmText(e.target.value)}
                        className="bg-white/20 text-white border border-white/20 rounded px-3 py-2 w-32"
                      />
                      <button
                        onClick={handleResetAll}
                        disabled={resetConfirmText !== "RESET"}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setConfirmResetAll(false);
                          setResetConfirmText("");
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Quick Undo Actions
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={stopAuction}
                  disabled={auctionState.phase === "NOT_STARTED"}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 p-4 rounded-lg text-left"
                >
                  <StopCircle className="w-8 h-8 text-red-400" />
                  <div>
                    <div className="text-white font-medium">Stop Auction</div>
                    <div className="text-purple-300 text-sm">
                      Go back to NOT_STARTED
                    </div>
                  </div>
                </button>

                <button
                  onClick={cancelBidding}
                  disabled={
                    auctionState.phase !== "BIDDING" &&
                    auctionState.phase !== "PAUSED"
                  }
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 p-4 rounded-lg text-left"
                >
                  <RotateCcw className="w-8 h-8 text-orange-400" />
                  <div>
                    <div className="text-white font-medium">
                      Cancel Current Bidding
                    </div>
                    <div className="text-purple-300 text-sm">
                      Return player to list
                    </div>
                  </div>
                </button>

                <button
                  onClick={undoLastSale}
                  disabled={!auctionState.lastSoldLogId}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 p-4 rounded-lg text-left"
                >
                  <RotateCcw className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">Undo Last Sale</div>
                    <div className="text-purple-300 text-sm">
                      {auctionState.lastSoldLogId
                        ? `Undo: ${getPlayerById(auctionState.lastSoldLogId)?.name}`
                        : "No recent sale"}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("league")}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-lg text-left"
                >
                  <RefreshCw className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">
                      Edit Match Scores
                    </div>
                    <div className="text-purple-300 text-sm">
                      Go to league tab
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
