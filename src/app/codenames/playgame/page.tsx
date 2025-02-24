"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation"; // <-- 1) Import this hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

//we will need to implement similarity score for the words
const initialWords = [
  { word: "COPPER", color: "blue" },
  { word: "RING", color: "blue" },
  { word: "FAIR", color: "red" },
  { word: "SUPERHERO", color: "red" },
  { word: "SLIP", color: "neutral" },
  { word: "IVORY", color: "neutral" },
  { word: "LITTER", color: "neutral" },
  { word: "WASHER", color: "red" },
  { word: "POINT", color: "red" },
  { word: "COMPOUND", color: "neutral" },
  { word: "OLIVE", color: "neutral" },
  { word: "AIR", color: "black" }, // Assassin word
  { word: "CYCLE", color: "neutral" },
  { word: "VET", color: "blue" },
  { word: "OLYMPUS", color: "blue" },
  { word: "PIRATE", color: "neutral" },
  { word: "MINE", color: "neutral" },
  { word: "PASTA", color: "red" },
  { word: "DRUG", color: "blue" },
  { word: "DUCK", color: "neutral" },
  { word: "ENGLAND", color: "neutral" },
  { word: "OIL", color: "neutral" },
  { word: "LEAD", color: "red" },
  { word: "PUMPKIN", color: "blue" },
  { word: "CHINA", color: "neutral" },
];

const CodenamesGame = () => {
  //access role
  const searchParams = useSearchParams();
  const role = searchParams.get("role"); // either "spymaster" or "operative"

  const [clue, setClue] = useState("");
  const [gameLog, setGameLog] = useState<string[]>([]);

  //function to submit clue
  const submitClue = () => {
    if (clue.trim() !== "") {
      setGameLog((prevLog) => [`Clue: ${clue}`, ...prevLog]);
      setClue("");
    }
  };

  //decide how to color each tile based on role
  const getTileClass = (color: string) => {
    //if user is operative (NOT spymaster), always show gray
    if (role !== "spymaster") {
      return "bg-gray-200 text-black";
    }
    //if user is spymaster, show the true color
    switch (color) {
      case "blue":
        return "bg-blue-500 text-white";
      case "red":
        return "bg-red-500 text-white";
      case "black":
        return "bg-black text-white";
      default: // neutral
        return "bg-gray-200 text-black";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-red-400 p-6">
      {/*header*/}
      <h2 className="text-center text-white text-2xl font-bold mb-4">
        {role === "spymaster"
          ? "Give your operatives a clue."
          : "Guess the words!"}
      </h2>

      <div className="flex justify-center space-x-6">
        {/*left player panel */}
        <Card className="w-56 p-4 bg-red-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">6</h3>
          <p>You</p>
          <Button className="w-full bg-yellow-400 text-black font-bold mt-2">Join</Button>
        </Card>

        {/*game board*/}
        <div className="grid grid-cols-5 gap-2 bg-orange-900 p-4 rounded-lg">
          {initialWords.map((tile, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-28 h-16 rounded-md font-bold 
                ${getTileClass(tile.color)}
              `}
            >
              {tile.word}
            </div>
          ))}
        </div>

        {/*right player panel*/}
        <Card className="w-56 p-4 bg-blue-700 text-white rounded-lg">
          <h3 className="text-xl font-bold">6</h3>
          <p>Me</p>
          <Button className="w-full bg-yellow-400 text-black font-bold mt-2">Join</Button>
        </Card>
      </div>

      {/*spymaster submits clue*/}
      {/* (operatives can also see this, but you can conditionally hide if you want) */}
      <div className="mt-4 flex justify-center items-center">
        <Input
          type="text"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="Type your clue"
          className="w-64"
        />
        <Button className="ml-2 bg-yellow-400 text-black font-bold" onClick={submitClue}>
          Give Clue
        </Button>
      </div>

      {/*game log */}
      <Card className="w-64 mt-6 p-4 bg-gray-200 text-black rounded-lg mx-auto">
        <h3 className="text-lg font-bold">Game Log</h3>
        <div className="text-sm text-gray-600">
          {gameLog.length > 0 ? (
            gameLog.map((log, index) => <p key={index}>{log}</p>)
          ) : (
            <p>-</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CodenamesGame;
