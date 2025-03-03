import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToggleAudioModal } from "../redux/slices/app";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

function VoiceRecorder() {
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  const { audio } = useSelector((state) => state.app.modals);

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!audio || keyCode !== 27) return;

      dispatch(ToggleAudioModal(false));
    };

    document.addEventListener("keydown", keyHandler);

    return () => document.removeEventListener("keydown", keyHandler);
  });

  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.log(err)
  ); // onNotAllowedOrNot Found

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);

    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;

    const targetContainer = document.getElementById("audio-container");
    targetContainer.appendChild(audio);
  };

  return (
    <div
      className={`fixed left-0 top-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        audio ? "block" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="md:px-17.5 w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark md:py-8 px-8 py-12"
      >
        <div
          id="audio-container"
          className="flex flex-col space-y-8 items-center"
        >
          <AudioRecorder
            showVisualizer={true}
            onRecordingComplete={(blob) => addAudioElement(blob)}
            recorderControls={recorderControls}
            downloadOnSavePress={true}
            downloadFileExtension="mp3"
          />
          <div className="flex flex-row items-center space-x-4 w-full mt-8">
            <button className="w-full bg-primary rounded-lg p-2 text-white hover:bg-opacity-90">
              Send
            </button>
            <button
              onClick={() => {
                dispatch(ToggleAudioModal(false));
              }}
              className="w-full border bg-transparent border-red rounded-lg p-2 text-red"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceRecorder;
