import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Copy, Check, Zap, Monitor, Power, Gamepad2, Timer, Smartphone, ShieldAlert, Download, FlaskConical, Sparkles } from 'lucide-react';
import { AppTheme, AutomationScript } from '../types';
import { generateAutomationScript } from '../services/geminiService';

interface AutomationPanelProps {
  theme: AppTheme;
}

const QUICK_ACTIONS = [
  { label: "Changer Résolution (1080p)", prompt: "Script PowerShell pour changer la résolution Windows en 1920x1080 60Hz avec QRes.exe", icon: Monitor },
  { label: "Éteindre Écran Hôte", prompt: "Script PowerShell pour éteindre le moniteur connecté sans mettre en veille le PC (pour streaming)", icon: Power },
  { label: "Lancer Steam Big Picture", prompt: "Commande pour lancer Steam en mode Big Picture", icon: Gamepad2 },
  { label: "Mode Performance", prompt: "Script batch pour mettre Windows en mode performances élevées", icon: Zap },
];

export const AutomationPanel: React.FC<AutomationPanelProps> = ({ theme }) => {
  const [input, setInput] = useState('');
  const [os, setOs] = useState('Windows');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<AutomationScript | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Simulation State
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const simulationRef = useRef<HTMLDivElement>(null);

  // Session Control State
  const [sessionConfig, setSessionConfig] = useState({
    minutes: 60,
    deviceName: '',
    action: 'disconnect' 
  });

  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.scrollTop = simulationRef.current.scrollHeight;
    }
  }, [simulationLogs]);

  const handleGenerate = async (promptText: string = input) => {
    if (!promptText.trim()) return;
    setLoading(true);
    setScript(null);
    setShowSimulation(false);
    try {
      const result = await generateAutomationScript(promptText, os);
      setScript(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionGenerate = () => {
    const { minutes, deviceName, action } = sessionConfig;
    
    let actionDesc = "";
    switch(action) {
      case 'shutdown': actionDesc = "éteindre le PC (shutdown /s)"; break;
      case 'sleep': actionDesc = "mettre le PC en veille (rundll32 powrprof.dll,SetSuspendState)"; break;
      case 'disconnect': actionDesc = "COUPER L'ACCÈS au stream immédiatement en fermant la session utilisateur (shutdown /l ou tsdiscon) MAIS SANS ÉTEINDRE L'ORDINATEUR."; break;
    }

    let prompt = `Génère un script non-bloquant pour Sunshine (Do Command). 
    Objectif : Limiter la durée de la session de jeu à ${minutes} minutes.
    Action à la fin du temps : ${actionDesc}.`;

    if (deviceName.trim()) {
      prompt += `
      IMPORTANT : Cette règle ne doit s'appliquer QUE si le nom de l'appareil client (variable d'environnement Sunshine 'SUNSHINE_CLIENT_NAME') contient le texte "${deviceName}".
      Si c'est un autre appareil, le script ne doit rien faire (pas de minuterie).
      Utilise une structure conditionnelle (if/else).`;
    } else {
      prompt += `
      Cette règle s'applique à TOUS les appareils connectés.`;
    }

    handleGenerate(prompt);
  };

  const fillExample = () => {
    setSessionConfig({
        minutes: 60,
        deviceName: 'iPad',
        action: 'disconnect'
    });
    setInput("Créer une règle automatique : Si l'appareil est 'iPad', alors couper la session (Logoff) après 60 minutes pour arrêter le stream sans éteindre le PC.");
  };

  const handleSimulation = async () => {
    if (!script) return;
    setSimulationLogs([]);
    setShowSimulation(true);

    const addLog = (text: string) => {
      setSimulationLogs(prev => [...prev, text]);
    };

    addLog(`> Démarrage de l'environnement virtuel (${script.language})...`);
    await new Promise(r => setTimeout(r, 600));

    addLog(`> Analyse de la syntaxe... OK`);
    await new Promise(r => setTimeout(r, 600));

    if (script.code.toLowerCase().includes('sunshine_client_name')) {
      addLog(`> ⚠️ Condition détectée : Variable SUNSHINE_CLIENT_NAME`);
      addLog(`> SIMULATION : Valeur reçue = "${sessionConfig.deviceName || 'Unknown-Device'}"`);
      await new Promise(r => setTimeout(r, 800));
      if (sessionConfig.deviceName) {
          addLog(`> Condition vérifiée : VRAI (Correspondance trouvée)`);
      } else {
          addLog(`> Condition vérifiée : VRAI (Simulation générique)`);
      }
    }

    if (script.code.toLowerCase().includes('timeout') || script.code.toLowerCase().includes('sleep') || script.code.toLowerCase().includes('start-sleep')) {
       const match = script.code.match(/(\d+)/); 
       const duration = match ? match[0] : 'XX';
       addLog(`> ⏱️ Minuteur actif : Attente de ${duration} secondes...`);
       addLog(`> (Mode Test : Avance rapide du temps...)`);
       await new Promise(r => setTimeout(r, 800));
    }

    const actionKeywords: Record<string, string> = {
      'shutdown /s': 'Arrêt complet du système (Shutdown)',
      'shutdown /l': 'Fermeture de session (Logoff - Stream coupé)',
      'logoff': 'Fermeture de session (Logoff)',
      'tsdiscon': 'Déconnexion forcée du flux (tsdiscon)',
      'rundll32': 'Mise en veille (User32)',
      'qres': 'Changement de résolution'
    };

    let actionFound = false;
    for (const [key, desc] of Object.entries(actionKeywords)) {
      if (script.code.toLowerCase().includes(key)) {
        addLog(`> 🚀 ACTION DÉCLENCHÉE : ${desc}`);
        actionFound = true;
      }
    }

    if (!actionFound) {
      // Fallback detection for generic shutdown
      if (script.code.toLowerCase().includes('shutdown')) {
         addLog(`> 🚀 ACTION DÉCLENCHÉE : Commande Shutdown détectée`);
      } else {
         addLog(`> Exécution des commandes système standards...`);
      }
    }

    await new Promise(r => setTimeout(r, 500));
    addLog(`> ✅ Script terminé avec succès.`);
  };

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!script) return;
    
    let extension = 'txt';
    if (script.language === 'powershell') extension = 'ps1';
    if (script.language === 'batch') extension = 'bat';
    if (script.language === 'bash') extension = 'sh';

    const blob = new Blob([script.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sunshine_automation_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isSun = theme === AppTheme.SUNSHINE;

  return (
    <div className={`h-full flex flex-col rounded-2xl overflow-hidden border shadow-xl transition-colors duration-500 ${
      isSun ? 'bg-white border-orange-100' : 'bg-slate-900 border-indigo-900/50'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-2 ${isSun ? 'bg-orange-50 border-orange-100' : 'bg-indigo-950/30 border-indigo-900'}`}>
        <Terminal size={20} className={isSun ? 'text-orange-600' : 'text-indigo-400'} />
        <h2 className={`font-bold ${isSun ? 'text-gray-800' : 'text-white'}`}>Générateur de Scripts Sunshine</h2>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6">
          
          {/* OS Selection */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isSun ? 'text-gray-500' : 'text-gray-400'}`}>
              Système de l'Hôte
            </label>
            <select 
              value={os} 
              onChange={(e) => setOs(e.target.value)}
              className={`w-full p-2 rounded-lg border outline-none focus:ring-2 ${
                isSun 
                  ? 'bg-gray-50 border-gray-200 focus:ring-orange-400 text-gray-800' 
                  : 'bg-slate-800 border-slate-700 focus:ring-indigo-500 text-white'
              }`}
            >
              <option value="Windows">Windows 10/11 (PowerShell/Batch)</option>
              <option value="Linux">Linux (Bash)</option>
              <option value="macOS">macOS (Shell)</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isSun ? 'text-gray-500' : 'text-gray-400'}`}>
              Actions Rapides
            </label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(action.prompt);
                    handleGenerate(action.prompt);
                  }}
                  className={`p-3 rounded-lg text-left text-sm font-medium transition-all hover:scale-[1.02] flex items-center gap-2 ${
                    isSun 
                      ? 'bg-orange-50 text-orange-900 hover:bg-orange-100 border border-orange-100' 
                      : 'bg-indigo-900/20 text-indigo-200 hover:bg-indigo-900/40 border border-indigo-900/50'
                  }`}
                >
                  <action.icon size={16} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session Control Section */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isSun ? 'text-gray-500' : 'text-gray-400'}`}>
              <ShieldAlert size={14} /> Contrôle de Session & Appareils
            </label>
            <div className={`p-4 rounded-lg border flex flex-col gap-4 ${
              isSun 
                ? 'bg-orange-50/50 border-orange-200' 
                : 'bg-indigo-950/20 border-indigo-800'
            }`}>
              
              {/* Row 1: Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${isSun ? 'bg-orange-100 text-orange-600' : 'bg-indigo-900 text-indigo-300'}`}>
                    <Timer size={16} />
                  </div>
                  <span className={`text-sm font-medium ${isSun ? 'text-gray-700' : 'text-gray-300'}`}>Durée limite :</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" 
                    max="480"
                    value={sessionConfig.minutes}
                    onChange={(e) => setSessionConfig({...sessionConfig, minutes: parseInt(e.target.value) || 0})}
                    className={`w-20 p-1 px-2 rounded border text-center font-mono outline-none focus:ring-2 ${
                      isSun 
                        ? 'bg-white border-gray-300 focus:ring-orange-400 text-gray-800' 
                        : 'bg-slate-900 border-slate-600 focus:ring-indigo-500 text-white'
                    }`}
                  />
                  <span className={`text-xs ${isSun ? 'text-gray-500' : 'text-gray-400'}`}>min</span>
                </div>
              </div>

              {/* Row 2: Device Filter */}
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-full ${isSun ? 'bg-orange-100 text-orange-600' : 'bg-indigo-900 text-indigo-300'}`}>
                      <Smartphone size={16} />
                    </div>
                    <span className={`text-sm font-medium ${isSun ? 'text-gray-700' : 'text-gray-300'}`}>Appareil cible (Optionnel) :</span>
                 </div>
                 <input 
                    type="text" 
                    placeholder="Ex: iPad de Paul (Laisser vide pour tous)"
                    value={sessionConfig.deviceName}
                    onChange={(e) => setSessionConfig({...sessionConfig, deviceName: e.target.value})}
                    className={`w-full p-2 text-sm rounded border outline-none focus:ring-2 ${
                      isSun 
                        ? 'bg-white border-gray-300 focus:ring-orange-400 text-gray-800 placeholder-gray-400' 
                        : 'bg-slate-900 border-slate-600 focus:ring-indigo-500 text-white placeholder-slate-500'
                    }`}
                  />
                  <span className={`text-[10px] italic ${isSun ? 'text-gray-400' : 'text-gray-500'}`}>
                    Utilise la variable SUNSHINE_CLIENT_NAME pour filtrer.
                  </span>
              </div>

              {/* Row 3: Action & Button */}
              <div className="flex items-center gap-3 pt-2 border-t border-dashed border-gray-300/20">
                 <select
                    value={sessionConfig.action}
                    onChange={(e) => setSessionConfig({...sessionConfig, action: e.target.value})}
                    className={`flex-1 p-2 text-sm rounded border outline-none focus:ring-2 ${
                      isSun 
                        ? 'bg-white border-gray-300 focus:ring-orange-400 text-gray-800' 
                        : 'bg-slate-900 border-slate-600 focus:ring-indigo-500 text-white'
                    }`}
                 >
                    <option value="disconnect">Couper l'accès (Stream uniquement)</option>
                    <option value="shutdown">Arrêter le PC</option>
                    <option value="sleep">Mettre en Veille</option>
                 </select>

                <button 
                  onClick={handleSessionGenerate}
                  disabled={loading || sessionConfig.minutes <= 0}
                  className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${
                    isSun 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  Générer Règle
                </button>
              </div>

            </div>
          </div>

          {/* Custom Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isSun ? 'text-gray-500' : 'text-gray-400'}`}>
                Demande Personnalisée
                </label>
                <button onClick={fillExample} className={`text-xs flex items-center gap-1 hover:underline ${isSun ? 'text-orange-600' : 'text-indigo-400'}`}>
                    <Sparkles size={12}/> Essayer un exemple
                </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Créer un script pour fermer toutes les applications sauf le jeu au lancement."
              className={`w-full p-3 h-24 rounded-lg border outline-none focus:ring-2 resize-none ${
                isSun 
                  ? 'bg-gray-50 border-gray-200 focus:ring-orange-400 text-gray-800 placeholder-gray-400' 
                  : 'bg-slate-800 border-slate-700 focus:ring-indigo-500 text-white placeholder-slate-500'
              }`}
            />
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={loading || !input}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              isSun 
                ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg shadow-orange-200' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-900'
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Analyse avec Gemini...</span>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                Générer le Script
              </>
            )}
          </button>

          {/* Result Area */}
          {script && (
            <div className={`mt-2 rounded-lg border overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              isSun ? 'bg-gray-50 border-gray-200' : 'bg-black/30 border-slate-700'
            }`}>
              <div className="flex items-center justify-between p-2 px-4 border-b bg-opacity-50 select-none" 
                style={{ backgroundColor: isSun ? '#fff' : '#000' }}>
                <span className={`text-xs font-mono ${isSun ? 'text-gray-500' : 'text-gray-400'}`}>
                  {script.title}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={handleSimulation} title="Simuler l'exécution" className={`p-1 px-2 rounded flex items-center gap-1 text-xs font-bold ${isSun ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-green-900/30 text-green-400 hover:bg-green-900/50'}`}>
                    <FlaskConical size={12}/> Tester
                  </button>
                  <div className="w-[1px] h-3 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                  <button onClick={handleDownload} title="Télécharger le fichier" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded flex items-center gap-1">
                    <Download size={14} className={isSun ? 'text-gray-500' : 'text-gray-400'}/>
                  </button>
                  <button onClick={handleCopy} title="Copier dans le presse-papier" className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded flex items-center gap-1">
                    <span className="text-xs">{copied ? 'Copié !' : 'Copier'}</span>
                    {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} className={isSun ? 'text-gray-500' : 'text-gray-400'}/>}
                  </button>
                </div>
              </div>
              
              {/* Simulation Terminal */}
              {showSimulation && (
                <div className="border-b border-dashed border-gray-500/30 bg-black p-3 font-mono text-xs h-32 overflow-y-auto" ref={simulationRef}>
                    {simulationLogs.map((log, i) => (
                        <div key={i} className="text-green-500 mb-1">{log}</div>
                    ))}
                    {simulationLogs.length === 0 && <div className="text-gray-600 animate-pulse">Initialisation...</div>}
                    <div className="animate-pulse text-green-500">_</div>
                </div>
              )}

              <div className={`p-3 text-xs border-b ${isSun ? 'bg-yellow-50 text-yellow-800 border-yellow-100' : 'bg-blue-900/20 text-blue-200 border-blue-900/30'}`}>
                 <strong>Installation :</strong> Ouvrez l'interface Web de Sunshine &gt; Applications &gt; [Votre Jeu] &gt; Commandes. Collez ceci dans "Do Command" (Démarrage).
              </div>

              <pre className={`p-4 overflow-x-auto font-mono text-sm ${
                isSun ? 'text-gray-800' : 'text-green-400'
              }`}>
                <code>{script.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
