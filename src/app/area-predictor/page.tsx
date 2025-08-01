"use client"

import * as React from "react"
import Papa from "papaparse"
import { Search, ChevronDown, MapPin, Calendar, Clock, Target, Sparkles, AlertCircle, TrendingUp, Star, Globe } from "lucide-react"

interface Row {
  Region?: string
  Country?: string
  "year "?: string
  month?: string
}

type RegionCountryMap = Record<string, Set<string>>
type YearMonthSet = Set<string>

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
  const [selectedYear, setSelectedYear] = React.useState("")
  const [selectedMonth, setSelectedMonth] = React.useState("")
  const [yearSet, setYearSet] = React.useState<YearMonthSet>(new Set())
  const [monthSet, setMonthSet] = React.useState<YearMonthSet>(new Set())
  const [isLoading, setIsLoading] = React.useState(true)
  const [prediction, setPrediction] = React.useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const years = React.useMemo(() => Array.from(yearSet).sort(), [yearSet])
  const months = React.useMemo(() => Array.from(monthSet).sort((a, b) => Number(a) - Number(b)), [monthSet])

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
        const yearSet: YearMonthSet = new Set()
        const monthSet: YearMonthSet = new Set()

        for (const row of parsed.data) {
          const region = row.Region?.trim()
          const country = row.Country?.trim()
          const year = row["year "]?.trim()
          const month = row.month?.trim()

          if (region && country) {
            if (!regionMap[region]) regionMap[region] = new Set()
            regionMap[region].add(country)
          }

          if (year) yearSet.add(year)
          if (month) monthSet.add(month)
        }

        if (!cancelled) {
          setRegionCountryMap(regionMap)
          setRegions(Object.keys(regionMap).sort())
          setYearSet(yearSet)
          setMonthSet(monthSet)
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
    if (!selectedRegion || !selectedYear || !selectedMonth) return

    setIsAnalyzing(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Get countries for the selected region and simulate AI ranking
    const countries = regionCountryMap[selectedRegion]
    if (countries) {
      const countryList = Array.from(countries)
      // Simulate AI prediction by shuffling and taking top results
      const shuffled = [...countryList].sort(() => Math.random() - 0.5)
      setPrediction(shuffled.slice(0, Math.min(5, shuffled.length)))
    }
    
    setIsAnalyzing(false)
  }

  const canPredict = selectedRegion && selectedYear && selectedMonth

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
            Get AI-powered recommendations for the most suitable countries in your selected region and time period
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
              <div className="space-y-6">
                <SearchableSelect
                  options={regions}
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  placeholder="Choose your region"
                  icon={<Globe className="h-5 w-5" />}
                  label="Target Region"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SearchableSelect
                    options={years}
                    value={selectedYear}
                    onChange={setSelectedYear}
                    placeholder="Select year"
                    icon={<Calendar className="h-5 w-5" />}
                    label="Year"
                  />

                  <SearchableSelect
                    options={months}
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    placeholder="Select month"
                    icon={<Clock className="h-5 w-5" />}
                    label="Month"
                  />
                </div>

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

            {prediction.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-300">Top recommendations for {selectedRegion} in {selectedMonth}/{selectedYear}</span>
                </div>
                
                {prediction.map((country, index) => (
                  <div key={country} className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{country}</h3>
                          <p className="text-gray-400 text-sm">AI Confidence: {95 - index * 5}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">Suitable</div>
                        <div className="text-xs text-gray-400">Score: {(95 - index * 5) / 10}/10</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No predictions yet</p>
                <p className="text-gray-500 text-sm">Configure your parameters and click predict to see AI recommendations</p>
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