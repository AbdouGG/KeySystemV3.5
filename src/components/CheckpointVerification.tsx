import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCheckpoints } from '../utils/checkpointManagement';

export function CheckpointVerification() {
  const { number } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const completeCheckpoint = async () => {
      try {
        if (number && ['1', '2', '3'].includes(number)) {
          // Get current checkpoints
          const checkpoints = getCheckpoints();
          
          // Validate checkpoint sequence
          if (
            number === '1' ||
            (number === '2' && checkpoints.checkpoint1) ||
            (number === '3' && checkpoints.checkpoint1 && checkpoints.checkpoint2)
          ) {
            // Update the checkpoint
            const checkpointKey = `checkpoint${number}` as keyof typeof checkpoints;
            checkpoints[checkpointKey] = true;

            // Save to localStorage
            localStorage.setItem('checkpoints', JSON.stringify(checkpoints));

            // Navigate back
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 1500);
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error completing checkpoint:', error);
        navigate('/', { replace: true });
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