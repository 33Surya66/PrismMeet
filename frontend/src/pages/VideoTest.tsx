import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, Settings } from 'lucide-react';

const VideoTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Enumerate devices on component mount
    enumerateDevices();
  }, []);

  const enumerateDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);
      
      // Set default devices
      const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
      const audioDevices = deviceList.filter(d => d.kind === 'audioinput');
      
      if (videoDevices.length > 0) {
        setSelectedVideoDevice(videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0) {
        setSelectedAudioDevice(audioDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      setError('Failed to enumerate devices');
    }
  };

  const startVideo = async () => {
    try {
      setError(null);
      
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice ? {
          deviceId: { exact: selectedVideoDevice },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        } : true,
        audio: selectedAudioDevice ? {
          deviceId: { exact: selectedAudioDevice },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : true
      };

      console.log('Requesting media with constraints:', constraints);
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setIsPlaying(true);
      }
      
      console.log('Stream started successfully:', {
        videoTracks: newStream.getVideoTracks().length,
        audioTracks: newStream.getAudioTracks().length,
        videoTrackSettings: newStream.getVideoTracks()[0]?.getSettings(),
        audioTrackSettings: newStream.getAudioTracks()[0]?.getSettings()
      });
      
    } catch (err) {
      console.error('Error starting video:', err);
      setError(err instanceof Error ? err.message : 'Failed to start video');
      setIsPlaying(false);
    }
  };

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsPlaying(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('Video track enabled:', videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('Audio track enabled:', audioTrack.enabled);
      }
    }
  };

  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  const audioDevices = devices.filter(d => d.kind === 'audioinput');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-slate-800/90 rounded-3xl shadow-2xl w-full max-w-4xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-3xl font-bold">Video Test</h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Device Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Video Device
            </label>
            <select
              value={selectedVideoDevice}
              onChange={(e) => setSelectedVideoDevice(e.target.value)}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
            >
              {videoDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Audio Device
            </label>
            <select
              value={selectedAudioDevice}
              onChange={(e) => setSelectedAudioDevice(e.target.value)}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
            >
              {audioDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Video Display */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-2xl h-96 rounded-2xl bg-slate-900 object-cover border-2 border-slate-400"
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-2xl">
                <div className="text-center">
                  <Video className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No video stream</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={isPlaying ? stopVideo : startVideo}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {isPlaying ? 'Stop Video' : 'Start Video'}
          </button>
          
          <button
            onClick={toggleVideo}
            disabled={!stream}
            className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
          >
            Toggle Video
          </button>
          
          <button
            onClick={toggleAudio}
            disabled={!stream}
            className="px-6 py-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
          >
            Toggle Audio
          </button>
          
          <button
            onClick={enumerateDevices}
            className="px-6 py-3 rounded-lg font-semibold bg-slate-600 hover:bg-slate-500 text-white transition-colors"
          >
            Refresh Devices
          </button>
        </div>

        {/* Stream Info */}
        {stream && (
          <div className="mt-8 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Stream Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-300">Video Tracks: </span>
                <span className="text-white">{stream.getVideoTracks().length}</span>
              </div>
              <div>
                <span className="text-slate-300">Audio Tracks: </span>
                <span className="text-white">{stream.getAudioTracks().length}</span>
              </div>
              <div>
                <span className="text-slate-300">Video Enabled: </span>
                <span className={stream.getVideoTracks()[0]?.enabled ? 'text-green-400' : 'text-red-400'}>
                  {stream.getVideoTracks()[0]?.enabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-slate-300">Audio Enabled: </span>
                <span className={stream.getAudioTracks()[0]?.enabled ? 'text-green-400' : 'text-red-400'}>
                  {stream.getAudioTracks()[0]?.enabled ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            {stream.getVideoTracks()[0] && (
              <div className="mt-4">
                <h4 className="text-slate-300 font-medium mb-2">Video Track Settings:</h4>
                <pre className="text-xs text-slate-200 bg-slate-800 p-2 rounded overflow-auto">
                  {JSON.stringify(stream.getVideoTracks()[0].getSettings(), null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Device List */}
        <div className="mt-8">
          <h3 className="text-white font-semibold mb-4">Available Devices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-slate-300 font-medium mb-2">Video Devices ({videoDevices.length})</h4>
              <div className="space-y-2">
                {videoDevices.map(device => (
                  <div key={device.deviceId} className="text-sm text-slate-200 bg-slate-700/50 p-2 rounded">
                    <div className="font-medium">{device.label || 'Unknown Camera'}</div>
                    <div className="text-slate-400 text-xs">{device.deviceId}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-slate-300 font-medium mb-2">Audio Devices ({audioDevices.length})</h4>
              <div className="space-y-2">
                {audioDevices.map(device => (
                  <div key={device.deviceId} className="text-sm text-slate-200 bg-slate-700/50 p-2 rounded">
                    <div className="font-medium">{device.label || 'Unknown Microphone'}</div>
                    <div className="text-slate-400 text-xs">{device.deviceId}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTest; 