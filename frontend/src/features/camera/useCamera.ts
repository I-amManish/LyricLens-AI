
import { useEffect, useRef, useState } from "react";

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export default function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStageRef = useRef<HTMLElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        cameraStageRef.current !== null &&
          document.fullscreenElement === cameraStageRef.current
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  async function enableCamera() {
    if (cameraOn || cameraLoading) return;

    setCameraError("");
    setCameraLoading(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera access is unavailable in this browser."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

      if (!mountedRef.current || !videoRef.current) {
        stopStream(stream);
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      setCameraOn(true);
    } catch (error) {
      stopStream(streamRef.current);
      streamRef.current = null;

      if (!mountedRef.current) return;

      const errorName =
        typeof error === "object" &&
        error !== null &&
        "name" in error
          ? error.name
          : "";

      if (errorName === "NotAllowedError") {
        setCameraError(
          "Camera permission denied. Allow access in your browser settings."
        );
      } else if (errorName === "NotFoundError") {
        setCameraError("No camera was detected.");
      } else {
        setCameraError(
          "Unable to access the camera. Please try again."
        );
      }
    } finally {
      if (mountedRef.current) {
        setCameraLoading(false);
      }
    }
  }

  function disableCamera() {
    stopStream(streamRef.current);

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setCameraError("");
  }

  async function toggleFullscreen() {
    const stage = cameraStageRef.current;

    if (!stage) return;

    setFullscreenError("");

    try {
      if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
      } else {
        if (typeof stage.requestFullscreen !== "function") {
          setFullscreenError(
            "Fullscreen is unavailable in this browser."
          );
          return;
        }

        await stage.requestFullscreen();
      }
    } catch {
      if (mountedRef.current) {
        setFullscreenError(
          "Unable to change fullscreen mode. Please try again."
        );
      }
    }
  }

  return {
    videoRef,
    cameraStageRef,
    cameraOn,
    cameraLoading,
    cameraError,
    isFullscreen,
    fullscreenError,
    enableCamera,
    disableCamera,
    toggleFullscreen,
  };
}
