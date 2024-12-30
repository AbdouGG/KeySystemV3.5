import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function CheckpointVerification() {
  const { number } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const completeCheckpoint = async () => {
      try {
        // Get existing checkpoints
        const savedCheckpoints = localStorage.getItem('checkpoints') || JSON.stringify({
          checkpoint1: false,
          checkpoint2: false,
          checkpoint3: false,
        });
        
        const checkpoints = JSON.parse(savedCheckpoints);

        // Validate checkpoint number
        if (number && ['1', '2', '3'].includes(number)) {
          // Update the current checkpoint
          const checkpointKey = `checkpoint${number}` as keyof typeof checkpoints;

          // Only update if previous checkpoints are completed
          if (
            number === '1' ||
            (number === '2' && checkpoints.checkpoint1) ||
            (number === '3' && checkpoints.checkpoint1 && checkpoints.checkpoint2)
          ) {
            checkpoints[checkpointKey] = true;

            // Save updated checkpoints immediately
            localStorage.setItem('checkpoints', JSON.stringify(checkpoints));

            // Force reload the main page to update the state
            setTimeout(() => {
              navigate('/', { replace: true });
              window.location.reload();
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error completing checkpoint:', error);
      }
    };

    completeCheckpoint();
  }, [number, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Verifying Checkpoint {number}
        </h1>
        <p>Please wait while we verify your completion...</p>
      </div>
    </div>
  );
}