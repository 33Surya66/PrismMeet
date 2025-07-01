import { Bot, BarChart3, Palette, Shield, Zap, Users, Video, Mic, Share, MessageSquare, Calendar, Globe } from 'lucide-react';

const Features = () => {
  const coreFeatures = [
    {
      icon: Video,
      title: "HD Video Calling",
      description: "4K video support with adaptive streaming for all devices",
      gradient: "from-blue-500 to-blue-700"
    },
    {
      icon: Mic,
      title: "Crystal Audio",
      description: "Noise cancellation and spatial audio technology",
      gradient: "from-blue-600 to-blue-800"
    },
    {
      icon: Share,
      title: "Screen Sharing",
      description: "Share desktop, window, or browser tab seamlessly",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description: "Instant messaging with file sharing capabilities",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Meeting Rooms",
      description: "Custom URLs with participant management",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Worldwide deployment with 50ms latency",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const advancedFeatures = [
    {
      icon: Bot,
      title: "AI-Powered Intelligence",
      description: "Live transcription, smart summaries, and sentiment analysis",
      gradient: "from-blue-500 to-blue-800",
      features: ["40+ language support", "Auto-generated notes", "Voice commands", "Gesture recognition"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive meeting analytics and productivity tracking",
      gradient: "from-blue-600 to-blue-900",
      features: ["Participation metrics", "Network intelligence", "ROI reporting", "Custom dashboards"]
    },
    {
      icon: Palette,
      title: "Immersive Experiences",
      description: "3D virtual rooms and interactive collaboration tools",
      gradient: "from-pink-500 to-red-500",
      features: ["Virtual backgrounds", "3D avatars", "AR filters", "Interactive whiteboard"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Zero-trust architecture with end-to-end encryption",
      gradient: "from-green-500 to-teal-500",
      features: ["GDPR compliant", "SSO integration", "Audit trails", "Data residency"]
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 mb-6">
            <Zap className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-medium">Core Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Everything You Need for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Perfect Meetings
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive video conferencing features designed for modern teams and enterprises
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {coreFeatures.map((feature, index) => (
            <div key={index} className="group bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 hover:bg-black/30 transition-all duration-300 hover:scale-105">
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Advanced Features */}
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Advanced Capabilities
            </span>
          </h3>
          <p className="text-lg text-gray-300">
            Next-generation features that set Prism Meet apart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {advancedFeatures.map((feature, index) => (
            <div key={index} className="bg-gradient-to-br from-black/20 to-black/30 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
              <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 mb-6 text-lg">{feature.description}</p>
              
              <div className="grid grid-cols-2 gap-3">
                {feature.features.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
