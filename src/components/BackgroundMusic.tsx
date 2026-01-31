import { useEffect, useRef } from "react";

interface BackgroundMusicProps {
  enabled: boolean;
}

const BackgroundMusic = ({ enabled }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (enabled) {
      const playAudio = () => {
        audio.play().catch((e) => console.error("Could not play audio.", e));
      };

      if (hasInteracted.current) {
        playAudio();
      } else {
        // Wait for user interaction to play
        const playOnClick = () => {
          hasInteracted.current = true;
          if (enabled) {
            playAudio();
          }
          document.removeEventListener("click", playOnClick);
        };
        document.addEventListener("click", playOnClick);
        return () => document.removeEventListener("click", playOnClick);
      }
    } else {
      audio.pause();
    }
  }, [enabled]);

  return <audio ref={audioRef} src="/music.mp3" loop />;
};

export default BackgroundMusic;
