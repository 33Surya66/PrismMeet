import { Video, Github, Twitter, Linkedin, Mail, Globe, Shield, Zap } from 'lucide-react';

const Footer = () => {
  const links = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Architecture', href: '#architecture' },
      { name: 'Roadmap', href: '#roadmap' },
      { name: 'Pricing', href: '#' },
      { name: 'API Docs', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Contact', href: '#' }
    ],
    support: [
      { name: 'Documentation', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Status', href: '#' },
      { name: 'Security', href: '#' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' },
      { name: 'Compliance', href: '#' }
    ]
  };

  return (
    <footer className="border-t border-blue-500/20 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-800 rounded-lg flex items-center justify-center">
                <Video className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                  PRISM MEET
                </h3>
                <p className="text-xs text-gray-400">Advanced Video Conferencing</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Transforming conversations into collaborative experiences. Where every voice finds its spectrum.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center text-green-400 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                <span>SOC2 Compliant</span>
              </div>
              <div className="flex items-center text-blue-400 text-sm">
                <Globe className="w-4 h-4 mr-2" />
                <span>GDPR Ready</span>
              </div>
              <div className="flex items-center text-purple-400 text-sm">
                <Zap className="w-4 h-4 mr-2" />
                <span>99.9% Uptime</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Github className="w-5 h-5 text-gray-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-5 h-5 text-gray-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-5 h-5 text-gray-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Mail className="w-5 h-5 text-gray-300" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="font-semibold text-white mb-6">Product</h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Company</h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Support</h4>
            <ul className="space-y-3">
              {links.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Legal</h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-blue-900/30 to-black/30 rounded-2xl p-8 border border-blue-500/30 mb-12">
          <div className="text-center md:text-left md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h4 className="text-xl font-semibold text-white mb-2">Stay updated with Prism Meet</h4>
              <p className="text-gray-300">Get the latest features, updates, and insights delivered to your inbox.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:ml-8">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-black/20 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm min-w-64"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-900 transition-all duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Prism Meet. All rights reserved. Built with ❤️ for better collaboration.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>🌍 Global Infrastructure</span>
              <span>🔒 Enterprise Security</span>
              <span>⚡ 50ms Latency</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
