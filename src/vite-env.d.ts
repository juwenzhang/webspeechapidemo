/// <reference types="vite/client" />

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
  }

  interface Window {
    SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
  }
}
