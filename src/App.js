import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';


function App() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const utteranceRef = useRef(null);

  const loadVoices = () => {
    try {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if (!selectedVoice) {
          const arabicVoice = availableVoices.find(voice => voice.lang === 'ar-SA');
          setSelectedVoice(arabicVoice || availableVoices[0]);
        }
      } else {
        console.warn('Aucune voix disponible.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des voix:', error);
    }
  };

  useEffect(() => {
    if (!window.speechSynthesis) {
      console.error('Text-to-Speech non supporté par ce navigateur.');
      return;
    }
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSpeak = () => {
    if (text !== '') {
      handleStop();
      const sentences = text.split(/\.+/).filter((sentence) => sentence.trim() !== '');
      if (sentences.length > 0) {
        setIsSpeaking(true);
        setIsPaused(false);
        setCurrentSentenceIndex(0);
        speakSentence(sentences, 0);
      }
    }
  };

  const speakSentence = (sentences, index) => {
    if (index < sentences.length) {
      const utterance = new SpeechSynthesisUtterance(sentences[index].trim());
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.pitch = 1;
      utterance.rate = rate;
      utteranceRef.current = utterance;
  
      utterance.onend = () => {
        setCurrentSentenceIndex(index + 1); // Update the index after speaking a sentence
        if (index + 1 < sentences.length) {
          speakSentence(sentences, index + 1);
        } else {
          setIsSpeaking(false);
          utteranceRef.current = null;
        }
      };
  
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const handlePause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentSentenceIndex(0);
      utteranceRef.current = null;
    }
  };

  const handleRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setRate(newRate);
    if (utteranceRef.current) {
      utteranceRef.current.rate = newRate;
    }
  };

  const handleVoiceChange = (e) => {
    const chosenVoice = voices.find((voice) => voice.name === e.target.value);
    setSelectedVoice(chosenVoice);
    if (utteranceRef.current) {
      utteranceRef.current.voice = chosenVoice;
    }
  };

  return (
    <div className="App">
      <h1>Text-to-Speech App</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="5"
        cols="40"
        placeholder="Entrez du texte ici..."
      ></textarea>

      <div>
        <label>Choisir une voix:</label>
        <select class="custom-select" value={selectedVoice ? selectedVoice.name : ''} onChange={handleVoiceChange}>
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Vitesse de lecture:</label>
        <input class="custom-input"
          type="number"
          step="0.1"
          min="0.5"
          max="2"
          value={rate}
          onChange={handleRateChange}
        />
      </div>

      <div>
        <button
          onClick={handleSpeak}
          disabled={isSpeaking && !isPaused}
          className={isSpeaking && !isPaused ? 'btn-active' : ''}
          aria-label="Lire le texte"
        >
          Lire le texte
        </button>
        <button
          onClick={handlePause}
          disabled={!isSpeaking || isPaused}
          className={isPaused ? 'btn-paused' : ''}
          aria-label="Pause"
        >
          Pause
        </button>
        <button
          onClick={handleResume}
          disabled={!isSpeaking || !isPaused}
          className={isSpeaking && !isPaused ? 'btn-resume' : ''}
          aria-label="Reprendre"
        >
          Reprendre
        </button>
        <button
          onClick={handleStop}
          disabled={!isSpeaking}
          className={!isSpeaking ? 'btn-stop' : ''}
          aria-label="Arrêter"
        >
          Arrêter
        </button>
      </div>

      <div>
        <p>Phrase en cours : {text.split(/\.+/)[currentSentenceIndex]}</p>
      </div>
      <footer>
          <div class="footer-content">
              <p>Développé par Yassine El Miloudi</p>
              <a href="https://sites.google.com/view/yassinelmiloudi/accueil" target="_blank" aria-label="Portfolio">
                  <i class="fa-solid fa-globe"></i>
              </a>
              <a href="https://gitlab.com/yassinelmiloudi31" target="_blank" aria-label="GitLab">
                  <i class="fa-brands fa-gitlab"></i>
              </a>
              <a href="mailto:yassinelmiloudi31@gmail.com" target="_blank" aria-label="Gmail">
                  <i class="fa-brands fa-google"></i>
              </a>
              <a href="https://www.linkedin.com/in/yassine-el-miloudi" target="_blank" aria-label="LinkedIn">
                  <i class="fa-brands fa-linkedin"></i>
              </a>
          </div>  
      </footer>

    </div>
    
  );
}

export default App;
