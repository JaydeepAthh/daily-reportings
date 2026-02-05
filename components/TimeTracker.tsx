import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, StopCircle, Clock } from "lucide-react";
import { formatTimeFromDecimal } from "@/lib/time-utils";

interface TimeTrackerProps {
  onTimeLogged: (time: string) => void;
}

export function TimeTracker({ onTimeLogged }: TimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [taskDescription, setTaskDescription] = useState("");

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (elapsedSeconds > 0) {
      const hours = elapsedSeconds / 3600;
      const formatted = formatTimeFromDecimal(hours);
      onTimeLogged(formatted);
    }
    setIsRunning(false);
    setElapsedSeconds(0);
    setTaskDescription("");
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setTaskDescription("");
  };

  const formatElapsed = useCallback(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [elapsedSeconds]);

  const getDecimalHours = () => {
    return (elapsedSeconds / 3600).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-mono font-bold tabular-nums">
            {formatElapsed()}
          </div>
          {elapsedSeconds > 0 && (
            <div className="text-sm text-muted-foreground">
              {getDecimalHours()}h
            </div>
          )}
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="What are you working on?"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            disabled={isRunning}
            aria-label="Task description"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="flex-1"
              disabled={!taskDescription.trim() && elapsedSeconds === 0}
              aria-label="Start timer"
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="secondary"
              className="flex-1"
              aria-label="Pause timer"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          <Button
            onClick={handleStop}
            variant="default"
            disabled={elapsedSeconds === 0}
            aria-label="Stop and log time"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Log
          </Button>

          {elapsedSeconds > 0 && !isRunning && (
            <Button
              onClick={handleReset}
              variant="outline"
              size="icon"
              aria-label="Reset timer"
            >
              ✕
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {isRunning
            ? "Timer is running..."
            : elapsedSeconds > 0
            ? "Click Log to add this time to a task"
            : "Start tracking time for your current task"}
        </p>
      </CardContent>
    </Card>
  );
}
