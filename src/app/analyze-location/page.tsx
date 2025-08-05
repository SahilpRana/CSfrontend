"use client"

import * as React from "react"
import Papa from "papaparse"
import { Search, ChevronDown, MapPin, Calendar, Clock, Globe, Sparkles, Target, Zap, Wind, Thermometer, Activity, TrendingUp, Battery, Sun, Square } from "lucide-react"

interface Row {
  Region?: string
  Country?: string
  "year "?: string
  month?: string
}

type RegionCountryMap = Record<string, Set<string>>

interface MonthlyPrediction {
  Month: number
  "ASSD(kWh/m²/day)": number
  "Temp(C)": number
  "SP(kPa)": number
  "wind speed(m/s)": number
  "SolarEnergy(kWh)": number
  "WindEnergy(kWh)": number
  "CoolingEnergy(kWh)": number
}

interface MonthlyPredictionResponse {
  region: string
  country: string
  year: number
  monthly_predictions: MonthlyPrediction[]
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
      <div className="relative" ref={dropdownRef}>
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
  const [dcSize, setDcSize] = React.useState("2000")

  const [isLoading, setIsLoading] = React.useState(true)
  const [predictionData, setPredictionData] = React.useState<MonthlyPredictionResponse | null>(null)
  const [isPredicting, setIsPredicting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Predefined years (2025-2050)
  const years = React.useMemo(() => {
    const yearArray = []
    for (let year = 2025; year <= 2050; year++) {
      yearArray.push(year.toString())
    }
    return yearArray
  }, [])

  // Month names for display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const countries = React.useMemo<string[]>(() => {
    if (!selectedRegion) return []
    const set = regionCountryMap[selectedRegion]
    return set ? Array.from(set).sort() : []
  }, [selectedRegion, regionCountryMap])

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

  React.useEffect(() => {
    setSelectedCountry("")
  }, [selectedRegion])

  const isComplete = selectedRegion && selectedCountry && selectedYear && dcSize

  const handleAnalyzeLocation = async () => {
    if (!isComplete) return

    setIsPredicting(true)
    setError(null)
    setPredictionData(null)

    try {
      const MODEL_BASE_URL = process.env.NEXT_PUBLIC_MODEL_BASE_URL || "";
      
      const response = await fetch(`${MODEL_BASE_URL}/predictmonthly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region: selectedRegion,
          country: selectedCountry,
          year: parseInt(selectedYear),
          dc_size_m2: parseInt(dcSize)
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data: MonthlyPredictionResponse = await response.json()
      setPredictionData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prediction data')
      console.error('Prediction API error:', err)
    } finally {
      setIsPredicting(false)
    }
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Monthly Energy Predictions
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Get comprehensive monthly energy analysis for your location with our AI-powered predictions
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

              {/* Year & DC Size Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SearchableSelect
                  options={years}
                  value={selectedYear}
                  onChange={setSelectedYear}
                  placeholder="Select year (2025-2050)"
                  icon={<Calendar className="h-5 w-5" />}
                  label="Year"
                />

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <div className="text-blue-400"><Square className="h-5 w-5" /></div>
                    Data Center Size (m²)
                  </label>
                  <input
                    type="number"
                    value={dcSize}
                    onChange={(e) => setDcSize(e.target.value)}
                    placeholder="Enter DC size in square meters"
                    className="w-full px-5 py-4 bg-gray-800/40 border-2 border-gray-600/40 rounded-2xl text-white placeholder-gray-400 hover:bg-gray-700/50 hover:border-gray-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-md transition-all duration-300"
                  />
                </div>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Calendar className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 uppercase tracking-wider">Year</div>
                        <div className="text-white font-semibold">{selectedYear}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-2xl">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Square className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 uppercase tracking-wider">Data Center Size</div>
                        <div className="text-white font-semibold">{dcSize} m²</div>
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
                          Get Monthly Predictions
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

              {/* Monthly Predictions Table */}
              {predictionData && (
                <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-2 border-emerald-500/30 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Monthly Energy Analysis</h3>
                    </div>
                    
                    {/* Responsive Table Container */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full">
                        <thead>
                          <tr className="bg-gray-800/50 border-b border-gray-600/30">
                            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">Month</th>
                            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4 text-yellow-400" />
                                Solar Irradiance (kWh/m²/day)
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-red-400" />
                                Temperature (°C)
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-400" />
                                Pressure (kPa)
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4 text-cyan-400" />
                                Wind Speed (m/s)
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4 text-yellow-400" />
                                Solar Energy (kWh)
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Wind className="h-4 w-4 text-cyan-400" />
                                Wind Energy (kWh)
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <Thermometer className="h-4 w-4 text-blue-400" />
                                Cooling Energy (kWh)
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                          {predictionData.monthly_predictions.map((prediction, index) => (
                            <tr key={prediction.Month} className="hover:bg-gray-800/30 transition-colors duration-200">
                              <td className="px-4 py-4 text-white font-medium">
                                {monthNames[prediction.Month - 1]}
                              </td>
                              <td className="px-4 py-4 text-yellow-300 font-mono">
                                {formatNumber(prediction["ASSD(kWh/m²/day)"])}
                              </td>
                              <td className="px-4 py-4 text-red-300 font-mono">
                                {formatNumber(prediction["Temp(C)"])}
                              </td>
                              <td className="px-4 py-4 text-blue-300 font-mono">
                                {formatNumber(prediction["SP(kPa)"])}
                              </td>
                              <td className="px-4 py-4 text-cyan-300 font-mono">
                                {formatNumber(prediction["wind speed(m/s)"])}
                              </td>
                              <td className="px-4 py-4 text-yellow-300 font-mono font-semibold">
                                {formatNumber(prediction["SolarEnergy(kWh)"], 0)}
                              </td>
                              <td className="px-4 py-4 text-cyan-300 font-mono font-semibold">
                                {formatNumber(prediction["WindEnergy(kWh)"], 0)}
                              </td>
                              <td className="px-4 py-4 text-blue-300 font-mono font-semibold">
                                {formatNumber(prediction["CoolingEnergy(kWh)"])}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Statistics */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-yellow-500/20 rounded-xl">
                            <Sun className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Total Solar Energy</div>
                        </div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {formatNumber(
                            predictionData.monthly_predictions.reduce((sum, p) => sum + p["SolarEnergy(kWh)"], 0),
                            0
                          )} kWh/year
                        </div>
                      </div>

                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-cyan-500/20 rounded-xl">
                            <Wind className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Total Wind Energy</div>
                        </div>
                        <div className="text-2xl font-bold text-cyan-400">
                          {formatNumber(
                            predictionData.monthly_predictions.reduce((sum, p) => sum + p["WindEnergy(kWh)"], 0),
                            0
                          )} kWh/year
                        </div>
                      </div>

                      <div className="p-6 bg-gray-800/40 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Thermometer className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="text-sm text-gray-400 uppercase tracking-wider">Total Cooling Energy</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                          {formatNumber(
                            predictionData.monthly_predictions.reduce((sum, p) => sum + p["CoolingEnergy(kWh)"], 0),
                            0
                          )} kWh/year
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