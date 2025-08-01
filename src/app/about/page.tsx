"use client"

import * as React from "react"
import { Brain, Target, MapPin, Calendar, Zap, Globe, TrendingUp, Database, Cpu, BarChart3, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AboutUsPage(): React.ReactElement {
  const processSteps = [
    {
      step: "01",
      icon: Database,
      title: "Data Aggregation",
      description: "We collect and process vast amounts of climate, economic, demographic, and infrastructure data from reliable global sources.",
      color: "blue"
    },
    {
      step: "02", 
      icon: Cpu,
      title: "AI Analysis",
      description: "Advanced neural networks analyze complex patterns and relationships between environmental factors and regional suitability.",
      color: "green"
    },
    {
      step: "03",
      icon: Target,
      title: "Smart Recommendations",
      description: "Our models generate ranked location suggestions with confidence scores based on your specific criteria and timeline.",
      color: "purple"
    }
  ]

  const capabilities = [
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Analysis across all major regions and countries worldwide with consistent data quality.",
      color: "blue"
    },
    {
      icon: Calendar,
      title: "Temporal Intelligence", 
      description: "Time-sensitive recommendations considering seasonal variations and historical trends.",
      color: "green"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Future trend analysis and forecasting for strategic long-term planning.",
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Multi-Factor Scoring",
      description: "Comprehensive evaluation weighing climate, economic, and social factors.",
      color: "orange"
    }
  ]

  const mlModels = [
    "Deep Neural Networks for complex pattern recognition",
    "Random Forest algorithms for multi-dimensional analysis", 
    "Time series models for temporal trend analysis",
    "Ensemble methods for robust, reliable predictions"
  ]

  const dataSources = [
    "Climate and environmental monitoring networks",
    "Economic indicators and financial market data",
    "Demographic census and population statistics",
    "Infrastructure quality and accessibility metrics"
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: { bg: "bg-blue-600/20", text: "text-blue-400" },
      green: { bg: "bg-green-600/20", text: "text-green-400" },
      purple: { bg: "bg-purple-600/20", text: "text-purple-400" },
      orange: { bg: "bg-orange-600/20", text: "text-orange-400" }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              About CarbonSync
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered location intelligence that analyzes environmental, economic, and social factors 
            to identify optimal locations for any region and time period.
          </p>
        </div>

        {/* How Our AI Works */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How Our AI Models Work
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Our sophisticated system combines multiple data sources with advanced machine learning 
              to deliver precise location recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {processSteps.map((item, index) => {
              const colorClasses = getColorClasses(item.color)
              return (
                <Card key={index} className="bg-slate-800/50 border-slate-700 relative overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                        {item.step}
                      </Badge>
                      <div className={`p-2 ${colorClasses.bg} rounded-lg`}>
                        <item.icon className={`h-6 w-6 ${colorClasses.text}`} />
                      </div>
                    </div>
                    <CardTitle className="text-white text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-300 leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                  {index < 2 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-slate-600" />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </section>

        {/* Key Capabilities */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Key Capabilities</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Comprehensive analysis powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((feature, index) => {
              const colorClasses = getColorClasses(feature.color)
              return (
                <Card key={index} className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-colors">
                  <CardHeader className="text-center pb-2">
                    <div className={`mx-auto mb-4 p-3 ${colorClasses.bg} rounded-lg w-fit`}>
                      <feature.icon className={`h-8 w-8 ${colorClasses.text}`} />
                    </div>
                    <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-slate-300 text-center leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Technology</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Built on enterprise-grade AI and machine learning infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800/40 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Cpu className="h-6 w-6 text-green-400" />
                  Machine Learning Models
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mlModels.map((item, index) => {
                  const colors = ["bg-green-400", "bg-blue-400", "bg-purple-400", "bg-orange-400"]
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${colors[index]} rounded-full flex-shrink-0`} />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Database className="h-6 w-6 text-purple-400" />
                  Data Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataSources.map((item, index) => {
                  const colors = ["bg-purple-400", "bg-blue-400", "bg-green-400", "bg-orange-400"]
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${colors[index]} rounded-full flex-shrink-0`} />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mission Statement */}
        <section>
          <Card className="bg-slate-800/30 border-slate-700 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-green-500 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>
            
            <CardContent className="p-12 text-center relative z-10">
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full animate-pulse"></div>
                  <Target className="h-8 w-8 text-blue-400 animate-bounce" />
                  <div className="w-12 h-1 bg-gradient-to-l from-purple-400 to-transparent rounded-full animate-pulse delay-300"></div>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2">
                  Our Mission
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 mx-auto rounded-full animate-pulse"></div>
              </div>
              
              <p className="text-xl text-slate-200 leading-relaxed mb-10 max-w-4xl mx-auto font-medium">
                To <span className="text-blue-300 font-semibold">democratize access</span> to intelligent location insights, 
                empowering <span className="text-green-300 font-semibold">businesses</span>, <span className="text-purple-300 font-semibold">researchers</span>, 
                and <span className="text-orange-300 font-semibold">organizations</span> to make data-driven decisions about optimal locations based on 
                comprehensive AI analysis of environmental, economic, and social factors.
              </p>
              
              {/* Enhanced badges with animations */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  { text: "Data-Driven", color: "from-blue-500 to-blue-600", delay: "delay-0" },
                  { text: "AI-Powered", color: "from-green-500 to-green-600", delay: "delay-200" },
                  { text: "Globally Scalable", color: "from-purple-500 to-purple-600", delay: "delay-300" },
                  { text: "Future-Ready", color: "from-orange-500 to-orange-600", delay: "delay-500" }
                ].map((badge, index) => (
                  <div
                    key={index}
                    className={`px-6 py-3 bg-gradient-to-r ${badge.color} text-white font-semibold rounded-full 
                    transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg 
                    hover:shadow-xl animate-fade-in-up ${badge.delay}`}
                  >
                    {badge.text}
                  </div>
                ))}
              </div>
              
              {/* Call to action */}
              {/* <div className="pt-6 border-t border-slate-600/30">
                <p className="text-slate-400 mb-6">Join us in revolutionizing location intelligence</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 justify-center">
                    <Zap className="h-5 w-5" />
                    Explore Our Technology
                  </button>
                  <button className="px-8 py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 flex items-center gap-2 justify-center">
                    <Brain className="h-5 w-5" />
                    Learn More
                  </button>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </section>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  )
}