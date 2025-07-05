import React, { useRef, useState, useEffect, useMemo } from "react";
import { LogOut, XCircle, Settings, Mic, MicOff, Video as VideoIcon, VideoOff, Monitor } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useUser } from '@/context/UserContext';
import { Peer } from 'peerjs';

interface User {
  id?: string;
  name?: string;
  email?: string;
  peerId?: string;
}

interface ChatMessage {
  user: string;
  text: string;
  timestamp: string;
}

interface RemoteParticipant {
  stream: MediaStream;
  user: User;
  camOn: boolean;
  micOn: boolean;
}

interface RemoteScreenShare {
  stream: MediaStream;
  user: User;
}

const PeerJSMeeting: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [started, setStarted] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ user: string; text: string; timestamp: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [remoteParticipants, setRemoteParticipants] = useState<{ [peerId: string]: { stream: MediaStream, user: any, camOn: boolean, micOn: boolean } }>({});
  const [remoteScreenShares, setRemoteScreenShares] = useState<{ [peerId: string]: { stream: MediaStream, user: any } }>({});
  const [peerConnected, setPeerConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  const { user, isLoggedIn } = useUser();
  const { id: meetingIdParam } = useParams();
  const navigate = useNavigate();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const SOCKET_URL = API_URL.replace(/^http:/, 'https:');
  
  // PeerJS instance
  const peerRef = useRef<Peer | null>(null);
  const socketRef = useRef<any>(null);
  const connectionsRef = useRef<{ [peerId: string]: any }>({});
  
  // Generate unique peer ID for this user
  const peerId = useMemo(() => {
    return `${user?.email || 'anonymous'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [user?.email]);

  // Initialize PeerJS
  useEffect(() => {
    if (!meetingIdParam || !isLoggedIn || !user?.email) {
      console.warn('Cannot join meeting - missing requirements');
      return;
    }

    // Initialize PeerJS with better configuration
    const peer = new Peer(peerId, {
      // Use a more reliable PeerJS server or run your own
      host: 'peerjs-server.herokuapp.com',
      port: 443,
      secure: true,
      debug: 3, // Enable debug logging
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          // Add TURN servers for better connectivity (optional)
          // { urls: 'turn:your-turn-server.com:3478', username: 'username', credential: 'password' }
        ]
      }
    });

    peerRef.current = peer;

    // Handle peer connection events
    peer.on('open', (id) => {
      console.log('🔗 PeerJS connected with ID:', id);
      setPeerConnected(true);
      setConnectionStatus('connected');
    });

    peer.on('error', (err) => {
      console.error('❌ PeerJS error:', err);
      setConnectionStatus('error');
      if (err.type === 'peer-unavailable') {
        console.log('Peer unavailable, will retry connection...');
      } else if (err.type === 'network') {
        console.log('Network error, checking connection...');
      }
    });

    peer.on('disconnected', () => {
      console.log('🔌 PeerJS disconnected, attempting to reconnect...');
      setPeerConnected(false);
      setConnectionStatus('connecting');
      peer.reconnect();
    });

    // Handle incoming calls
    peer.on('call', (call) => {
      console.log('📞 Incoming call from:', call.peer);
      
      if (localStream) {
        console.log('📹 Answering call with local stream');
        call.answer(localStream);
        
        call.on('stream', (remoteStream) => {
          console.log('📹 Received remote stream from:', call.peer);
          setRemoteParticipants(prev => ({
            ...prev,
            [call.peer]: {
              stream: remoteStream,
              user: { name: 'Remote User', email: call.peer },
              camOn: true,
              micOn: true
            }
          }));
        });

        call.on('close', () => {
          console.log('📞 Call closed with:', call.peer);
          setRemoteParticipants(prev => {
            const copy = { ...prev };
            delete copy[call.peer];
            return copy;
          });
        });

        call.on('error', (err) => {
          console.error('❌ Call error:', err);
        });
      } else {
        console.log('⚠️ No local stream available, rejecting call');
        call.close();
      }
    });

    // Handle data connections
    peer.on('connection', (conn) => {
      console.log('🔗 Incoming data connection from:', conn.peer);
      connectionsRef.current[conn.peer] = conn;
      
      conn.on('open', () => {
        console.log('🔗 Data connection opened with:', conn.peer);
      });
      
      conn.on('data', (data: any) => {
        console.log('📨 Received data from:', conn.peer, data);
        if (data.type === 'user-info') {
          setRemoteParticipants(prev => ({
            ...prev,
            [conn.peer]: {
              ...prev[conn.peer],
              user: data.user
            }
          }));
        } else if (data.type === 'mic-toggle') {
          setRemoteParticipants(prev => ({
            ...prev,
            [conn.peer]: {
              ...prev[conn.peer],
              micOn: data.micOn
            }
          }));
        } else if (data.type === 'cam-toggle') {
          setRemoteParticipants(prev => ({
            ...prev,
            [conn.peer]: {
              ...prev[conn.peer],
              camOn: data.camOn
            }
          }));
        }
      });

      conn.on('close', () => {
        console.log('🔗 Data connection closed with:', conn.peer);
        delete connectionsRef.current[conn.peer];
      });

      conn.on('error', (err) => {
        console.error('❌ Data connection error:', err);
        delete connectionsRef.current[conn.peer];
      });
    });

    // Connect to socket.io for signaling
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      socket.emit('join-meeting', { 
        meetingId: meetingIdParam, 
        user: { 
          name: user.name || user.email || 'Anonymous',
          email: user.email,
          id: user.id,
          peerId: peerId
        } 
      });
    });

    socket.on('new-participant', ({ socketId, user: remoteUser }) => {
      console.log('🟢 New participant:', remoteUser);
      if (remoteUser.peerId && remoteUser.peerId !== peerId) {
        // Add a small delay to ensure PeerJS is ready
        setTimeout(() => {
          callPeer(remoteUser.peerId, remoteUser);
        }, 1000);
      }
    });

    socket.on('participant-left', ({ socketId }) => {
      console.log('🔴 Participant left:', socketId);
      // Clean up connections
      Object.keys(connectionsRef.current).forEach(peerId => {
        if (connectionsRef.current[peerId]) {
          connectionsRef.current[peerId].close();
          delete connectionsRef.current[peerId];
        }
      });
      
      setRemoteParticipants(prev => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    socket.on('chat-message', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      console.log('🧹 Cleaning up PeerJS and socket connections');
      
      // Close all peer connections
      Object.values(connectionsRef.current).forEach(conn => {
        if (conn.open) {
          conn.close();
        }
      });
      connectionsRef.current = {};
      
      // Stop all media streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      
      // Destroy peer and disconnect socket
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [meetingIdParam, isLoggedIn, user, peerId]);

  // Call a peer
  const callPeer = (remotePeerId: string, remoteUser: any) => {
    if (!peerRef.current || !localStream) {
      console.log('⚠️ Cannot call peer - missing peer or local stream');
      return;
    }
    
    console.log('📞 Calling peer:', remotePeerId);
    
    try {
      const call = peerRef.current.call(remotePeerId, localStream);
      
      call.on('stream', (remoteStream) => {
        console.log('📹 Received stream from:', remotePeerId);
        setRemoteParticipants(prev => ({
          ...prev,
          [remotePeerId]: {
            stream: remoteStream,
            user: remoteUser,
            camOn: true,
            micOn: true
          }
        }));
      });

      call.on('close', () => {
        console.log('📞 Call closed with:', remotePeerId);
        setRemoteParticipants(prev => {
          const copy = { ...prev };
          delete copy[remotePeerId];
          return copy;
        });
      });

      call.on('error', (err) => {
        console.error('❌ Call error with:', remotePeerId, err);
        setRemoteParticipants(prev => {
          const copy = { ...prev };
          delete copy[remotePeerId];
          return copy;
        });
      });

      // Send user info via data connection
      try {
        const conn = peerRef.current.connect(remotePeerId);
        connectionsRef.current[remotePeerId] = conn;
        
        conn.on('open', () => {
          console.log('🔗 Data connection opened with:', remotePeerId);
          conn.send({
            type: 'user-info',
            user: { 
              name: user.name || user.email || 'Anonymous',
              email: user.email 
            }
          });
        });

        conn.on('close', () => {
          console.log('🔗 Data connection closed with:', remotePeerId);
          delete connectionsRef.current[remotePeerId];
        });

        conn.on('error', (err) => {
          console.error('❌ Data connection error with:', remotePeerId, err);
          delete connectionsRef.current[remotePeerId];
        });
      } catch (connErr) {
        console.error('❌ Failed to create data connection with:', remotePeerId, connErr);
      }
    } catch (callErr) {
      console.error('❌ Failed to call peer:', remotePeerId, callErr);
    }
  };

  // Start meeting
  const startMeeting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setStarted(true);
      console.log('🎥 Meeting started with local stream');
    } catch (err) {
      alert("Could not access camera/mic: " + (err && err.message ? err.message : err));
    }
  };

  // Toggle mic
  const toggleMic = () => {
    if (!localStream) return;
    const newMicState = !micOn;
    localStream.getAudioTracks().forEach(track => {
      track.enabled = newMicState;
    });
    setMicOn(newMicState);
    
    // Broadcast mic state to all connected peers
    Object.values(connectionsRef.current).forEach(conn => {
      if (conn.open) {
        conn.send({
          type: 'mic-toggle',
          micOn: newMicState
        });
      }
    });
  };

  // Toggle camera
  const toggleCam = () => {
    if (!localStream) return;
    const newCamState = !camOn;
    localStream.getVideoTracks().forEach(track => {
      track.enabled = newCamState;
    });
    setCamOn(newCamState);
    
    // Broadcast cam state to all connected peers
    Object.values(connectionsRef.current).forEach(conn => {
      if (conn.open) {
        conn.send({
          type: 'cam-toggle',
          camOn: newCamState
        });
      }
    });
  };

  // Screen share
  const startScreenShare = async () => {
    if (!localStream) {
      alert('You must start the meeting before sharing your screen.');
      return;
    }
    try {
      const sStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { displaySurface: 'monitor', cursor: 'always' },
        audio: false
      });
      setScreenStream(sStream);
      setScreenSharing(true);
      
      sStream.getVideoTracks()[0].onended = () => {
        setScreenSharing(false);
        setScreenStream(null);
      };
    } catch (err) {
      alert('Could not share screen: ' + err);
    }
  };

  // Send chat
  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    
    const message = {
      user: user.name || user.email || 'Anonymous',
      text: chatInput,
      timestamp: new Date().toISOString()
    };
    
    socketRef.current.emit('chat-message', {
      meetingId: meetingIdParam,
      user: { 
        name: user.name || user.email || 'Anonymous',
        email: user.email 
      },
      text: chatInput
    });
    
    setChatInput('');
  };

  // Update local video when stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Update screen video when stream changes
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  if (!meetingIdParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-black">
        <div className="bg-slate-800/90 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Meeting Selected</h2>
          <p className="text-slate-300 mb-4">Please join or create a meeting first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-slate-800/90 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-5xl p-0">
        {/* Header */}
        <div className="w-full flex flex-col items-center mb-6">
          <h1 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-wide text-center drop-shadow-lg">
            PrismMeet - PeerJS Meeting
          </h1>
          <div className="w-full max-w-2xl border-b border-slate-600 mb-4"></div>
          <div className="w-full max-w-2xl bg-slate-700/80 rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-slate-200 text-base font-mono">
              <span className="font-semibold text-slate-300">Meeting ID:</span> <span className="select-all">{meetingIdParam}</span>
            </div>
            <div className="text-slate-200 text-base font-mono">
              <span className="font-semibold text-slate-300">Your Peer ID:</span> <span className="select-all">{peerId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">WebRTC:</span>
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className={`text-sm ${
                connectionStatus === 'connected' ? 'text-green-400' : 
                connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Error'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">Participants:</span>
              <span className="text-sm text-slate-200">
                {Object.keys(remoteParticipants).length + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="w-full flex flex-col items-center justify-center p-6 pb-0">
          <div className="w-full flex flex-wrap gap-4 justify-center items-center">
            {/* Local video */}
            <div className="flex flex-col items-center w-72 h-80">
              <span className="text-white text-lg font-semibold mb-2">Camera (You)</span>
              {camOn ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-72 h-56 rounded-2xl bg-slate-900 object-cover border-2 border-slate-400 shadow-lg" />
              ) : (
                <div className="w-72 h-56 rounded-2xl bg-slate-900 flex items-center justify-center border-2 border-slate-400 shadow-lg">
                  <img src="/logo.png" alt="Camera Off" className="w-24 h-24 opacity-60" />
                </div>
              )}
              <span className="text-slate-300 mt-2 text-base font-semibold">{user.name || user.email || 'You'}</span>
              <span className={`mt-1 text-xs ${micOn ? 'text-green-400' : 'text-red-400'}`}>{micOn ? 'Mic On' : 'Mic Off'}</span>
              <span className={`mt-1 text-xs ${camOn ? 'text-green-400' : 'text-red-400'}`}>{camOn ? 'Camera On' : 'Camera Off'}</span>
            </div>

            {/* Remote videos */}
            {Object.entries(remoteParticipants).map(([peerId, { stream, user: remoteUser, camOn, micOn }]) => (
              <div key={peerId} className="flex flex-col items-center w-72 h-80">
                <span className="text-white text-lg font-semibold mb-2">{remoteUser?.name || remoteUser?.email || 'Participant'}</span>
                {camOn !== false ? (
                  <video
                    autoPlay
                    playsInline
                    className="w-72 h-56 rounded-2xl bg-slate-900 object-cover border-2 border-blue-400 shadow-lg"
                    ref={el => {
                      if (el && stream) el.srcObject = stream;
                    }}
                  />
                ) : (
                  <div className="w-72 h-56 rounded-2xl bg-slate-900 flex items-center justify-center border-2 border-blue-400 shadow-lg">
                    <img src="/logo.png" alt="Camera Off" className="w-24 h-24 opacity-60" />
                  </div>
                )}
                <span className="text-slate-300 mt-2 text-base font-semibold">{remoteUser?.name || remoteUser?.email || peerId}</span>
                <span className={`mt-1 text-xs ${micOn ? 'text-green-400' : 'text-red-400'}`}>{micOn ? 'Mic On' : 'Mic Off'}</span>
                <span className={`mt-1 text-xs ${camOn ? 'text-green-400' : 'text-red-400'}`}>{camOn ? 'Camera On' : 'Camera Off'}</span>
              </div>
            ))}

            {/* Screen share */}
            {screenSharing && screenStream && (
              <div className="flex flex-col items-center w-72 h-80">
                <span className="text-white text-lg font-semibold mb-2">Screen Share (You)</span>
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-72 h-56 rounded-2xl bg-slate-900 object-cover border-2 border-amber-400 shadow-lg"
                />
                <span className="text-slate-300 mt-2 text-base font-semibold">{user.name || user.email || 'You'}</span>
                <span className="mt-1 text-xs text-amber-400">Screen Sharing</span>
              </div>
            )}
          </div>
        </div>

        {/* Control Bar */}
        <div className="w-full flex justify-center items-center gap-6 py-6 bg-transparent">
          <button
            onClick={startMeeting}
            disabled={started}
            className="bg-sky-400 hover:bg-sky-300 text-white rounded-full px-8 py-3 text-xl font-semibold shadow-lg transition-colors disabled:opacity-60"
          >
            {started ? "Meeting Started" : "Start Meeting"}
          </button>
          
          <button
            onClick={toggleMic}
            disabled={!started}
            className={`group p-3 rounded-full transition-colors ${micOn ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-60`}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          
          <button
            onClick={toggleCam}
            disabled={!started}
            className={`group p-3 rounded-full transition-colors ${camOn ? 'bg-violet-500 hover:bg-violet-400' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-60`}
          >
            {camOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          
          <button
            onClick={startScreenShare}
            disabled={!started || screenSharing}
            className={`group p-3 rounded-full transition-colors ${screenSharing ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'} disabled:opacity-60`}
          >
            <Monitor className="w-6 h-6" />
          </button>
          
          <button onClick={() => navigate('/')} className="p-3 rounded-full bg-slate-700 hover:bg-red-500 text-white transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Section */}
        <div className="w-full max-w-md mx-auto p-6">
          <div className="bg-slate-800 rounded-2xl shadow-xl flex flex-col">
            <div className="p-4 border-b border-slate-700 text-white font-bold text-lg">Chat</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: '200px' }}>
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, i) => {
                  const isMe = msg.user === (user.name || user.email);
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'}`}>
                        <div className="text-xs font-semibold text-blue-300 mb-1">{msg.user}</div>
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 text-center">No messages yet. Start the conversation!</div>
              )}
            </div>
            <form onSubmit={sendChat} className="p-4 border-t border-slate-700 flex gap-2">
              <input
                className="flex-1 rounded bg-slate-700 text-white px-3 py-2 outline-none"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerJSMeeting; 