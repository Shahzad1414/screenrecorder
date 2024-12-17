import React, { useState, useRef, useEffect } from "react";

const ScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoURL, setVideoURL] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // Function to start recording
  const startRecording = async () => {
    try {
      // Capture screen video
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });

      // Capture microphone audio
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Combine screen and microphone audio streams
      const combinedStream = new MediaStream();
      screenStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
      screenStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));
      audioStream.getAudioTracks().forEach((track) => combinedStream.addTrack(track));

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;

      // Collect video chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };

      // Stop recording
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        setVideoURL(URL.createObjectURL(blob));
        recordedChunks.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop when user stops screen sharing
      screenStream.getTracks()[0].onended = () => stopRecording();
    } catch (error) {
      console.error("Error accessing screen or microphone:", error);
      alert("Please allow permissions for both screen and microphone.");
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "r" || e.key === "R") {
        if (!isRecording) {
          startRecording();
        } else {
          stopRecording();
        }
      } else if (e.key === "p" || e.key === "P") {
        if (isRecording && !isPaused) {
          pauseRecording();
        } else if (isRecording && isPaused) {
          resumeRecording();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRecording, isPaused]);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Screen Recorder with Microphone</h1>

      {/* Buttons */}
      <div className="space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Start Recording
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseRecording}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition"
              >
                Pause Recording
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
              >
                Resume Recording
              </button>
            )}
            <button
              onClick={stopRecording}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
            >
              Stop Recording
            </button>
          </>
        )}
      </div>

      {/* Video Preview */}
      {videoURL && (
        <div className="w-full max-w-3xl mt-6">
          <h2 className="text-lg font-semibold mb-2">Recorded Video:</h2>
          <video src={videoURL} controls className="w-full rounded-lg shadow-lg" />
          <a
            href={videoURL}
            download="screen-recording-with-mic.webm"
            className="mt-2 inline-block text-blue-500 underline"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;
