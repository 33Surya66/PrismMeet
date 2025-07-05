import React, { useRef, useState, useEffect, useMemo } from "react";
import { LogOut, XCircle, Settings, Mic, MicOff, Video as VideoIcon, VideoOff, Monitor, Languages } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar";
import { io } from 'socket.io-client';
import { useUser } from '@/context/UserContext';
import PeerJSMeeting from '@/components/PeerJSMeeting';

const Meeting: React.FC = () => {
  const { id: meetingIdParam } = useParams();
  const { user, isLoggedIn } = useUser();
  const navigate = useNavigate();

  // If we have a meeting ID, use the PeerJS component
  if (meetingIdParam) {
    return <PeerJSMeeting />;
  }

  // Otherwise show the join/generate options
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-black">
      <div className="bg-slate-800/90 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white mb-4">Join or Create Meeting</h2>
        <p className="text-slate-300 mb-4 text-center">
          Enter a meeting ID to join or create a new meeting.
        </p>
        <div className="w-full space-y-4">
          <button
            onClick={() => navigate('/meeting/test-meeting')}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Join Test Meeting
          </button>
          <button
            onClick={() => {
              const meetingId = `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              navigate(`/meeting/${meetingId}`);
            }}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Create New Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default Meeting; 