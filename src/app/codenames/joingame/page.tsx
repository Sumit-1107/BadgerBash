"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

const CodenamesLobby = () => {
  const [players, setPlayers] = useState(1);
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-red-400">
      {/* Header */}
      <div className="flex justify-between p-4 text-white font-bold">
        <div className="flex items-center space-x-2">
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">Players: {players}</span>
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-center">Set up a game</h1>
        <div className="flex items-center space-x-2">
          <Button className="bg-yellow-400 text-black px-3 py-1 rounded-lg">Rules</Button>
          <span className="flex items-center bg-gray-200 text-black px-3 py-1 rounded-lg">
            User <User className="ml-4" size={10} />
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-grow justify-center space-x-6 px-6 py-4">
        {/* Left Player Panel */}
        <Card className="w-64 p-4 bg-red-700 text-white rounded-lg">
          <h3 className="text-lg font-bold">Operative(s)</h3>
          <p>-</p>
          <Button
            className="w-full bg-yellow-400 text-black font-bold mt-2"
            onClick={() => router.push("/codenames/playgame?role=operative")}
          >
            Join as Operative
          </Button>

          <h3 className="text-lg font-bold mt-4">Spymaster(s)</h3>
          <p>-</p>
          <Button
            className="w-full bg-yellow-400 text-black font-bold mt-2"
            onClick={() => router.push("/codenames/playgame?role=spymaster")}
          >
            Join as Spymaster
          </Button>
        </Card>

        {/* Main Game Card */}
        <Card className="w-[500px] p-6 rounded-lg bg-white shadow-lg">
          {/* Game Instructions */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Codenames is a game for 4+ players.</h2>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Divide evenly into two teams – <span className="text-red-600 font-bold">red</span> and
            <span className="text-blue-600 font-bold"> blue</span>. Choose one player per team to
            join as a <span className="font-bold">Spymaster</span>. Other players join as{" "}
            <span className="font-bold">Operatives</span>.
          </p>
          <p className="mt-2 text-sm text-gray-700">
            The team who first guesses all their words wins.
          </p>
        </Card>

        {/* Right Player Panel */}
        <Card className="w-64 p-4 bg-blue-700 text-white rounded-lg">
          <h3 className="text-lg font-bold">Operative(s)</h3>
          <p>-</p>
          <Button
            className="w-full bg-yellow-400 text-black font-bold mt-2"
            onClick={() => router.push("/codenames/playgame?role=operative")}
          >
            Join as Operative
          </Button>

          <h3 className="text-lg font-bold mt-4">Spymaster(s)</h3>
          <p>-</p>
          <Button
            className="w-full bg-yellow-400 text-black font-bold mt-2"
            onClick={() => router.push("/codenames/playgame?role=spymaster")}
          >
            Join as Spymaster
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default CodenamesLobby;
