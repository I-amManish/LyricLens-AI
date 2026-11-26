
import { useEffect, useRef, useState } from "react";

function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

export default function usePcAudio() {
  const streamRef = useRef<MediaStream | null>(null);
  const releaseRef = useRef<(() => void) | null>(null);
  const requestRef = useRef(0);

  const [stream, setStream] = useState<MediaStream | null>(
    null
  );

  const [pcLoading, setPcLoading] = useState(false);
  const [pcError, setPcError] = useState("");

  const pcConnected = stream !== null;

  useEffect(() => {
    return () => {
      requestRef.current += 1;

      releaseRef.current?.();
      releaseRef.current = null;

      streamRef.current = null;
    };
  }, []);

  function disconnectPcAudio() {
    // Invalidate any pending permission request.
    requestRef.current += 1;

    releaseRef.current?.();
    releaseRef.current = null;

    streamRef.current = null;

    setStream(null);
    setPcLoading(false);
    setPcError("");
  }

  async function connectPcAudio(
    onConnected?: () => void
  ) {
    if (pcConnected || pcLoading) return;

    setPcError("");

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setPcError(
        "PC audio capture is unavailable in this browser. Try Microsoft Edge or Google Chrome."
      );
      return;
    }

    setPcLoading(true);

    const requestId = ++requestRef.current;

    let capturedStream: MediaStream | null = null;

    try {
      const captureOptions: DisplayMediaStreamOptions & {
        systemAudio: "include";
        selfBrowserSurface: "exclude";
      } = {
        video: true,
        audio: true,
        systemAudio: "include",
        selfBrowserSurface: "exclude",
      };

      capturedStream =
        await navigator.mediaDevices.getDisplayMedia(
          captureOptions
        );

      // Release streams received after cancellation
      // or component unmounting.
      if (requestRef.current !== requestId) {
        stopStream(capturedStream);
        return;
      }

      const audioTracks =
        capturedStream.getAudioTracks();

      const hasAudio = audioTracks.some(
        (track) => track.readyState === "live"
      );

      if (!hasAudio) {
        stopStream(capturedStream);

        setPcError(
          "No audio was shared. Select an audio-supported source and enable Share audio."
        );

        return;
      }

      const activeStream = capturedStream;
      const tracks = activeStream.getTracks();

      // Do not render or process shared screen imagery.
      activeStream.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });

      function handleCaptureEnded() {
        if (streamRef.current !== activeStream) return;

        requestRef.current += 1;

        releaseRef.current?.();
        releaseRef.current = null;

        streamRef.current = null;

        setStream(null);
        setPcLoading(false);
      }

      // Centralized resource cleanup.
      releaseRef.current = () => {
        tracks.forEach((track) => {
          track.removeEventListener(
            "ended",
            handleCaptureEnded
          );

          track.stop();
        });
      };

      streamRef.current = activeStream;

      tracks.forEach((track) => {
        track.addEventListener(
          "ended",
          handleCaptureEnded
        );
      });

      // Pause the local source before switching.
      onConnected?.();

      setStream(activeStream);
    } catch (error) {
      if (capturedStream) {
        if (
          streamRef.current === capturedStream &&
          releaseRef.current
        ) {
          releaseRef.current();

          releaseRef.current = null;
          streamRef.current = null;
        } else {
          stopStream(capturedStream);
        }
      }

      if (requestRef.current !== requestId) return;

      setStream(null);

      const errorName =
        typeof error === "object" &&
        error !== null &&
        "name" in error
          ? error.name
          : "";

      if (errorName === "NotAllowedError") {
        setPcError(
          "Audio sharing was cancelled or denied. Click PC Audio to try again."
        );
      } else if (errorName === "NotFoundError") {
        setPcError(
          "No supported screen or audio source was found."
        );
      } else {
        setPcError(
          "Unable to connect PC audio. Please try again."
        );
      }
    } finally {
      if (requestRef.current === requestId) {
        setPcLoading(false);
      }
    }
  }

  return {
    stream,
    pcConnected,
    pcLoading,
    pcError,
    connectPcAudio,
    disconnectPcAudio,
  };
}
