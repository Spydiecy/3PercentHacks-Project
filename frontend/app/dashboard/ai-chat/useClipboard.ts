import { useState, useEffect } from 'react';

/**
 * Custom hook for handling copy-to-clipboard functionality
 * @param text The text to copy to clipboard
 * @param resetDelay The delay in ms before resetting the copied state (default: 2000ms)
 * @returns An object with copied status and copy function
 */
export function useClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState("");

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, resetDelay);
      return () => clearTimeout(timer);
    }
  }, [copied, resetDelay]);

  const copy = async (newText: string) => {
    if (!newText) return;

    setText(newText);
    
    try {
      await navigator.clipboard.writeText(newText);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return { copied, copy };
}
