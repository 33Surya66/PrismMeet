import React, { useRef, useState } from "react";

// Heroicons (MIT) SVGs for mic, cam, screen, etc.
const Icon = {
  mic: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19v2m0 0h-3m3 0h3m-3-2a7 7 0 0 1-7-7m14 0a7 7 0 0 1-7 7m0-7v-5a3 3 0 1 1 6 0v5a3 3 0 1 1-6 0z" /></svg>
  ),
  micOff: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 19L5 5m7 7v5a3 3 0 0 1-6 0m6 0a3 3 0 0 0 6 0m-6 0V7a3 3 0 0 1 6 0v5m-6 0a3 3 0 0 1-6 0" /></svg>
  ),
  cam: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14m-3 2a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4z" /></svg>
  ),
  camOff: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9 9v2a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4h0a4 4 0 0 0-4 4v1m-4 4v-4a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4z" /></svg>
  ),
  screen: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v12H4z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 20h8" /></svg>
  ),
  screenOn: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect width="16" height="12" x="4" y="4" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 20h8" /></svg>
  ),
};

const Meeting: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [started, setStarted] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const startMeeting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setStarted(true);
    } catch (err) {
      alert("Could not access camera/mic: " + err);
    }
  };

  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !micOn;
    });
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !camOn;
    });
    setCamOn(!camOn);
  };

  const startScreenShare = async () => {
    if (!localStream) return;
    try {
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const videoTrack = screenStream.getVideoTracks()[0];
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      setScreenSharing(true);
      videoTrack.onended = () => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        setScreenSharing(false);
      };
    } catch (err) {
      alert("Could not share screen: " + err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-wide text-center drop-shadow-lg">PrismMeet - Meeting Room</h1>
      <div className="bg-slate-800/90 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-2xl p-0">
        <div className="w-full flex flex-col items-center justify-center p-6 pb-0">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-80 rounded-2xl bg-slate-900 object-cover border-2 border-slate-400 shadow-lg" />
        </div>
        {/* Control bar */}
        <div className="w-full flex justify-center">
          <div className="relative w-full max-w-md -mt-8 flex justify-center">
            <div className="flex items-center justify-center gap-6 bg-slate-900/90 rounded-full px-8 py-4 shadow-xl border border-slate-700">
              <button
                onClick={toggleMic}
                disabled={!started}
                className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${micOn ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-60`}
                title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micOn ? Icon.mic : Icon.micOff}
              </button>
              <button
                onClick={toggleCam}
                disabled={!started}
                className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 ${camOn ? 'bg-violet-500 hover:bg-violet-400' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-60`}
                title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {camOn ? Icon.cam : Icon.camOff}
              </button>
              <button
                onClick={startScreenShare}
                disabled={!started || screenSharing}
                className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${screenSharing ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'} disabled:opacity-60`}
                title={screenSharing ? 'Sharing Screen' : 'Share Screen'}
              >
                {screenSharing ? Icon.screenOn : Icon.screen}
              </button>
            </div>
          </div>
        </div>
        {/* Start Meeting Button */}
        <div className="flex justify-center w-full mt-8 mb-4">
          <button
            onClick={startMeeting}
            disabled={started}
            className="bg-sky-400 hover:bg-sky-300 text-white rounded-full px-8 py-3 text-xl font-semibold shadow-lg transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {started ? "Meeting Started" : "Start Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Meeting; 