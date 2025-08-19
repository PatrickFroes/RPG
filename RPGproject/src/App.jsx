import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapEditor from './components/MapEditor';
import CharacterCreator from './components/CharacterCreator';
import PlayScreen from './components/PlayScreen';
import './App.css';

export default function App() {
  const [maps, setMaps] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [mode, setMode] = useState("map");

  function renderMain() {
    if (mode === "map") return <MapEditor maps={maps} setMaps={setMaps} />;
    if (mode === "char") return <CharacterCreator characters={characters} setCharacters={setCharacters} />;
    return <PlayScreen maps={maps} characters={characters} />;
  }

  return (
    <div className="flex-row full-height">
      <Sidebar setMode={setMode} />
      <main className="flex-1 p-4 overflow-auto">
        {renderMain()}
      </main>
    </div>
  );
}