import { BarChart3, TrendingUp, Users, Clock, Brain, Target } from 'lucide-react';

const Analytics = () => {
  const metrics = [
    { label: "Active Users", value: "2.5M+", change: "+12%", icon: Users, color: "from-blue-500 to-blue-700" },
    { label: "Meeting Hours", value: "500K+", change: "+24%", icon: Clock, color: "from-blue-600 to-blue-800" },
    { label: "Satisfaction", value: "98.5%", change: "+3%", icon: Target, color: "from-blue-700 to-blue-900" },
    { label: "AI Insights", value: "1.2M+", change: "+45%", icon: Brain, color: "from-blue-500 to-blue-800" }
  ];

  const features = [
    {
      title: "Participation Metrics",
      description: "Track talk time, engagement scores, and active participation across all meetings",
      icon: Users
    },
    {
      title: "Network Intelligence", 
      description: "Bandwidth optimization suggestions and connection quality monitoring",
      icon: TrendingUp
    },
    {
      title: "Meeting Effectiveness",
      description: "Productivity tracking and outcome measurement for better results",
      icon: Target
    },
    {
      title: "Predictive Insights",
      description: "AI-powered suggestions for optimal meeting times and duration",
      icon: Brain
    }
  ];

  return (
    <section id="analytics" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-blue-300 font-medium">Analytics & Insights</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Data-Driven
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Meeting Intelligence
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive analytics and AI-powered insights to optimize your meeting effectiveness
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center mb-4`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                  <p className="text-gray-400 text-sm">{metric.label}</p>
                </div>
                <div className="text-green-400 text-sm font-medium flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {metric.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Dashboard Preview */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Real-time Dashboard</h3>
            <p className="text-gray-300">Monitor your meeting performance with live analytics</p>
          </div>
          
          {/* Mock Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Area */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Meeting Engagement</h4>
                <div className="text-green-400 text-sm">+15% this week</div>
              </div>
              <div className="h-40 bg-gradient-to-t from-purple-900/20 to-transparent rounded-lg relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-full">
                  <div className="grid grid-cols-7 gap-2 h-full items-end px-4 py-4">
                    {[65, 78, 82, 90, 85, 95, 88].map((height, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg opacity-80"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Average Meeting Duration</p>
                    <p className="text-2xl font-bold text-purple-400">28m 45s</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Participation Rate</p>
                    <p className="text-2xl font-bold text-green-400">87%</p>
                  </div>
                  <Users className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">AI Insights Generated</p>
                    <p className="text-2xl font-bold text-blue-400">234</p>
                  </div>
                  <Brain className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Analytics;
