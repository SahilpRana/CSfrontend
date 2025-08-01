"use client"

import * as React from "react"
import Papa from "papaparse"
import { Search, ChevronDown, MapPin, Target, Sparkles, AlertCircle, TrendingUp, Star, Globe, Wind, Sun, Thermometer, Trophy, Award } from "lucide-react"

interface Row {
  Region?: string
  Country?: string
  "year "?: string
  month?: string
}

type RegionCountryMap = Record<string, Set<string>>

interface CountryRanking {
  country: string
  solar_energy: number
  wind_energy: number
  cooling_energy: number
  score: number
  rank: number
}

interface RankingResponse {
  region: string
  years_forecast: number
  top_countries: CountryRanking[]
  best_country: string
}

interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  icon: React.ReactNode
  label: string
}

function SearchableSelect({ options, value, onChange, placeholder, disabled, icon, label }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearch("")
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearch("")
      }
    }
  }

  // Handle clicking outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key to close dropdown
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSearch("")
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
        <div className="text-blue-400">{icon}</div>
        {label}
      </label>
      <div className="relative z-50" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={toggleDropdown}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${
            disabled 
              ? 'bg-gray-800/30 border-gray-700/30 text-gray-500 cursor-not-allowed backdrop-blur-sm' 
              : value
                ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/50 text-white hover:border-blue-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg backdrop-blur-md'
                : 'bg-gray-800/40 border-gray-600/40 text-white hover:bg-gray-700/50 hover:border-gray-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`${disabled ? 'text-gray-600' : value ? 'text-blue-400' : 'text-gray-400'} transition-colors duration-200`}>
              {icon}
            </div>
            <span className={`font-medium ${value ? 'text-white' : 'text-gray-400'}`}>
              {value || placeholder}
            </span>
          </div>
          <ChevronDown className={`h-5 w-5 transition-all duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''} ${disabled ? 'text-gray-600' : 'text-gray-400'}`} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-[60] w-full mt-3 bg-gray-800/95 border-2 border-gray-600/40 rounded-2xl shadow-2xl backdrop-blur-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-600/30 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/60 border border-gray-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-5 py-4 text-white hover:bg-gradient-to-r hover:from-blue-900/20 hover:to-purple-900/20 transition-all duration-200 border-b border-gray-700/20 last:border-b-0 font-medium"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-5 py-6 text-gray-400 text-center">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No results found</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AreaPredictorPage(): React.ReactElement {
  const [regionCountryMap, setRegionCountryMap] = React.useState<RegionCountryMap>({})
  const [regions, setRegions] = React.useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [rankingData, setRankingData] = React.useState<RankingResponse | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    fetch("/Data.csv")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load Data.csv`)
        return res.text()
      })
      .then((csvText) => {
        const parsed = Papa.parse<Row>(csvText, {
          header: true,
          skipEmptyLines: true,
        })

        const regionMap: RegionCountryMap = {}

        for (const row of parsed.data) {
          const region = row.Region?.trim()
          const country = row.Country?.trim()

          if (region && country) {
            if (!regionMap[region]) regionMap[region] = new Set()
            regionMap[region].add(country)
          }
        }

        if (!cancelled) {
          setRegionCountryMap(regionMap)
          setRegions(Object.keys(regionMap).sort())
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error("CSV parse error:", err)
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handlePredict = async () => {
    if (!selectedRegion) return

    setIsAnalyzing(true)
    setError(null)
    setRankingData(null)
    
    try {
      const MODEL_BASE_URL = process.env.NEXT_PUBLIC_MODEL_BASE_URL || 'http://localhost:8000'
      
      const response = await fetch(`${MODEL_BASE_URL}/rank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region: selectedRegion
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data: RankingResponse = await response.json()
      setRankingData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ranking data')
      console.error('Ranking API error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const canPredict = selectedRegion

  const formatEnergyValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M kWh`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K kWh`
    } else {
      return `${value.toFixed(0)} kWh`
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />
      case 2:
        return <Award className="h-6 w-6 text-gray-300" />
      case 3:
        return <Award className="h-6 w-6 text-orange-400" />
      default:
        return <Star className="h-6 w-6 text-blue-400" />
    }
  }

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-amber-900/20'
      case 2:
        return 'border-gray-400/50 bg-gradient-to-r from-gray-800/20 to-slate-800/20'
      case 3:
        return 'border-orange-500/50 bg-gradient-to-r from-orange-900/20 to-red-900/20'
      default:
        return 'border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Area Predictor
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Get AI-powered recommendations for the most suitable countries in your selected region
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Globe className="h-6 w-6 text-blue-400" />
              Configure Prediction
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading data...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <SearchableSelect
                  options={regions}
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  placeholder="Choose your region"
                  icon={<Globe className="h-5 w-5" />}
                  label="Target Region"
                />

                <button
                  onClick={handlePredict}
                  disabled={!canPredict || isAnalyzing}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                    canPredict && !isAnalyzing
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Predict Best Areas
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-green-400" />
              AI Recommendations
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span className="text-red-400 font-semibold">Error</span>
                </div>
                <p className="text-gray-300 mt-2">{error}</p>
              </div>
            )}

            {rankingData ? (
              <div className="space-y-6">
                {/* Best Country Highlight */}
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <span className="text-green-400 font-semibold">Best Recommendation</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{rankingData.best_country}</h3>
                  <p className="text-gray-300">
                    Top performer in {rankingData.region} with comprehensive analysis
                  </p>
                </div>

                {/* Rankings List */}
                <div className="space-y-4">
                  {rankingData.top_countries.map((country, index) => (
                    <div 
                      key={country.country} 
                      className={`border-2 rounded-2xl p-6 animate-in slide-in-from-right-4 duration-500 ${getRankBorder(country.rank)}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {getRankIcon(country.rank)}
                          <div>
                            <h3 className="text-xl font-bold text-white">{country.country}</h3>
                            <p className="text-gray-400 text-sm">Rank #{country.rank}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            {formatEnergyValue(country.score)}
                          </div>
                          <div className="text-xs text-gray-400">Total Score</div>
                        </div>
                      </div>

                      {/* Energy Breakdown */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-600/30">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Sun className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-gray-400 uppercase">Solar</span>
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {formatEnergyValue(country.solar_energy)}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Wind className="h-4 w-4 text-cyan-400" />
                            <span className="text-xs text-gray-400 uppercase">Wind</span>
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {formatEnergyValue(country.wind_energy)}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Thermometer className="h-4 w-4 text-blue-400" />
                            <span className="text-xs text-gray-400 uppercase">Cooling</span>
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {formatEnergyValue(country.cooling_energy)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No predictions yet</p>
                <p className="text-gray-500 text-sm">Select a region and click predict to see AI recommendations</p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-amber-200 font-semibold mb-2">Current Model Limitations</h3>
              <p className="text-amber-100/80 leading-relaxed">
                Currently, due to limited data availability, our AI model provides recommendations at the country level within regions. 
                We are actively working on expanding our dataset and model capabilities to provide more granular predictions at the 
                city, district, and local area levels. Future updates will include detailed sub-regional analysis with enhanced 
                accuracy and more specific location recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  )
}