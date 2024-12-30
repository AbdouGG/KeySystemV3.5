import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { KeyDisplay } from './KeyDisplay';
import { CheckpointButton } from './CheckpointButton';
import { generateKey } from '../utils/keyGeneration';
import { getExistingValidKey } from '../utils/keyManagement';
import { getCheckpointUrl } from '../utils/checkpointUrls';
import type { CheckpointStatus, Key } from '../types';

export function KeySystem() {
  const [checkpoints, setCheckpoints] = useState<CheckpointStatus>({
    checkpoint1: false,
    checkpoint2: false,
    checkpoint3: false,
  });
  const [generatedKey, setGeneratedKey] = useState<Key | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // Check for existing valid key
        const existingKey = await getExistingValidKey();
        if (existingKey) {
          setGeneratedKey(existingKey);
        }

        // Load saved checkpoints
        const savedCheckpoints = localStorage.getItem('checkpoints');
        if (savedCheckpoints) {
          const parsed = JSON.parse(savedCheckpoints);
          setCheckpoints(parsed);
        }
      } catch (e) {
        console.error('Error initializing system:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSystem();
  }, []);

  useEffect(() => {
    localStorage.setItem('checkpoints', JSON.stringify(checkpoints));
  }, [checkpoints]);

  const generateKeyForUser = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      const key = await generateKey();
      setGeneratedKey(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key');
    } finally {
      setIsProcessing(false);
    }
  };

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
    } catch (error) {
      console.error('Error handling checkpoint:', error);
      setError('Error processing checkpoint');
    }
  };

  const currentCheckpoint = getCurrentCheckpoint();
  const allCheckpointsCompleted = 
    checkpoints.checkpoint1 && 
    checkpoints.checkpoint2 && 
    checkpoints.checkpoint3;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-3 rounded-full bg-red-500 mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-red-500 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-red-500 mb-2">Key System</h1>
          <p className="text-gray-400">
            {allCheckpointsCompleted 
              ? "All checkpoints completed!" 
              : `Checkpoint: ${currentCheckpoint} / 3`}
          </p>
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
                {!allCheckpointsCompleted ? (
                  <div className="flex justify-center">
                    <CheckpointButton
                      currentCheckpoint={currentCheckpoint}
                      onClick={handleLinkvertiseClick}
                      disabled={isProcessing}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <button
                      onClick={generateKeyForUser}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Generating key...' : 'Generate Key'}
                    </button>
                  </div>
                )}
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