"use client"

import * as React from "react"
import Link from "next/link"
import { Brain, Target, MapPin, Calendar, Zap, Globe, TrendingUp, Database, Cpu, BarChart3, ArrowRight, Sparkles, Users, Shield, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function HomePage(): React.ReactElement {
  const features = [
    {
      icon: Target,
      title: "Location Selector",
      description: "Find the perfect location based on your specific criteria and preferences using advanced AI analysis.",
      href: "/location-selector",
      color: "blue",
      stats: "1M+ locations analyzed"
    },
    {
      icon: BarChart3,
      title: "Area Predictor",
      description: "Predict future trends and analyze potential of different areas with predictive modeling.",
      href: "/area-predictor", 
      color: "green",
      stats: "95% accuracy rate"
    },
    {
      icon: Brain,
      title: "About Our AI",
      description: "Learn how our sophisticated AI models process environmental, economic, and social data.",
      href: "/about",
      color: "purple",
      stats: "Deep learning powered"
    }
  ]

  const stats = [
    {
      icon: Globe,
      value: "195+",
      label: "Countries Covered",
      color: "blue"
    },
    {
      icon: Database,
      value: "50TB+", 
      label: "Data Processed",
      color: "green"
    },
    {
      icon: Users,
      value: "10K+",
      label: "Active Users",
      color: "purple"
    },
    {
      icon: TrendingUp,
      value: "99.2%",
      label: "Accuracy Rate",
      color: "orange"
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast Analysis",
      description: "Get comprehensive location insights in seconds, not weeks"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Your data is protected with bank-level encryption and security"
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Continuously updated data ensures you have the latest insights"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Advanced machine learning delivers actionable recommendations"
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: { bg: "bg-blue-600/20", text: "text-blue-400", gradient: "from-blue-500 to-blue-600", hover: "hover:from-blue-600 hover:to-blue-700" },
      green: { bg: "bg-green-600/20", text: "text-green-400", gradient: "from-green-500 to-green-600", hover: "hover:from-green-600 hover:to-green-700" },
      purple: { bg: "bg-purple-600/20", text: "text-purple-400", gradient: "from-purple-500 to-purple-600", hover: "hover:from-purple-600 hover:to-purple-700" },
      orange: { bg: "bg-orange-600/20", text: "text-orange-400", gradient: "from-orange-500 to-orange-600", hover: "hover:from-orange-600 hover:to-orange-700" }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                CarbonSync
              </h1>
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 mt-2">
                AI-Powered Location Intelligence
              </Badge>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Transform your decision-making with <span className="text-blue-300 font-semibold">advanced AI analysis</span> that 
            evaluates environmental, economic, and social factors to find the <span className="text-green-300 font-semibold">optimal locations</span> for 
            your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <Link href="/location-selector" className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Start Location Search
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 px-8 py-4 rounded-xl transition-all duration-300">
              <Link href="/about" className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Learn More
              </Link>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const colorClasses = getColorClasses(stat.color)
              return (
                <Card key={index} className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto mb-3 p-3 ${colorClasses.bg} rounded-lg w-fit group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`h-6 w-6 ${colorClasses.text}`} />
                    </div>
                    <div className={`text-2xl font-bold ${colorClasses.text} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Main Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explore Our AI-Powered Tools
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Discover the perfect solution for your location intelligence needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const colorClasses = getColorClasses(feature.color)
              return (
                <Card key={index} className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all duration-300 group hover:scale-105 hover:shadow-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 ${colorClasses.bg} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className={`h-8 w-8 ${colorClasses.text}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.stats}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-300 leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button asChild className={`w-full bg-gradient-to-r ${colorClasses.gradient} ${colorClasses.hover} text-white font-semibold rounded-lg transition-all duration-300 group-hover:shadow-lg`}>
                      <Link href={feature.href} className="flex items-center justify-center gap-2">
                        Explore
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose CarbonSync?</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Advanced technology meets intuitive design for unparalleled location intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
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
                <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
                  Ready to Find Your Perfect Location?
                </h2>
                <p className="text-xl text-slate-200 leading-relaxed mb-8 max-w-3xl mx-auto">
                  Join thousands of businesses, researchers, and organizations using CarbonSync to make 
                  <span className="text-blue-300 font-semibold"> data-driven location decisions</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Link href="/location-selector" className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Get Started Now
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 px-8 py-4 rounded-xl transition-all duration-300">
                  <Link href="/area-predictor" className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Try Area Predictor
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Floating background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  )
}