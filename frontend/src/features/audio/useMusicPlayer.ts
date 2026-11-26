
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

export default function useMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  const musicUrlRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const playRequestRef = useRef(0);

  const [trackName, setTrackName] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);

  const [musicError, setMusicError] = useState("");

  useEffect(() => {
    mountedRef.current = true;

    const audio = audioRef.current;

    return () => {
      mountedRef.current = false;
      playRequestRef.current += 1;

      if (musicUrlRef.current) {
        if (audio && !audio.paused) {
          audio.pause();
        }

        URL.revokeObjectURL(musicUrlRef.current);
        musicUrlRef.current = null;
      }
    };
  }, []);

  function openMusicSelector() {
    musicInputRef.current?.click();
  }

  function pausePlayback() {
    playRequestRef.current += 1;

    if (musicUrlRef.current) {
      audioRef.current?.pause();
    }

    setIsPlaying(false);
  }

  async function playMusic(
    audio: HTMLAudioElement,
    activeUrl: string
  ) {
    const requestId = ++playRequestRef.current;

    setMusicError("");

    try {
      await audio.play();
    } catch {
      if (
        mountedRef.current &&
        musicUrlRef.current === activeUrl &&
        playRequestRef.current === requestId
      ) {
        setIsPlaying(false);

        setMusicError(
          "Unable to start playback. Press Play to try again."
        );
      }
    }
  }

  function handleMusicSelection(
    event: ChangeEvent<HTMLInputElement>,
    beforeLoad?: () => void
  ) {
    const file = event.target.files?.[0];
    const audio = audioRef.current;

    if (!file || !audio) return;

    event.target.value = "";

    if (file.type && !file.type.startsWith("audio/")) {
      setMusicError(
        "Please select a supported audio file."
      );
      return;
    }

    const previousUrl = musicUrlRef.current;
    const newUrl = URL.createObjectURL(file);

    const shouldAutoplay = previousUrl !== null;

    beforeLoad?.();

    if (previousUrl) {
      pausePlayback();
    }

    musicUrlRef.current = newUrl;

    // The source must be assigned before autoplay.
    audio.src = newUrl;

    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    audio.volume = volume / 100;

    setTrackName(
      file.name.replace(/\.[^.]+$/, "")
    );

    setMusicUrl(newUrl);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setMusicError("");

    if (shouldAutoplay) {
      void playMusic(audio, newUrl);
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    const activeUrl = musicUrlRef.current;

    if (!audio || !activeUrl) return;

    setMusicError("");

    if (isPlaying) {
      pausePlayback();
      return;
    }

    await playMusic(audio, activeUrl);
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;

    if (!audio) return;

    setDuration(
      Number.isFinite(audio.duration)
        ? audio.duration
        : 0
    );
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;

    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }

  function handleSeek(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const audio = audioRef.current;

    if (!audio || duration <= 0) return;

    const position = Number(event.target.value);

    audio.currentTime = position;
    setCurrentTime(position);
  }

  function handleVolumeChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  }

  function handlePlay() {
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(false);
  }

  function handleMusicError() {
    if (!musicUrlRef.current) return;

    setIsPlaying(false);

    setMusicError(
      "This audio file could not be loaded."
    );
  }

  return {
    audioRef,
    musicInputRef,
    trackName,
    musicUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    musicError,
    openMusicSelector,
    pausePlayback,
    togglePlayback,
    handleMusicSelection,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleSeek,
    handleVolumeChange,
    handlePlay,
    handlePause,
    handleMusicError,
  };
}
