import { useEffect, useRef } from "react";

interface BackgroundMusicProps {
  enabled: boolean;
}

const BackgroundMusic = ({ enabled }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasInteracted = useRef(false);

  // Build music URL - BASE_URL already includes trailing slash
  const baseUrl = import.meta.env.BASE_URL || '/';
  const musicSrc = `${baseUrl}music.mp3`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Log for debugging
    console.log("Music source:", musicSrc);

    if (enabled) {
      const playAudio = () => {
        audio.volume = 0.5;
        audio.play().catch((e) => {
          console.error("Could not play audio:", e);
          console.error("Audio src:", audio.src);
          console.error("Audio networkState:", audio.networkState);
          console.error("Audio readyState:", audio.readyState);
        });
      };

      if (hasInteracted.current) {
        playAudio();
      } else {
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
  }, [enabled, musicSrc]);

  return (
    <audio 
      ref={audioRef} 
      src={musicSrc} 
      loop 
      preload="auto"
      onError={(e) => console.error("Audio load error:", e)}
    />
  );
};

export default BackgroundMusic;
