import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { completeCheckpoint } from '../utils/checkpointManagement';

export function CheckpointVerification() {
  const { number } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyCheckpoint = async () => {
      try {
        // Validate checkpoint number
        if (number && ['1', '2', '3'].includes(number)) {
          // Complete the checkpoint
          completeCheckpoint(parseInt(number));

          // Navigate back to main page
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        }
      } catch (error) {
        console.error('Error verifying checkpoint:', error);
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
        <p>Please wait while we verify your completion...</p>
      </div>
    </div>
  );
}