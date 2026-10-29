import { useState } from 'react';

/**
 * The file is parsed on the server only when the last step is confirmed; the progress bar shown
 * after a drop is cosmetic and finishes about five seconds later.
 */
export const useSimulatedUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const start = (file: File) => {
    setUploading(true);
    setProgress(0);
    const totalSize = file.size;
    let uploaded = 0;
    const speed = totalSize / 50;

    const interval = setInterval(() => {
      uploaded += speed;
      const currentProgress = Math.min((uploaded / totalSize) * 100, 100);
      setProgress(currentProgress);

      const remaining = totalSize - uploaded;
      setTimeRemaining(Math.max(Math.ceil(remaining / speed / 10), 0));

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => setUploading(false), 500);
      }
    }, 100);
  };

  return { uploading, progress, timeRemaining, start };
};
