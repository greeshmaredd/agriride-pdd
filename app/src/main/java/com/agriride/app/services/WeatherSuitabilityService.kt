package com.agriride.app.services

import com.agriride.app.models.Weather

data class SuitabilityResult(
    val status: String, // "SUITABLE", "CAUTION", "NOT_RECOMMENDED"
    val rationale: String,
    val isRecommended: Boolean
)

object WeatherSuitabilityService {

    fun evaluateSuitability(activity: String, weather: Weather): SuitabilityResult {
        val actUpper = activity.uppercase()
        val rainProb = weather.rainProbabilityPercent
        val windSpeed = weather.windSpeedKmH
        val temp = weather.temperatureC
        val cond = weather.condition.lowercase()

        return when {
            cond.contains("thunderstorm") || cond.contains("flood") -> {
                SuitabilityResult(
                    status = "NOT_RECOMMENDED",
                    rationale = "Not recommended because severe thunderstorm / extreme weather conditions are expected.",
                    isRecommended = false
                )
            }
            actUpper.contains("SPRAY") || actUpper.contains("FERTILIZER") -> {
                when {
                    rainProb >= 40 || windSpeed >= 20 -> SuitabilityResult(
                        status = "NOT_RECOMMENDED",
                        rationale = "Not recommended because high rain probability ($rainProb%) or wind speed ($windSpeed km/h) will wash away fertilizer.",
                        isRecommended = false
                    )
                    rainProb in 20..39 || windSpeed in 12..19 -> SuitabilityResult(
                        status = "CAUTION",
                        rationale = "Caution advised: Moderate wind speed ($windSpeed km/h) or mild rain chance ($rainProb%).",
                        isRecommended = true
                    )
                    else -> SuitabilityResult(
                        status = "SUITABLE",
                        rationale = "Good conditions for fertilizer spraying. Low rain probability ($rainProb%) & calm winds.",
                        isRecommended = true
                    )
                }
            }
            actUpper.contains("HARVEST") || actUpper.contains("CUTTING") -> {
                when {
                    rainProb >= 45 || cond.contains("rain") -> SuitabilityResult(
                        status = "NOT_RECOMMENDED",
                        rationale = "Not recommended because rainfall expected ($rainProb%) will damage harvested crops.",
                        isRecommended = false
                    )
                    rainProb in 25..44 -> SuitabilityResult(
                        status = "CAUTION",
                        rationale = "Caution: Minor rain chance ($rainProb%). Plan crop storage promptly.",
                        isRecommended = true
                    )
                    else -> SuitabilityResult(
                        status = "SUITABLE",
                        rationale = "Optimal dry weather for harvesting and crop cutting. Low rain probability.",
                        isRecommended = true
                    )
                }
            }
            actUpper.contains("PLOUGH") -> {
                when {
                    rainProb >= 60 -> SuitabilityResult(
                        status = "NOT_RECOMMENDED",
                        rationale = "Not recommended because heavy rainfall ($rainProb%) will cause soil waterlogging.",
                        isRecommended = false
                    )
                    temp > 40 -> SuitabilityResult(
                        status = "CAUTION",
                        rationale = "Caution: Extreme heat ($temp°C). Consider early morning or evening operations.",
                        isRecommended = true
                    )
                    else -> SuitabilityResult(
                        status = "SUITABLE",
                        rationale = "Good soil and weather conditions for land ploughing.",
                        isRecommended = true
                    )
                }
            }
            else -> {
                if (rainProb >= 50) {
                    SuitabilityResult(
                        status = "CAUTION",
                        rationale = "Caution: Rain expected ($rainProb%). Monitor local field conditions.",
                        isRecommended = true
                    )
                } else {
                    SuitabilityResult(
                        status = "SUITABLE",
                        rationale = "Fair weather suitable for field operations.",
                        isRecommended = true
                    )
                }
            }
        }
    }
}
