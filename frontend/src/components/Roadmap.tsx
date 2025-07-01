import { CheckCircle, Clock, Calendar, Rocket } from 'lucide-react';

const Roadmap = () => {
  const phases = [
    {
      phase: "Phase 1: Foundation",
      duration: "6-8 weeks",
      status: "completed",
      icon: CheckCircle,
      color: "from-blue-500 to-blue-700",
      features: [
        "Core video/audio calling",
        "Basic UI and responsive design", 
        "Screen sharing functionality",
        "Text chat system",
        "Meeting room management"
      ]
    },
    {
      phase: "Phase 2: Enhancement", 
      duration: "4-6 weeks",
      status: "in-progress",
      icon: Clock,
      color: "from-blue-600 to-blue-800",
      features: [
        "Advanced layouts and themes",
        "Recording and playback",
        "Virtual backgrounds",
        "Mobile app development",
        "Basic analytics"
      ]
    },
    {
      phase: "Phase 3: Intelligence",
      duration: "8-10 weeks", 
      status: "planned",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      features: [
        "AI transcription service",
        "Smart meeting insights",
        "Gesture recognition",
        "Advanced noise cancellation",
        "Automated summaries"
      ]
    },
    {
      phase: "Phase 4: Enterprise",
      duration: "6-8 weeks",
      status: "planned", 
      icon: Rocket,
      color: "from-orange-500 to-red-500",
      features: [
        "Advanced security features",
        "SSO and compliance",
        "Admin dashboard",
        "Custom branding",
        "API ecosystem"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in-progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'planned': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <section id="roadmap" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 mb-6">
            <Rocket className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-medium">Development Roadmap</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Our Journey to
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Innovation Excellence
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A strategic roadmap designed to deliver cutting-edge features while maintaining stability and performance
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 via-blue-600 via-blue-700 to-blue-800 opacity-30"></div>

          {/* Timeline Items */}
          <div className="space-y-16">
            {phases.map((phase, index) => (
              <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Timeline Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${phase.color} rounded-full flex items-center justify-center border-4 border-gray-900`}>
                    <phase.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border mb-4 ${getStatusColor(phase.status)}`}>
                      {phase.status === 'completed' && <CheckCircle className="w-4 h-4 mr-2" />}
                      {phase.status === 'in-progress' && <Clock className="w-4 h-4 mr-2" />}
                      {phase.status === 'planned' && <Calendar className="w-4 h-4 mr-2" />}
                      {phase.status.charAt(0).toUpperCase() + phase.status.slice(1).replace('-', ' ')}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{phase.phase}</h3>
                    <p className="text-purple-300 font-medium mb-6">{phase.duration}</p>

                    <div className="space-y-3">
                      {phase.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-gray-300">
                          <div className={`w-2 h-2 bg-gradient-to-r ${phase.color} rounded-full mr-3 flex-shrink-0`}></div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Spacer for opposite side */}
                <div className="w-5/12"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Innovation Phase */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-br from-blue-900/30 to-black/30 backdrop-blur-sm rounded-3xl p-12 border border-blue-500/30">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Phase 5: Innovation</h3>
            <p className="text-lg text-gray-300 mb-6">Ongoing development of cutting-edge features</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400">
              <div>3D virtual environments</div>
              <div>AR/VR integration</div>
              <div>Advanced AI features</div>
              <div>Metaverse compatibility</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
