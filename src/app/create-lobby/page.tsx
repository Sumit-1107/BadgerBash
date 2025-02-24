"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PlayerSlotProps {
  number: number;
}

const LobbyCreation = () => {
  const [lobbyName, setLobbyName] = useState('New Lobby');
  const [lobbyCode, setLobbyCode] = useState('');

  useEffect(() => {
    const getLobbyCodes = async () => {
      const { data } = await supabase
        .from('lobbies')
        .select('lobby_code');
      return data?.map(lobby => lobby.lobby_code) || [];
    };

    const generateUniqueCode = async () => {
      const existingCodes = await getLobbyCodes();
      let code;
      do {
        const firstPart = Math.floor(100 + Math.random() * 900).toString();
        const secondPart = Math.floor(100 + Math.random() * 900).toString();
        code = firstPart + secondPart;
      } while (existingCodes.includes(code));

      setLobbyCode(code);
    };

    generateUniqueCode();
  }, []);

  useEffect(() => {
    const generateLobby = async () => {
      const { error } = await supabase
        .from('lobbies')
        .insert([
          {
            name: lobbyName,
            player_count: 1,
            is_public: false,
            lobby_code: parseInt(lobbyCode)
          }
        ]);

      if (error) console.error('Error creating lobby:', error);
    };

    if (lobbyCode) generateLobby();
  }, [lobbyCode]);

  const PlayerSlot: React.FC<PlayerSlotProps> = ({ number }) => (
    <div className="flex items-center justify-center w-full h-24 bg-secondary rounded-lg border-2 border-border">
      <p className="text-muted-foreground">Player {number}</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-red-400">
      <Button className="absolute mt-5 ml-5" variant="outline" size="icon" asChild>
        <Link href="/">
          <ChevronLeft />
        </Link>
      </Button>

      <div className="flex space-x-6">
        {/* Left Side - Lobby Card */}
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lobbyName" className="text-sm font-medium">
                Lobby Name
              </label>
              <Input
                id="lobbyName"
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                onBlur={async () => {
                  const { error } = await supabase
                    .from('lobbies')
                    .update({ name: lobbyName })
                    .eq('lobby_code', lobbyCode);
                  if (error) console.error('Error updating lobby name:', error);
                }}
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lobby Code</label>
              <div className="bg-secondary p-3 rounded-lg">
                <p className="text-center font-mono text-2xl tracking-wider">
                  {lobbyCode}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Players</h3>
              <div className="grid grid-cols-2 gap-4">
                <PlayerSlot number={1} />
                <PlayerSlot number={2} />
                <PlayerSlot number={3} />
                <PlayerSlot number={4} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Game Selection Buttons (Now slightly separated) */}
        <div className="flex flex-col space-y-4 ml-12">
        <Link href="/codenames/joingame">
        <Button className = "w-40 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg">
          Codenames
          </Button>
          </Link>
          <Button className="w-40 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg">
            Uno
          </Button>
          <Button className="w-40 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg">
            Monopoly
          </Button>
        </div>
      </div>
    </div>
  );
};







export default LobbyCreation;
