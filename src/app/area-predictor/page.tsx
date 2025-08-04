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
    <div className="space-y-2 mb-8">
      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
        <div className="text-blue-400">{icon}</div>
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={toggleDropdown}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
            disabled 
              ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
              : value
                ? 'bg-blue-900/20 border-blue-500 text-white hover:border-blue-400'
                : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`${disabled ? 'text-gray-600' : value ? 'text-blue-400' : 'text-gray-400'}`}>
              {icon}
            </div>
            <span className={`${value ? 'text-white' : 'text-gray-400'}`}>
              {value || placeholder}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-gray-600' : 'text-gray-400'}`} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl">
            <div className="p-3 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-4 py-3 text-white hover:bg-blue-900/20 transition-colors border-b border-gray-700/50 last:border-b-0"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-gray-400 text-center">
                  <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
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
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Award className="h-5 w-5 text-gray-300" />
      case 3:
        return <Award className="h-5 w-5 text-orange-400" />
      default:
        return <Star className="h-5 w-5 text-blue-400" />
    }
  }

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-500 bg-yellow-900/10'
      case 2:
        return 'border-gray-400 bg-gray-800/20'
      case 3:
        return 'border-orange-500 bg-orange-900/10'
      default:
        return 'border-blue-500 bg-blue-900/10'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Area Predictor
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get AI-powered recommendations for the most suitable countries in your selected region
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel - Responsive height */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 min-h-[400px] lg:min-h-[600px]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" />
              Configure Prediction
            </h2>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading data...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <SearchableSelect
                  options={regions}
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  placeholder="Choose your region"
                  icon={<Globe className="h-4 w-4" />}
                  label="Target Region"
                />

                <button
                  onClick={handlePredict}
                  disabled={!canPredict || isAnalyzing}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    canPredict && !isAnalyzing
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Predict Best Areas
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results Panel - Increased height */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 min-h-[600px]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              AI Recommendations
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 font-medium">Error</span>
                </div>
                <p className="text-gray-300 mt-1 text-sm">{error}</p>
              </div>
            )}

            {rankingData ? (
              <div className="space-y-4">
                {/* Best Country Highlight */}
                <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-green-400 font-medium">Best Recommendation</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{rankingData.best_country}</h3>
                  <p className="text-gray-300 text-sm">
                    Top performer in {rankingData.region}
                  </p>
                </div>

                {/* Rankings List */}
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {rankingData.top_countries.map((country) => (
                    <div 
                      key={country.country} 
                      className={`border rounded-lg p-4 ${getRankBorder(country.rank)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getRankIcon(country.rank)}
                          <div>
                            <h3 className="font-bold text-white">{country.country}</h3>
                            <p className="text-gray-400 text-xs">Rank #{country.rank}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            {formatEnergyValue(country.score)}
                          </div>
                          <div className="text-xs text-gray-400">Total Score</div>
                        </div>
                      </div>

                      {/* Energy Breakdown */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-600/30">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Sun className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-gray-400">Solar</span>
                          </div>
                          <div className="text-xs font-medium text-white">
                            {formatEnergyValue(country.solar_energy)}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Wind className="h-3 w-3 text-cyan-400" />
                            <span className="text-xs text-gray-400">Wind</span>
                          </div>
                          <div className="text-xs font-medium text-white">
                            {formatEnergyValue(country.wind_energy)}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Thermometer className="h-3 w-3 text-blue-400" />
                            <span className="text-xs text-gray-400">Cooling</span>
                          </div>
                          <div className="text-xs font-medium text-white">
                            {formatEnergyValue(country.cooling_energy)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-1">No predictions yet</p>
                <p className="text-gray-500 text-sm">Select a region and click predict to see AI recommendations</p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-200 font-medium mb-2">Current Model Limitations</h3>
              <p className="text-amber-100/80 text-sm leading-relaxed">
                Currently, due to limited data availability, our AI model provides recommendations at the country level within regions. 
                We are actively working on expanding our dataset and model capabilities to provide more granular predictions at the 
                city, district, and local area levels.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.8);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.9);
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(75, 85, 99, 0.8) rgba(31, 41, 55, 0.5);
        }
      `}</style>
    </div>
  )
}