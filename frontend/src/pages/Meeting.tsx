import React, { useRef, useState, useEffect, useMemo } from "react";
import { LogOut, XCircle, Settings, Mic, MicOff, Video as VideoIcon, VideoOff, Monitor, Languages } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar";
import { io } from 'socket.io-client';

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
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [started, setStarted] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [aiNotes, setAiNotes] = useState('');
  const [aiListening, setAiListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [notesSaved, setNotesSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start: undefined,
    end: undefined,
    location: '',
    participants: '', // comma-separated emails for now
  });
  const { id: meetingIdParam } = useParams();
  const [showJoinModal, setShowJoinModal] = useState(!meetingIdParam);
  const [joinId, setJoinId] = useState('');
  const [scheduledMeetingId, setScheduledMeetingId] = useState<string | null>(null);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ user: string; text: string; timestamp: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef<any>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [ideaInput, setIdeaInput] = useState("");
  const [ideas, setIdeas] = useState<any[]>([]);
  const [showIdeas, setShowIdeas] = useState(false);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [ideasMode, setIdeasMode] = useState(false);
  const [structuredDoc, setStructuredDoc] = useState<string | null>(null);
  const [mom, setMom] = useState<string | null>(null);
  const [momLoading, setMomLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  // WebRTC: remote streams and peer connections
  const [remoteParticipants, setRemoteParticipants] = useState<{ [socketId: string]: { stream: MediaStream, user: any, camOn: boolean, micOn: boolean } }>({});
  const peersRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});

  // Memoize user object so it is stable across renders
  const user: any = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      const parsed = userStr ? JSON.parse(userStr) : {};
      return parsed;
    } catch {
      return {};
    }
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const SOCKET_URL = API_URL.replace(/^http:/, 'https:');

  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    // Example public TURN server (for demo/testing only; use your own for production)
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }
  ];

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const startMeeting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setStarted(true);
    } catch (err) {
      alert("Could not access camera/mic: " + (err && err.message ? err.message : err));
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
    console.log('Share screen button clicked');
    if (!localStream) {
      alert('You must start the meeting (enable camera/mic) before sharing your screen.');
      return;
    }
    if (!('getDisplayMedia' in navigator.mediaDevices)) {
      alert('Screen sharing is not supported in this browser or context.');
      console.error('getDisplayMedia not available on navigator.mediaDevices');
      return;
    }
    try {
      // Always request the entire desktop
      const sStream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: {
          displaySurface: 'monitor', // Prefer full desktop
          cursor: 'always',
        },
        audio: false
      });
      setScreenStream(sStream);
      setScreenSharing(true);
      sStream.getVideoTracks()[0].onended = () => {
        setScreenSharing(false);
        setScreenStream(null);
      };
      console.log('Screen sharing started');
    } catch (err) {
      alert('Could not share screen: ' + err);
      console.error('Screen sharing error:', err);
    }
  };

  // AI Note Taker: Start/Stop Speech Recognition
  const startAINoteTaker = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      setAiNotes(transcript);
    };
    recognition.onerror = (event: any) => {
      alert('Speech recognition error: ' + event.error);
      setAiListening(false);
    };
    recognition.onend = () => {
      // Auto-restart if still listening
      if (aiListening) {
        recognition.start();
      } else {
        setAiListening(false);
      }
    };
    recognition.start();
    recognitionRef.current = recognition;
    setAiListening(true);
  };

  const stopAINoteTaker = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setAiListening(false);
  };

  // Periodically send notes to backend while listening
  useEffect(() => {
    if (!aiListening) return;
    const interval = setInterval(() => {
      if (aiNotes.trim()) {
        fetch(`${API_URL}/api/ai/${meetingIdParam}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: aiNotes, speaker: user.name || 'Unknown' }),
        })
          .then(res => res.json())
          .then(() => setNotesSaved(true))
          .catch(() => {});
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [aiListening, aiNotes, user.name]);

  // Reset notesSaved indicator after a short delay
  useEffect(() => {
    if (notesSaved) {
      const t = setTimeout(() => setNotesSaved(false), 1200);
      return () => clearTimeout(t);
    }
  }, [notesSaved]);

  // Fetch meetings on mount
  useEffect(() => {
    fetch(`${API_URL}/api/meetings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMeetings(data);
        } else {
          setMeetings([]); // fallback if not array
        }
      })
      .catch(() => setMeetings([]));
  }, []);

  // Fetch meeting details if meetingIdParam is present
  useEffect(() => {
    if (!meetingIdParam) return;
    setMeetingLoading(true);
    setMeetingError(null);
    fetch(`${API_URL}/api/meetings/${meetingIdParam}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => {
        if (res.status === 401) {
          setMeetingError('You must be logged in to view full meeting details.');
          setMeetingDetails(null);
          setMeetingLoading(false);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setMeetingDetails(data);
        }
        setMeetingLoading(false);
      })
      .catch(() => {
        setMeetingError('Failed to load meeting');
        setMeetingLoading(false);
      });
  }, [meetingIdParam, API_URL]);

  // Handle form submit
  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_URL}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        start_time: form.start,
        end_time: form.end,
        location: form.location,
        participants: form.participants.split(',').map((s) => s.trim()),
      }),
    })
      .then(res => res.json())
      .then((meeting) => {
        setMeetings([meeting, ...meetings]);
        setShowScheduleForm(false);
        setForm({ title: '', description: '', start: undefined, end: undefined, location: '', participants: '' });
        setScheduledMeetingId(meeting.id);
      });
  };

  const generateInstantMeeting = () => {
    fetch(`${API_URL}/api/meetings/instant`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(meeting => {
        setScheduledMeetingId(meeting.id);
        setShowScheduleForm(false);
      });
  };

  // Connect to socket.io and join meeting room
  useEffect(() => {
    if (!meetingIdParam || !user) {
      console.warn('No meetingIdParam or user:', { meetingIdParam, user });
      return;
    }
    if (socketRef.current) return;
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    let initialMessages: any[] = [];
    console.log('Joining meeting:', { meetingId: meetingIdParam, user });
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    socket.emit('join-meeting', { meetingId: meetingIdParam, user });

    const handleMessage = (msg: any) => {
      console.log('Received chat-message:', msg);
      if (!historyLoaded && msg.timestamp) {
        initialMessages.push(msg);
      } else {
        setChatMessages((prev) => Array.isArray(prev) ? [...prev, msg] : [msg]);
      }
    };

    socket.on('chat-message', handleMessage);

    // After a short delay, set the initial history and mark as loaded
    setTimeout(() => {
      if (!historyLoaded && initialMessages.length > 0) {
        setChatMessages(initialMessages);
        setHistoryLoaded(true);
        initialMessages = [];
      } else if (!historyLoaded) {
        setHistoryLoaded(true);
      }
    }, 500);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setHistoryLoaded(false);
    };
  }, [meetingIdParam]); // Remove user from dependencies

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Chat send handler
  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      alert('You must be logged in to send a message.');
      return;
    }
    if (!chatInput.trim() || !socketRef.current) return;
    console.log('Sending chat-message:', { meetingId: meetingIdParam, user, text: chatInput });
    socketRef.current.emit('chat-message', {
      meetingId: meetingIdParam,
      user: { name: user.name || user.email || 'Anonymous', email: user.email || '' },
      text: chatInput
    });
    setChatInput('');
  };

  // Fetch all ideas for this meeting
  const fetchIdeas = async () => {
    setIdeasLoading(true);
    setIdeasError(null);
    try {
      const res = await fetch(`${API_URL}/api/docs/${meetingIdParam}/ideas`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setIdeas(data);
      else setIdeas([]);
    } catch (e) {
      setIdeasError("Failed to load ideas");
    }
    setIdeasLoading(false);
  };

  // Post a new idea
  const postIdea = async () => {
    if (!ideaInput.trim()) return;
    try {
      await fetch(`${API_URL}/api/docs/${meetingIdParam}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ idea: ideaInput }),
      });
      setIdeaInput("");
      fetchIdeas();
    } catch (e) {
      alert("Failed to post idea");
    }
  };

  // Trigger Gemini structuring (stub)
  const triggerIdeasMode = async () => {
    setIdeasMode(true);
    setStructuredDoc(null);
    try {
      const res = await fetch(`${API_URL}/api/docs/${meetingIdParam}/structure`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.structured_doc) setStructuredDoc(data.structured_doc);
      else setStructuredDoc("(Gemini structuring not implemented yet)");
    } catch (e) {
      setStructuredDoc("(Failed to structure document)");
    }
  };

  // Fetch MoM (stub)
  const fetchMoM = async () => {
    setMomLoading(true);
    setMom(null);
    try {
      const res = await fetch(`${API_URL}/api/docs/${meetingIdParam}/minutes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.minutes) setMom(data.minutes);
      else setMom("No minutes available");
    } catch (e) {
      setMom("Failed to load minutes");
    }
    setMomLoading(false);
  };

  // Host detection: compare user.id to meetingDetails.host_id (if available)
  const isHost = useMemo(() => {
    if (!meetingDetails || !user) return false;
    // Prefer user.id and meetingDetails.host_id if available
    if (user.id && meetingDetails.host_id) {
      return String(user.id) === String(meetingDetails.host_id);
    }
    // Fallback: try matching email if host_email is available
    if (user.email && meetingDetails.host_email) {
      return user.email === meetingDetails.host_email;
    }
    return false;
  }, [meetingDetails, user]);

  // --- WebRTC Multi-Participant Logic ---
  useEffect(() => {
    if (!socketRef.current || !localStream) return;
    const socket = socketRef.current;

    // Helper: create a new peer connection
    const createPeerConnection = (socketId: string, remoteUser: any, isInitiator: boolean) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      // Add local tracks
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('signal', {
            meetingId: meetingIdParam,
            to: socketId,
            from: socket.id,
            data: { type: 'ice-candidate', candidate: event.candidate }
          });
        }
      };
      // Remote stream
      pc.ontrack = (event) => {
        setRemoteParticipants(prev => ({
          ...prev,
          [socketId]: {
            stream: event.streams[0],
            user: remoteUser,
            camOn: true, // Assume on, update via signaling if needed
            micOn: true
          }
        }));
      };
      // Remove remote stream on close
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
          setRemoteParticipants(prev => {
            const copy = { ...prev };
            delete copy[socketId];
            return copy;
          });
        }
      };
      peersRef.current[socketId] = pc;
      return pc;
    };

    // Handle new participant
    const handleNewParticipant = ({ socketId, user: remoteUser }) => {
      if (peersRef.current[socketId]) return; // already connected
      const pc = createPeerConnection(socketId, remoteUser, true);
      // Initiator: create offer
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socket.emit('signal', {
          meetingId: meetingIdParam,
          to: socketId,
          from: socket.id,
          data: { type: 'offer', sdp: offer }
        });
      });
    };

    // Handle signal
    const handleSignal = async ({ from, data }) => {
      let pc = peersRef.current[from];
      if (!pc) pc = createPeerConnection(from, {}, false);
      if (data.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal', {
          meetingId: meetingIdParam,
          to: from,
          from: socket.id,
          data: { type: 'answer', sdp: answer }
        });
      } else if (data.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === 'ice-candidate') {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) { /* ignore */ }
      }
    };

    // Handle participant left
    const handleParticipantLeft = ({ socketId }) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
        setRemoteParticipants(prev => {
          const copy = { ...prev };
          delete copy[socketId];
          return copy;
        });
      }
    };

    socket.on('new-participant', handleNewParticipant);
    socket.on('signal', handleSignal);
    socket.on('participant-left', handleParticipantLeft);

    // On mount, announce self to others (for late joiners)
    socket.emit('join-meeting', { meetingId: meetingIdParam, user });

    return () => {
      socket.off('new-participant', handleNewParticipant);
      socket.off('signal', handleSignal);
      socket.off('participant-left', handleParticipantLeft);
      // Close all peer connections
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
      setRemoteParticipants({});
    };
  }, [localStream, meetingIdParam, user]);

  if (showJoinModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-black">
        <form onSubmit={async e => {
          e.preventDefault();
          if (joinId) {
            const token = localStorage.getItem('token');
            console.log('Attempting to join meeting with ID:', joinId);
            const res = await fetch(`${API_URL}/api/meetings/${joinId}/join`, {
              method: 'POST',
              headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
              }
            });
            console.log('Join response status:', res.status);
            if (res.ok) {
              console.log('Navigating to', `/meeting/${joinId}`);
              navigate(`/meeting/${joinId}`);
            } else {
              alert('You must be logged in to join a meeting.');
            }
          }
        }} className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center">
          <h2 className="text-xl font-bold text-white mb-4">Join a Meeting</h2>
          <input type="text" required placeholder="Enter Meeting ID" value={joinId} onChange={e => setJoinId(e.target.value)} className="w-full mb-4 p-2 rounded" />
          <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg mb-2">Join</button>
          <div className="text-slate-400 my-2">or</div>
          <button type="button" className="px-6 py-2 bg-green-500 text-white rounded-lg mb-2" onClick={() => setShowScheduleForm(true)}>Schedule a Meeting</button>
          <button type="button" className="px-6 py-2 bg-amber-500 text-white rounded-lg mb-2" onClick={() => setShowScheduleForm(true)}>Generate Meeting Link (Scheduled)</button>
          <button type="button" className="px-6 py-2 bg-purple-500 text-white rounded-lg" onClick={generateInstantMeeting}>Generate Instant Meeting Link</button>
        </form>
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form onSubmit={handleSchedule} className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Schedule a Meeting</h2>
              <input type="text" required placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full mb-2 p-2 rounded" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full mb-2 p-2 rounded" />
              <div className="flex gap-2 mb-2">
                <Calendar selected={form.start} onSelect={date => setForm(f => ({ ...f, start: date }))} />
                <Calendar selected={form.end} onSelect={date => setForm(f => ({ ...f, end: date }))} />
              </div>
              <input type="text" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full mb-2 p-2 rounded" />
              <input type="text" placeholder="Participants (comma-separated emails)" value={form.participants} onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} className="w-full mb-2 p-2 rounded" />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowScheduleForm(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">Schedule</button>
              </div>
            </form>
          </div>
        )}
        {scheduledMeetingId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center">
              <h2 className="text-xl font-bold text-white mb-4">Meeting Link Generated!</h2>
              <div className="text-white mb-2">Meeting ID:</div>
              <div className="bg-slate-700 text-green-300 font-mono px-4 py-2 rounded mb-4 select-all">{scheduledMeetingId}</div>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-2"
                onClick={() => {
                  navigate(`/meeting/${scheduledMeetingId}`);
                }}
              >Copy Meeting Link</button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg mb-2" onClick={() => navigate(`/meeting/${scheduledMeetingId}`)}>Join Meeting</button>
              <button className="px-4 py-2 bg-slate-600 text-white rounded-lg" onClick={() => setScheduledMeetingId(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (meetingIdParam) {
    if (meetingLoading) {
      return <div className="min-h-screen flex items-center justify-center text-white text-xl">Loading meeting...</div>;
    }
    if (meetingError) {
      return <div className="min-h-screen flex items-center justify-center text-red-400 text-xl">{meetingError}</div>;
    }
    if (meetingDetails) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex flex-row items-start justify-center py-12 px-4 mt-20">
          {/* Main meeting content (left) */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-wide text-center drop-shadow-lg">{meetingDetails.title || 'PrismMeet - Meeting Room'}</h1>
            {/* Add divider and info panel below header */}
            <div className="w-full flex flex-col items-center mb-6">
              <div className="w-full max-w-2xl border-b border-slate-600 mb-4"></div>
              <div className="w-full max-w-2xl bg-slate-700/80 rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="text-slate-200 text-base font-mono">
                  <span className="font-semibold text-slate-300">Meeting ID:</span> <span className="select-all">{meetingDetails.id}</span>
                </div>
                <div className="text-slate-200 text-base truncate">
                  <span className="font-semibold text-slate-300">Participants:</span> {(meetingDetails.participants || []).join(', ')}
                </div>
              </div>
            </div>
            <div className="bg-slate-800/90 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-5xl p-0">
              {/* AI Note Taker Panel */}
              <div className="w-full flex flex-row justify-end items-center px-6 pt-6">
                <button
                  onClick={aiListening ? stopAINoteTaker : startAINoteTaker}
                  className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors shadow ${aiListening ? 'bg-amber-500 hover:bg-amber-400' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  {aiListening ? 'Stop AI Note Taker' : 'Start AI Note Taker'}
                </button>
              </div>
              {/* AI Notes Display */}
              <div className="w-full px-6 pb-2">
                <div className="bg-slate-900/80 rounded-xl p-4 mt-4 mb-2 min-h-[64px] text-white text-base font-mono whitespace-pre-wrap relative">
                  <span className="text-blue-300 font-semibold">AI Notes:</span>
                  <br />
                  {aiNotes || <span className="text-slate-400">(Your spoken words will appear here...)</span>}
                  {notesSaved && (
                    <span className="absolute top-2 right-4 text-green-400 text-xs">Notes saved</span>
                  )}
                </div>
              </div>
              <div className="w-full flex flex-col items-center justify-center p-6 pb-0">
                <div className={`w-full flex flex-wrap gap-4 justify-center items-center aspect-video`}>
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
                  {Object.entries(remoteParticipants).map(([socketId, { stream, user: remoteUser, camOn, micOn }]) => (
                    <div key={socketId} className="flex flex-col items-center w-72 h-80">
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
                      <span className="text-slate-300 mt-2 text-base font-semibold">{remoteUser?.name || remoteUser?.email || socketId}</span>
                      <span className={`mt-1 text-xs ${micOn ? 'text-green-400' : 'text-red-400'}`}>{micOn ? 'Mic On' : 'Mic Off'}</span>
                      <span className={`mt-1 text-xs ${camOn ? 'text-green-400' : 'text-red-400'}`}>{camOn ? 'Camera On' : 'Camera Off'}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Video Grid Placeholder */}
              <div className="w-full flex-1 flex items-center justify-center bg-black/10 rounded-2xl my-4">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {/* Local and remote video elements will go here */}
                  {/* For now, show local video and screen share as before */}
                  {/* ...existing video code... */}
                </div>
              </div>
              {/* Control Bar */}
              <div className="w-full flex justify-center items-center gap-6 py-6 bg-transparent">
                {/* Mic toggle */}
                <button
                  onClick={toggleMic}
                  disabled={!started}
                  className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${micOn ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-60`}
                  title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                {/* Camera toggle */}
                <button
                  onClick={toggleCam}
                  disabled={!started}
                  className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 ${camOn ? 'bg-violet-500 hover:bg-violet-400' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-60`}
                  title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  {camOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
                {/* Screen share */}
                <button
                  onClick={startScreenShare}
                  disabled={!started || screenSharing}
                  className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${screenSharing ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'} disabled:opacity-60`}
                  title={screenSharing ? 'Sharing Screen' : 'Share Screen'}
                >
                  <Monitor className="w-6 h-6" />
                </button>
                {/* Disconnect/Leave */}
                <button onClick={() => {/* leave logic */}} className="p-3 rounded-full bg-slate-700 hover:bg-red-500 text-white transition-colors" title="Leave Meeting">
                  <LogOut className="w-6 h-6" />
                </button>
                {/* End Meeting (host only) */}
                {isHost && (
                  <button onClick={() => setShowEndConfirm(true)} className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors" title="End Meeting">
                    <XCircle className="w-6 h-6" />
                  </button>
                )}
                {/* Settings */}
                <button onClick={() => setShowSettings(true)} className="p-3 rounded-full bg-slate-700 hover:bg-blue-500 text-white transition-colors" title="Settings">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
              {/* Settings Modal */}
              {showSettings && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                    <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
                    {/* Profile, language, audio/video settings go here */}
                    <button onClick={() => setShowSettings(false)} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg">Close</button>
                  </div>
                </div>
              )}
              {/* End Meeting Modal */}
              {showEndConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <h2 className="text-xl font-bold text-white mb-4">End Meeting?</h2>
                    <p className="text-gray-300 mb-6">This will disconnect all participants.</p>
                    <button onClick={() => { setShowEndConfirm(false); navigate('/'); }} className="px-6 py-2 bg-red-600 text-white rounded-lg mr-4">End Meeting</button>
                    <button onClick={() => setShowEndConfirm(false)} className="px-6 py-2 bg-slate-600 text-white rounded-lg">Cancel</button>
                  </div>
                </div>
              )}
              {/* Schedule Meeting Button */}
              <div className="flex justify-center w-full mt-4 mb-2">
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="bg-green-500 hover:bg-green-400 text-white rounded-full px-6 py-2 text-lg font-semibold shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Schedule Meeting
                </button>
              </div>
              {/* Meeting Scheduling Form Modal */}
              {showScheduleForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <form onSubmit={handleSchedule} className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                    <h2 className="text-xl font-bold text-white mb-4">Schedule a Meeting</h2>
                    <input type="text" required placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full mb-2 p-2 rounded" />
                    <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full mb-2 p-2 rounded" />
                    <div className="flex gap-2 mb-2">
                      <Calendar selected={form.start} onSelect={date => setForm(f => ({ ...f, start: date }))} />
                      <Calendar selected={form.end} onSelect={date => setForm(f => ({ ...f, end: date }))} />
                    </div>
                    <input type="text" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full mb-2 p-2 rounded" />
                    <input type="text" placeholder="Participants (comma-separated emails)" value={form.participants} onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} className="w-full mb-2 p-2 rounded" />
                    <div className="flex justify-end gap-2 mt-4">
                      <button type="button" onClick={() => setShowScheduleForm(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">Schedule</button>
                    </div>
                  </form>
                </div>
              )}
              {/* Modal to show meeting ID after scheduling */}
              {scheduledMeetingId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center">
                    <h2 className="text-xl font-bold text-white mb-4">Meeting Scheduled!</h2>
                    <div className="text-white mb-2">Meeting ID:</div>
                    <div className="bg-slate-700 text-green-300 font-mono px-4 py-2 rounded mb-4 select-all">{scheduledMeetingId}</div>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-2"
                      onClick={() => {
                        navigate(`/meeting/${scheduledMeetingId}`);
                      }}
                    >Copy Meeting Link</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg mb-2" onClick={() => navigate(`/meeting/${scheduledMeetingId}`)}>Join Meeting</button>
                    <button className="px-4 py-2 bg-slate-600 text-white rounded-lg" onClick={() => setScheduledMeetingId(null)}>Close</button>
                  </div>
                </div>
              )}
              {/* Meetings List */}
              <div className="w-full max-w-3xl mx-auto mt-8">
                <h2 className="text-2xl text-white font-bold mb-4">Your Meetings</h2>
                <ul className="space-y-4">
                  {meetings.map((m: any) => (
                    <li key={m.id} className="bg-slate-700 rounded-xl p-4 text-white">
                      <div className="font-semibold text-lg">{m.title}</div>
                      <div className="text-sm text-slate-300">{m.description}</div>
                      <div className="text-sm">{m.start_time} - {m.end_time}</div>
                      <div className="text-sm">Location: {m.location}</div>
                      <div className="text-sm">Participants: {(m.participants || []).join(', ')}</div>
                      <div className="text-xs text-slate-400 mt-2">Meeting ID: <span className="font-mono">{m.id}</span></div>
                      <button
                        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-lg"
                        onClick={async () => {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`${API_URL}/api/meetings/${m.id}/join`, {
                            method: 'POST',
                            headers: {
                              Authorization: token ? `Bearer ${token}` : '',
                              'Content-Type': 'application/json'
                            }
                          });
                          if (res.ok) {
                            navigate(`/meeting/${m.id}`);
                          } else {
                            alert('You must be logged in to join a meeting.');
                          }
                        }}
                      >Join</button>
                    </li>
                  ))}
                </ul>
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
          {/* Sidebar (right) */}
          <div className="flex flex-col ml-8 w-full max-w-xs">
            {/* Chat Section */}
            <div className="bg-slate-800 rounded-2xl shadow-xl flex flex-col mb-4">
              <div className="p-4 border-b border-slate-700 text-white font-bold text-lg">Chat</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: '40vh' }}>
                {Array.isArray(chatMessages) && chatMessages.length > 0 ? (
                  chatMessages.map((msg, i) => {
                    const isMe = msg.user === (user.name || user.email);
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-lg ${isMe ? 'bg-blue-500 text-white self-end' : 'bg-slate-700 text-white self-start'}`}>
                          <div className="text-xs font-semibold text-blue-300 mb-1">{msg.user}</div>
                          <div>{msg.text}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 text-center">No messages yet. Start the conversation!</div>
                )}
                <div ref={chatEndRef} />
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
            {/* Ideas & Features Section */}
            <div className="bg-slate-900 rounded-2xl shadow-xl p-4">
              <div className="text-white font-bold text-lg mb-2">Ideas & Features</div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded bg-slate-700 text-white px-3 py-2 outline-none"
                    placeholder="Share an idea..."
                    value={ideaInput}
                    onChange={e => setIdeaInput(e.target.value)}
                  />
                  <button onClick={postIdea} className="bg-green-500 text-white px-4 py-2 rounded">Post</button>
                </div>
                <button onClick={() => { fetchIdeas(); setShowIdeas(v => !v); }} className="bg-blue-500 text-white px-4 py-2 rounded">
                  {showIdeas ? "Hide" : "View"} Document
                </button>
                <button onClick={triggerIdeasMode} className="bg-amber-500 text-white px-4 py-2 rounded">Ideas Mode (AI Structure)</button>
                <button onClick={fetchMoM} className="bg-purple-500 text-white px-4 py-2 rounded">View Minutes of Meeting</button>
              </div>
              {showIdeas && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {ideasLoading ? <div className="text-white">Loading...</div> :
                    ideas.length === 0 ? <div className="text-slate-400 col-span-2">No ideas yet.</div> :
                    ideas.map((idea, i) => (
                      <div key={i} className="bg-yellow-200 text-slate-900 rounded-lg p-3 shadow sticky-note">
                        <div className="text-xs font-bold mb-1">{idea.username}</div>
                        <div className="text-sm">{idea.idea}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{new Date(idea.created_at).toLocaleString()}</div>
                      </div>
                    ))}
                </div>
              )}
              {ideasMode && (
                <div className="mt-4 bg-slate-800 text-white rounded-lg p-3">
                  <div className="font-bold mb-2">AI Structured Document</div>
                  <div className="whitespace-pre-wrap">{structuredDoc || "Loading..."}</div>
                </div>
              )}
              {momLoading ? <div className="text-white mt-2">Loading minutes...</div> : mom && (
                <div className="mt-4 bg-slate-800 text-white rounded-lg p-3">
                  <div className="font-bold mb-2">Minutes of Meeting</div>
                  <div className="whitespace-pre-wrap">{mom}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-wide text-center drop-shadow-lg">PrismMeet - Meeting Room</h1>
      <div className="bg-slate-800/90 rounded-3xl shadow-2xl flex flex-col items-center w-full max-w-5xl p-0">
        {/* AI Note Taker Panel */}
        <div className="w-full flex flex-row justify-end items-center px-6 pt-6">
          <button
            onClick={aiListening ? stopAINoteTaker : startAINoteTaker}
            className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors shadow ${aiListening ? 'bg-amber-500 hover:bg-amber-400' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            {aiListening ? 'Stop AI Note Taker' : 'Start AI Note Taker'}
          </button>
        </div>
        {/* AI Notes Display */}
        <div className="w-full px-6 pb-2">
          <div className="bg-slate-900/80 rounded-xl p-4 mt-4 mb-2 min-h-[64px] text-white text-base font-mono whitespace-pre-wrap relative">
            <span className="text-blue-300 font-semibold">AI Notes:</span>
            <br />
            {aiNotes || <span className="text-slate-400">(Your spoken words will appear here...)</span>}
            {notesSaved && (
              <span className="absolute top-2 right-4 text-green-400 text-xs">Notes saved</span>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center p-6 pb-0">
          <div className={`w-full flex flex-wrap gap-4 justify-center items-center aspect-video`}>
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
            {Object.entries(remoteParticipants).map(([socketId, { stream, user: remoteUser, camOn, micOn }]) => (
              <div key={socketId} className="flex flex-col items-center w-72 h-80">
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
                <span className="text-slate-300 mt-2 text-base font-semibold">{remoteUser?.name || remoteUser?.email || socketId}</span>
                <span className={`mt-1 text-xs ${micOn ? 'text-green-400' : 'text-red-400'}`}>{micOn ? 'Mic On' : 'Mic Off'}</span>
                <span className={`mt-1 text-xs ${camOn ? 'text-green-400' : 'text-red-400'}`}>{camOn ? 'Camera On' : 'Camera Off'}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Video Grid Placeholder */}
        <div className="w-full flex-1 flex items-center justify-center bg-black/10 rounded-2xl my-4">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Local and remote video elements will go here */}
            {/* For now, show local video and screen share as before */}
            {/* ...existing video code... */}
          </div>
        </div>
        {/* Control Bar */}
        <div className="w-full flex justify-center items-center gap-6 py-6 bg-transparent">
          {/* Mic toggle */}
          <button
            onClick={toggleMic}
            disabled={!started}
            className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${micOn ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-60`}
            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          {/* Camera toggle */}
          <button
            onClick={toggleCam}
            disabled={!started}
            className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 ${camOn ? 'bg-violet-500 hover:bg-violet-400' : 'bg-red-600 hover:bg-red-500'} text-white disabled:opacity-60`}
            title={camOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {camOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          {/* Screen share */}
          <button
            onClick={startScreenShare}
            disabled={!started || screenSharing}
            className={`group p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${screenSharing ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'} disabled:opacity-60`}
            title={screenSharing ? 'Sharing Screen' : 'Share Screen'}
          >
            <Monitor className="w-6 h-6" />
          </button>
          {/* Disconnect/Leave */}
          <button onClick={() => {/* leave logic */}} className="p-3 rounded-full bg-slate-700 hover:bg-red-500 text-white transition-colors" title="Leave Meeting">
            <LogOut className="w-6 h-6" />
          </button>
          {/* End Meeting (host only) */}
          {isHost && (
            <button onClick={() => setShowEndConfirm(true)} className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors" title="End Meeting">
              <XCircle className="w-6 h-6" />
            </button>
          )}
          {/* Settings */}
          <button onClick={() => setShowSettings(true)} className="p-3 rounded-full bg-slate-700 hover:bg-blue-500 text-white transition-colors" title="Settings">
            <Settings className="w-6 h-6" />
          </button>
        </div>
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
              {/* Profile, language, audio/video settings go here */}
              <button onClick={() => setShowSettings(false)} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg">Close</button>
            </div>
          </div>
        )}
        {/* End Meeting Modal */}
        {showEndConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
              <h2 className="text-xl font-bold text-white mb-4">End Meeting?</h2>
              <p className="text-gray-300 mb-6">This will disconnect all participants.</p>
              <button onClick={() => { setShowEndConfirm(false); navigate('/'); }} className="px-6 py-2 bg-red-600 text-white rounded-lg mr-4">End Meeting</button>
              <button onClick={() => setShowEndConfirm(false)} className="px-6 py-2 bg-slate-600 text-white rounded-lg">Cancel</button>
            </div>
          </div>
        )}
        {/* Schedule Meeting Button */}
        <div className="flex justify-center w-full mt-4 mb-2">
          <button
            onClick={() => setShowScheduleForm(true)}
            className="bg-green-500 hover:bg-green-400 text-white rounded-full px-6 py-2 text-lg font-semibold shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Schedule Meeting
          </button>
        </div>
        {/* Meeting Scheduling Form Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form onSubmit={handleSchedule} className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Schedule a Meeting</h2>
              <input type="text" required placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full mb-2 p-2 rounded" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full mb-2 p-2 rounded" />
              <div className="flex gap-2 mb-2">
                <Calendar selected={form.start} onSelect={date => setForm(f => ({ ...f, start: date }))} />
                <Calendar selected={form.end} onSelect={date => setForm(f => ({ ...f, end: date }))} />
              </div>
              <input type="text" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full mb-2 p-2 rounded" />
              <input type="text" placeholder="Participants (comma-separated emails)" value={form.participants} onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} className="w-full mb-2 p-2 rounded" />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowScheduleForm(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg">Schedule</button>
              </div>
            </form>
          </div>
        )}
        {/* Modal to show meeting ID after scheduling */}
        {scheduledMeetingId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center">
              <h2 className="text-xl font-bold text-white mb-4">Meeting Scheduled!</h2>
              <div className="text-white mb-2">Meeting ID:</div>
              <div className="bg-slate-700 text-green-300 font-mono px-4 py-2 rounded mb-4 select-all">{scheduledMeetingId}</div>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-2"
                onClick={() => {
                  navigate(`/meeting/${scheduledMeetingId}`);
                }}
              >Copy Meeting Link</button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg mb-2" onClick={() => navigate(`/meeting/${scheduledMeetingId}`)}>Join Meeting</button>
              <button className="px-4 py-2 bg-slate-600 text-white rounded-lg" onClick={() => setScheduledMeetingId(null)}>Close</button>
            </div>
          </div>
        )}
        {/* Meetings List */}
        <div className="w-full max-w-3xl mx-auto mt-8">
          <h2 className="text-2xl text-white font-bold mb-4">Your Meetings</h2>
          <ul className="space-y-4">
            {meetings.map((m: any) => (
              <li key={m.id} className="bg-slate-700 rounded-xl p-4 text-white">
                <div className="font-semibold text-lg">{m.title}</div>
                <div className="text-sm text-slate-300">{m.description}</div>
                <div className="text-sm">{m.start_time} - {m.end_time}</div>
                <div className="text-sm">Location: {m.location}</div>
                <div className="text-sm">Participants: {(m.participants || []).join(', ')}</div>
                <div className="text-xs text-slate-400 mt-2">Meeting ID: <span className="font-mono">{m.id}</span></div>
                <button
                  className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-lg"
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/api/meetings/${m.id}/join`, {
                      method: 'POST',
                      headers: {
                        Authorization: token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                      }
                    });
                    if (res.ok) {
                      navigate(`/meeting/${m.id}`);
                    } else {
                      alert('You must be logged in to join a meeting.');
                    }
                  }}
                >Join</button>
              </li>
            ))}
          </ul>
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