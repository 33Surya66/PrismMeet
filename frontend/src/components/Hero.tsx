import { Play, Users, Shield, Zap, ArrowRight, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 mb-8">
            <Zap className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-medium">Next-Generation Video Conferencing</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-200 to-blue-100 bg-clip-text text-transparent">
              Where Every Voice
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Finds Its Spectrum
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform simple video calls into rich, multi-dimensional collaboration experiences. 
            Like light through a prism, we bring multiple perspectives together in one seamless platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 flex items-center"
              onClick={() => navigate('/meeting')}
            >
              <Play className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Start Free Meeting
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            {/*
            <button className="px-8 py-4 bg-black/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-blue-500/30 hover:bg-black/30 transition-all duration-300 flex items-center">
              <Video className="w-6 h-6 mr-3" />
              Watch Demo
            </button>
            */}
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:bg-black/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">4K Video</h3>
            <p className="text-gray-400 text-sm">Crystal clear HD video calling</p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:bg-black/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">1000+ Users</h3>
            <p className="text-gray-400 text-sm">Massive scale meetings</p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:bg-black/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">E2E Encrypted</h3>
            <p className="text-gray-400 text-sm">Military-grade security</p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 hover:bg-black/30 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-800 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">50ms Latency</h3>
            <p className="text-gray-400 text-sm">Lightning fast performance</p>
          </div>
        </div>

        {/* Demo Video Placeholder
        <div className="relative max-w-5xl mx-auto">
          <div className="aspect-video bg-gradient-to-r from-blue-900/50 to-black/50 rounded-3xl border border-blue-500/30 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">See Prism Meet in Action</h3>
                <p className="text-gray-300">Watch our 2-minute demo video</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-6 -right-6 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full opacity-40 animate-pulse"></div>
        </div>
        */}
      </div>
    </section>
  );
};

export default Hero;
