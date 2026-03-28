import { useState, useCallback, useEffect, useRef } from "react";
import type { Player, PlayerPosition } from "@/types";
import { POSITION_CONFIG } from "@/constants"; // Removed unused imports
import { Shuffle } from "lucide-react";

interface RandomSpinnerProps {
  players: Player[];
  position: PlayerPosition;
  onSelect: (player: Player) => void;
  disabled?: boolean;
}

export function RandomSpinner({
  players,
  position,
  onSelect,
  disabled = false,
}: RandomSpinnerProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Use a ref to track the interval so we can clear it reliably
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionConfig = POSITION_CONFIG[position];

  // Memoize available players
  const availablePlayers = players.filter(
    (p) =>
      p.position === position &&
      (p.status === "AVAILABLE" || p.status === "UNSOLD"),
  );

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const spin = useCallback(() => {
    if (availablePlayers.length === 0 || isSpinning || disabled) return;

    setIsSpinning(true);
    setSelectedPlayer(null);

    let spins = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 10);
    const spinSpeed = 80;

    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);

    spinIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % availablePlayers.length);
      spins++;

      if (spins >= totalSpins) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        // Final selection
        const finalIndex = (currentIndex + 1) % availablePlayers.length;
        const winner = availablePlayers[finalIndex];
        setSelectedPlayer(winner);
        setIsSpinning(false);
      }
    }, spinSpeed);
  }, [availablePlayers, isSpinning, disabled, currentIndex]);

  const handleConfirm = () => {
    if (selectedPlayer) {
      onSelect(selectedPlayer);
      setSelectedPlayer(null);
    }
  };

  if (availablePlayers.length === 0) {
    return (
      <div className="card-glass p-4 border-t-4 opacity-50 border-gray-600">
        <div className="text-center text-xs text-gray-400">
          No {positionConfig.label}s
        </div>
      </div>
    );
  }

  const currentPlayer = availablePlayers[currentIndex];

  return (
    <div
      className={`card-glass p-4 border-t-4 transition-all ${isSpinning ? "ring-2 ring-yellow-400 scale-105" : ""}`}
      style={{ borderTopColor: isSpinning ? "#FBBF24" : undefined }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className={`font-bold ${positionConfig.color}`}>
          {positionConfig.label}
        </h3>
        <span className="text-xs bg-black/30 px-2 py-0.5 rounded text-white">
          {availablePlayers.length} Left
        </span>
      </div>

      <div className="h-20 mb-3 flex items-center justify-center bg-black/20 rounded-lg relative overflow-hidden">
        {currentPlayer ? (
          <div className="text-center w-full px-1">
            <div
              className={`font-bold text-white truncate ${isSpinning ? "blur-[1px]" : ""}`}
            >
              {currentPlayer.name}
            </div>
            <div className="text-xs text-gray-400">
              ৳{(currentPlayer.basePrice / 1000).toFixed(0)}k •{" "}
              {currentPlayer.category}
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Ready</span>
        )}
      </div>

      <div className="flex gap-2">
        {!selectedPlayer ? (
          <button
            onClick={spin}
            disabled={isSpinning || disabled}
            className="btn btn-sm btn-primary w-full"
          >
            <Shuffle size={14} className={isSpinning ? "animate-spin" : ""} />
            {isSpinning ? "..." : "Spin"}
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            className="btn btn-sm btn-success w-full text-white animate-pulse"
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
}

export function AllSpinners({
  players,
  onSelect,
  disabled,
}: {
  players: Player[];
  onSelect: (player: Player) => void;
  disabled?: boolean;
}) {
  const positions: PlayerPosition[] = ["GK", "DEF", "MID", "FWD"];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {positions.map((position) => (
        <RandomSpinner
          key={position}
          players={players}
          position={position}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
