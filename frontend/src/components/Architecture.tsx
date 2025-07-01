import { Server, Database, Shield, Zap, Globe, Layers } from 'lucide-react';

const Architecture = () => {
  const techStack = [
    { name: "Frontend", tech: "HTML5 + CSS3 + JavaScript", icon: Layers },
    { name: "Backend", tech: "Node.js + Express + Socket.io", icon: Server },
    { name: "Real-time", tech: "WebRTC + WebSocket", icon: Zap },
    { name: "Database", tech: "MongoDB/PostgreSQL + Redis", icon: Database },
    { name: "Security", tech: "End-to-End Encryption", icon: Shield },
    { name: "Infrastructure", tech: "Docker + Kubernetes", icon: Globe }
  ];

  const components = [
    {
      title: "Signaling Server",
      description: "WebSocket-based peer coordination",
      color: "from-blue-500 to-blue-700"
    },
    {
      title: "Media Server", 
      description: "STUN/TURN for NAT traversal",
      color: "from-blue-600 to-blue-800"
    },
    {
      title: "Plugin Engine",
      description: "Modular feature system",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Analytics Engine",
      description: "Real-time metrics and insights",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Security Layer",
      description: "End-to-end encryption",
      color: "from-red-500 to-pink-500"
    }
  ];

  return (
    <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 mb-6">
            <Server className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-medium">Technical Architecture</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Built for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Scale & Performance
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Modern, scalable architecture designed to handle millions of concurrent users
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Core Technology Stack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.tech}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-white">System Architecture</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Client Layer */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Client Layer</h4>
              <p className="text-gray-400 text-sm">Web, Mobile, Desktop Apps</p>
            </div>

            {/* API Layer */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Server className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">API Gateway</h4>
              <p className="text-gray-400 text-sm">REST & GraphQL APIs</p>
            </div>

            {/* Core Services */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Core Services</h4>
              <p className="text-gray-400 text-sm">Microservices Architecture</p>
            </div>
          </div>
        </div>

        {/* Key Components */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Key Components
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component, index) => (
              <div key={index} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className={`w-4 h-4 bg-gradient-to-r ${component.color} rounded-full mb-4 group-hover:scale-125 transition-transform duration-300`}></div>
                <h4 className="text-lg font-semibold text-white mb-2">{component.title}</h4>
                <p className="text-gray-400 text-sm">{component.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Architecture;
