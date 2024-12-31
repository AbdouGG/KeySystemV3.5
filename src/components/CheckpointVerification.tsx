import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { completeCheckpoint, getCheckpoints } from '../utils/checkpointManagement';

export function CheckpointVerification() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyCheckpoint = async () => {
      if (!number || !['1', '2', '3'].includes(number)) {
        setError('Invalid checkpoint number');
        setTimeout(() => navigate('/', { replace: true }), 2000);
        return;
      }

      const checkpointNumber = parseInt(number, 10);
      
      try {
        setIsVerifying(true);
        const currentCheckpoints = await getCheckpoints();

        // Verify prerequisites
        if (
          (checkpointNumber === 2 && !currentCheckpoints.checkpoint1) ||
          (checkpointNumber === 3 && (!currentCheckpoints.checkpoint1 || !currentCheckpoints.checkpoint2))
        ) {
          setError('Previous checkpoints must be completed first');
          setTimeout(() => navigate('/', { replace: true }), 2000);
          return;
        }

        await completeCheckpoint(checkpointNumber);
        
        // Verify completion
        const updatedCheckpoints = await getCheckpoints();
        const checkpointKey = `checkpoint${checkpointNumber}` as keyof typeof updatedCheckpoints;

        if (updatedCheckpoints[checkpointKey]) {
          // Success - redirect after a short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          setError('Failed to complete checkpoint');
          setTimeout(() => navigate('/', { replace: true }), 2000);
        }
      } catch (err) {
        console.error('Error during checkpoint verification:', err);
        setError('An error occurred during verification');
        setTimeout(() => navigate('/', { replace: true }), 2000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCheckpoint();
  }, [number, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Verifying Checkpoint {number}
        </h1>
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : isVerifying ? (
          <p>Please wait while we verify your completion...</p>
        ) : (
          <p className="text-green-400">Verification successful!</p>
        )}
      </div>
    </div>
  );
}