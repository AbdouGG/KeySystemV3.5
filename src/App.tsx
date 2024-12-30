import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { KeyDisplay } from './components/KeyDisplay';
import { CheckpointButton } from './components/CheckpointButton';
import { generateKey } from './utils/keyGeneration';
import { getCheckpointUrl } from './utils/checkpointUrls';
import type { CheckpointStatus, Key } from './types';

function App() {
  const [checkpoints, setCheckpoints] = useState<CheckpointStatus>({
    checkpoint1: false,
    checkpoint2: false,
    checkpoint3: false,
  });
  const [generatedKey, setGeneratedKey] = useState<Key | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load checkpoints from localStorage on mount
  useEffect(() => {
    const savedCheckpoints = localStorage.getItem('checkpoints');
    if (savedCheckpoints) {
      try {
        const parsed = JSON.parse(savedCheckpoints);
        setCheckpoints(parsed);
      } catch (e) {
        console.error('Error parsing saved checkpoints:', e);
      }
    }
  }, []);

  // Save checkpoints to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('checkpoints', JSON.stringify(checkpoints));
  }, [checkpoints]);

  const getCurrentCheckpoint = () => {
    if (!checkpoints.checkpoint1) return 1;
    if (!checkpoints.checkpoint2) return 2;
    if (!checkpoints.checkpoint3) return 3;
    return 3;
  };

  const handleLinkvertiseClick = async () => {
    const currentCheckpoint = getCurrentCheckpoint();
    try {
      const checkpointUrl = await getCheckpointUrl(currentCheckpoint);
      window.open(checkpointUrl, '_blank');
      
      // Update checkpoint status immediately for testing
      // In production, this should be handled by the verification endpoint
      const checkpointKey = `checkpoint${currentCheckpoint}` as keyof CheckpointStatus;
      const newCheckpoints = { ...checkpoints, [checkpointKey]: true };
      setCheckpoints(newCheckpoints);
      
      // Check if all checkpoints are complete
      if (Object.values(newCheckpoints).every(status => status)) {
        try {
          const key = await generateKey();
          setGeneratedKey(key);
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('Error generating key');
          }
          console.error('Error generating key:', error);
        }
      }
    } catch (error) {
      console.error('Error handling checkpoint:', error);
      setError('Error processing checkpoint');
    }
  };

  const currentCheckpoint = getCurrentCheckpoint();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-red-500 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-red-500 mb-2">Key System</h1>
          <p className="text-gray-400">Checkpoint: {currentCheckpoint} / 3</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-4">
            {error}
          </div>
        )}

        {!generatedKey ? (
          <div className="space-y-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckpointButton
                    currentCheckpoint={currentCheckpoint}
                    onClick={handleLinkvertiseClick}
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Continue with Lootlabs
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <KeyDisplay keyData={generatedKey} />
        )}
      </div>
    </div>
  );
}

export default App;