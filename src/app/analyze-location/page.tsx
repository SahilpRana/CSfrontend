"use client"

import * as React from "react"
import Papa from "papaparse"
import { Search, ChevronDown, MapPin, Calendar, Clock, Globe, Sparkles, Target, Zap, Wind, Thermometer, Activity, TrendingUp, Battery, Sun } from "lucide-react"

interface Row {
  Region?: string
  Country?: string
  "year "?: string
  month?: string
}

type RegionCountryMap = Record<string, Set<string>>
type YearMonthSet = Set<string>

interface PredictionResponse {
  predictions: {
    "ASSD(kWh/m²/day)": number
    "Temp(C)": number
    "SP(kPa)": number
    "wind speed(m/s)": number
  }
  energy_calculations: {
    "Solar Energy (kWh/month)": number
    "Wind Energy (kWh/month)": number
    "Cooling Energy (kWh/month)": number
    "Net Energy Balance (kWh/month)": number
  }
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
  
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearch("")
  }

  return (
    <div className="space-y-3">
      <label className=" text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
        <div className="text-blue-400">{icon}</div>
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
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
          <div className="absolute z-50 w-full mt-3 bg-gray-800/95 border-2 border-gray-600/40 rounded-2xl shadow-2xl backdrop-blur-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
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
        
        {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      </div>
    </div>
  )
}

export default function LocationSelectorForm(): React.ReactElement {
  const [regionCountryMap, setRegionCountryMap] = React.useState<RegionCountryMap>({})
  const [regions, setRegions] = React.useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = React.useState("")
  const [selectedCountry, setSelectedCountry] = React.useState("")
  const [selectedYear, setSelectedYear] = React.useState("")
  const [selectedMonth, setSelectedMonth] = React.useState("")

  const [yearSet, setYearSet] = React.useState<YearMonthSet>(new Set())
  const [monthSet, setMonthSet] = React.useState<YearMonthSet>(new Set())
  const [isLoading, setIsLoading] = React.useState(true)
  const [predictionData, setPredictionData] = React.useState<PredictionResponse | null>(null)
  const [isPredicting, setIsPredicting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const countries = React.useMemo<string[]>(() => {
    if (!selectedRegion) return []
    const set = regionCountryMap[selectedRegion]
    return set ? Array.from(set).sort() : []
  }, [selectedRegion, regionCountryMap])

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

  React.useEffect(() => {
    setSelectedCountry("")
  }, [selectedRegion])

  const isComplete = selectedRegion && selectedCountry && selectedYear && selectedMonth

  const handleAnalyzeLocation = async () => {
    if (!isComplete) return

    setIsPredicting(true)
    setError(null)
    setPredictionData(null)

    try {
      const MODEL_BASE_URL = process.env.NEXT_PUBLIC_MODEL_BASE_URL || 'http://localhost:8000'
      
      const response = await fetch(`${MODEL_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region: selectedRegion,
          country: selectedCountry,
          year: selectedYear,
          month: selectedMonth
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data: PredictionResponse = await response.json()
      setPredictionData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prediction data')
      console.error('Prediction API error:', err)
    } finally {
      setIsPredicting(false)
    }
  }

  const formatNumber = (num: number, unit: string = '') => {
    return `${num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}${unit}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Location Intelligence
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select your preferred region, country, and time period to discover optimal locations using our AI-powered analysis
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-3xl shadow-2xl p-8 md:p-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading location data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Region & Country Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SearchableSelect
                  options={regions}
                  value={selectedRegion}
                  onChange={setSelectedRegion}
                  placeholder="Choose your region"
                  icon={<Globe className="h-5 w-5" />}
                  label="Region"
                />

                <SearchableSelect
                  options={countries}
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  placeholder={selectedRegion ? "Select a country" : "Select a region first"}
                  disabled={!selectedRegion}
                  icon={<MapPin className="h-5 w-5" />}
                  label="Country"
                />
              </div>

              {/* Year & Month Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

              {/* Selection Display */}
              {isComplete && (
                <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-2 border-blue-500/30 rounded-3xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Your Selection</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-2xl">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <MapPin className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 uppercase tracking-wider">Location</div>
                        <div className="text-white font-semibold">{selectedCountry}, {selectedRegion}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-2xl">
                      <div className="p-2 bg-purple-500/20 rounded-xl">
                        <Calendar className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 uppercase tracking-wider">Time Period</div>
                        <div className="text-white font-semibold">{selectedMonth}/{selectedYear}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={handleAnalyzeLocation}
                      disabled={isPredicting}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isPredicting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Target className="h-5 w-5" />
                          Analyze Location
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-8 p-6 bg-red-900/30 border-2 border-red-500/30 rounded-2xl backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                      <Activity className="h-5 w-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-400">Analysis Error</h3>
                  </div>
                  <p className="text-gray-300">{error}</p>
                </div>
              )}

              {/* Prediction Results */}
              {predictionData && (
                <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Environmental Predictions */}
                  <div className="p-8 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-2 border-emerald-500/30 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Environmental Conditions</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-yellow-500/20 rounded-xl">
                            <Sun className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Solar Irradiance</div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(predictionData.predictions["ASSD(kWh/m²/day)"], " kWh/m²/day")}
                        </div>
                      </div>

                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-orange-500/20 rounded-xl">
                            <Thermometer className="h-5 w-5 text-orange-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Temperature</div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(predictionData.predictions["Temp(C)"], "°C")}
                        </div>
                      </div>

                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Activity className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Pressure</div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(predictionData.predictions["SP(kPa)"], " kPa")}
                        </div>
                      </div>

                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-cyan-500/20 rounded-xl">
                            <Wind className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Wind Speed</div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(predictionData.predictions["wind speed(m/s)"], " m/s")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Energy Analysis */}
                  <div className="p-8 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/30 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Energy Analysis</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-yellow-500/20 rounded-xl">
                            <Sun className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Solar Energy</div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(predictionData.energy_calculations["Solar Energy (kWh/month)"], " kWh/month")}
                        </div>
                      </div>

                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-cyan-500/20 rounded-xl">
                            <Wind className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Wind Energy</div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(predictionData.energy_calculations["Wind Energy (kWh/month)"], " kWh/month")}
                        </div>
                      </div>

                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Thermometer className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Cooling Energy</div>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(predictionData.energy_calculations["Cooling Energy (kWh/month)"], " kWh/month")}
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-2xl border border-green-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-500/20 rounded-xl">
                            <Battery className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Net Energy Balance</div>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          {formatNumber(predictionData.energy_calculations["Net Energy Balance (kWh/month)"], " kWh/month")}
                        </div>
                      </div>
                    </div>

                    
                  </div>
                </div>
              )}
            </div>
          )}
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