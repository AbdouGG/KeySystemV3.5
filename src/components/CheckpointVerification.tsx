import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { completeCheckpoint } from '../utils/checkpointManagement';

export function CheckpointVerification() {
  const { number } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyCheckpoint = () => {
      if (number && ['1', '2', '3'].includes(number)) {
        const checkpointNumber = parseInt(number, 10);
        completeCheckpoint(checkpointNumber);
        
        // Navigate back to main page after a short delay
        setTimeout(() => {
          navigate('/', { replace: true });
          // Force a reload to ensure state is fresh
          window.location.reload();
        }, 1500);
      } else {
        navigate('/', { replace: true });
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