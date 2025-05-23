"use client";

import { useRouter, useParams } from 'next/navigation'
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { useAuth } from "@/context/AuthContext"
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';
import { parse } from 'path';



const CodenamesLobby = () => {
  const params = useParams();
  const rawLobbyCode = params.lobby_code;
  // Check if rawLobbyCode exists before processing it
  const arrayLobbyCode = rawLobbyCode ? (Array.isArray(rawLobbyCode) ? rawLobbyCode[0] : rawLobbyCode) : "";
  const lobbyCode = arrayLobbyCode ? parseInt(arrayLobbyCode, 10) : 0; 
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  const userName = user?.user_metadata.username;
  const userProfile = user?.user_metadata.avatar_url;
  // Function to fetch players in the lobby
  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('codenames_roles')
        .select('*')
        .eq('lobby_code', parseInt(lobbyCode));
        
      if (error) {
        console.error("Error fetching players:", error);
        return;
      }
      
      setPlayers(data || []);
      
      // Check if current user has already selected a role
      const currentUserRole = data?.find(player => player.user_id === userId);
      if (currentUserRole) {
        setUserRole({
          role: currentUserRole.role,
          team: currentUserRole.team
        });
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };
  
  useEffect(() => {
    if (lobbyCode) {
      fetchPlayers();
      
      // Set up real-time subscription for player updates
      const channel = supabase
        .channel('codenames_roles_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'codenames_roles',
            filter: `lobby_code=eq.${parseInt(lobbyCode)}`
          }, 
          (payload) => {
            console.log('Change received!', payload);
            fetchPlayers();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [lobbyCode, userId]);

  // Function to handle role selection
  const handleRoleSelection = async (role, team) => {
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    // Log the data we're about to send for debugging
    const roleData = {
      user_id: userId,
      role: role,
      team: team,
      lobby_code: lobbyCode ? parseInt(lobbyCode) : null
    };
    
    console.log("Sending data to Supabase:", roleData);
    
    setLoading(true);
    try {
      // First, check if this user already has a role in this lobby
      const { data: existingRole, error: fetchError } = await supabase
        .from('codenames_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('lobby_code', parseInt(lobbyCode));
      
      if (fetchError) {
        console.error("Error checking existing role:", fetchError.message);
        alert(`Failed to join: ${fetchError.message}`);
        setLoading(false);
        return;
      }
      
      let result;
      
      // Update or insert based on whether a record exists
      if (existingRole && existingRole.length > 0) {
        // Update existing role
        result = await supabase
          .from('codenames_roles')
          .update({
            role: role,
            team: team
          })
          .eq('user_id', userId)
          .eq('lobby_code', parseInt(lobbyCode));
      } else {
        // Insert new role
        result = await supabase
          .from('codenames_roles')
          .insert([roleData]);
      }
      
      if (result.error) {
        console.error("Error assigning role:", result.error.message);
        alert(`Failed to join: ${result.error.message}`);
        setLoading(false);
        return;
      }

      console.log("Supabase response:", result.data);
      console.log(`Successfully joined as ${role} for team ${team}`);
      setLoading(false);
      
      // Refresh players instead of redirecting
      fetchPlayers();
      
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

    async function generateAndUploadCards() {
      const filePath = "/word_bank/codenames.csv"; // Path to your CSV file
      try {
        // Fetch the CSV file
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error("Failed to fetch the CSV file");
        }
        const csvText = await response.text();
  
      // Parse the CSV content
      const words = Papa.parse<string[]>(csvText, {
        header: false, // Adjust based on your CSV structure
        skipEmptyLines: true,
      }).data.flat(); // Flatten the array if necessary

      if (words.length < 25) {
        throw new Error('Not enough words in the word bank');
      }
  
      // Step 3: Shuffle and select 25 words
      const selectedWords = shuffleArray(words).slice(0, 25);
  
      // Step 4: Assign colors
      const colors = [
        ...Array(8).fill('red'),
        ...Array(8).fill('blue'),
        ...Array(8).fill('yellow'),
        'black'
      ];
      const shuffledColors = shuffleArray(colors);
  
      // Step 5: Create word-color mapping
      const wordColorMapping = selectedWords.reduce((acc: Record<string, string>, word, index) => {
        acc[word] = shuffledColors[index];
        return acc;
      }, {});
  
      // Step 6: Insert into Supabase
      const { error } = await supabase
        .from('codenames_games') // Replace with your table
        .upsert([{
          lobby_code: lobbyCode,
          words: wordColorMapping 
          }]); // Assuming 'words' column is JSON type
  
      if (error) throw error;
  
      console.log('Inserted successfully!', wordColorMapping);
    } catch (err) {
      console.error('Error:', err);
    }
  }
  
  // Utility function: shuffle array
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  // Function to start the game and redirect all players
  const startGame = () => {
    generateAndUploadCards();
    router.push(`/codenames/playgame/${lobbyCode}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-red-400">
      {/* Header */}
      <div className="flex justify-between p-4 text-white font-bold">
        <div className="flex items-center space-x-2">
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">Players: {players.length}</span>
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-center">Set up a game</h1>
        <div className="flex items-center space-x-2">
          <Button className="bg-yellow-400 text-black px-3 py-1 rounded-lg">Rules</Button>
          <span className="flex items-center bg-gray-200 text-black px-3 py-1 rounded-lg">
            {userName || "User"} <User className="ml-4" size={10} />
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-grow justify-center space-x-6 px-6 py-4">
        {/* Left Player Panel (Red Team) */}
        <Card className="w-64 p-4 bg-red-700 text-white rounded-lg">
          <h3 className="text-lg font-bold">Operative(s)</h3>
          <div className="mt-2 mb-2">
            {players
              .filter(player => player.team === 'red' && player.role === 'operative')
              .map(player => (
                <div key={player.user_id} className="text-sm">{player.user_id === userId ? 'You' : player.user_id}</div>
              ))}
            {players.filter(player => player.team === 'red' && player.role === 'operative').length === 0 && (
              <p className="text-sm">-</p>
            )}
          </div>
          <Button
            className={`w-full ${userRole?.team === 'red' && userRole?.role === 'operative' 
              ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold mt-2`}
            onClick={() => handleRoleSelection("operative", "red")}
            disabled={loading}
          >
            {loading ? "Joining..." : userRole?.team === 'red' && userRole?.role === 'operative' 
              ? "Selected" : "Join as Operative"}
          </Button>

          <h3 className="text-lg font-bold mt-4">Spymaster(s)</h3>
          <div className="mt-2 mb-2">
            {players
              .filter(player => player.team === 'red' && player.role === 'spymaster')
              .map(player => (
                <div key={player.user_id} className="text-sm">{player.user_id === userId ? 'You' : player.user_id}</div>
              ))}
            {players.filter(player => player.team === 'red' && player.role === 'spymaster').length === 0 && (
              <p className="text-sm">-</p>
            )}
          </div>
          <Button
            className={`w-full ${userRole?.team === 'red' && userRole?.role === 'spymaster' 
              ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold mt-2`}
            onClick={() => handleRoleSelection("spymaster", "red")}
            disabled={loading}
          >
            {loading ? "Joining..." : userRole?.team === 'red' && userRole?.role === 'spymaster' 
              ? "Selected" : "Join as Spymaster"}
          </Button>
        </Card>

        {/* Main Game Card */}
        <Card className="w-[500px] p-6 rounded-lg bg-white shadow-lg flex flex-col">
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
          <p className="mt-2 text-sm text-gray-700">
            Lobby Code: <span className="font-bold">{lobbyCode}</span>
          </p>
          
          <div className="flex-grow"></div>
          
          {/* Start Game Button */}
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 mt-6 text-lg"
            onClick={startGame}
          >
            Start Game
          </Button>
        </Card>

        {/* Right Player Panel (Blue Team) */}
        <Card className="w-64 p-4 bg-blue-700 text-white rounded-lg">
          <h3 className="text-lg font-bold">Operative(s)</h3>
          <div className="mt-2 mb-2">
            {players
              .filter(player => player.team === 'blue' && player.role === 'operative')
              .map(player => (
                <div key={player.user_id} className="text-sm">{player.user_id === userId ? 'You' : player.user_id}</div>
              ))}
            {players.filter(player => player.team === 'blue' && player.role === 'operative').length === 0 && (
              <p className="text-sm">-</p>
            )}
          </div>
          <Button
            className={`w-full ${userRole?.team === 'blue' && userRole?.role === 'operative' 
              ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold mt-2`}
            onClick={() => handleRoleSelection("operative", "blue")}
            disabled={loading}
          >
            {loading ? "Joining..." : userRole?.team === 'blue' && userRole?.role === 'operative' 
              ? "Selected" : "Join as Operative"}
          </Button>

          <h3 className="text-lg font-bold mt-4">Spymaster(s)</h3>
          <div className="mt-2 mb-2">
            {players
              .filter(player => player.team === 'blue' && player.role === 'spymaster')
              .map(player => (
                <div key={player.user_id} className="text-sm">{player.user_id === userId ? 'You' : player.user_id}</div>
              ))}
            {players.filter(player => player.team === 'blue' && player.role === 'spymaster').length === 0 && (
              <p className="text-sm">-</p>
            )}
          </div>
          <Button
            className={`w-full ${userRole?.team === 'blue' && userRole?.role === 'spymaster' 
              ? 'bg-green-500' : 'bg-yellow-400'} text-black font-bold mt-2`}
            onClick={() => handleRoleSelection("spymaster", "blue")}
            disabled={loading}
          >
            {loading ? "Joining..." : userRole?.team === 'blue' && userRole?.role === 'spymaster' 
              ? "Selected" : "Join as Spymaster"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default CodenamesLobby;