package com.agriride.app.services

import android.util.Log
import com.agriride.app.models.Weather
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

object WeatherApiService {

    private const val TAG = "WeatherApiService"

    fun fetchLiveWeather(
        lat: Double = 0.0,
        lng: Double = 0.0,
        locationName: String = "Current Location",
        onResult: (Weather?) -> Unit
    ) {
        thread {
            try {
                val urlString = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lng&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m"
                val url = URL(urlString)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 5000
                connection.readTimeout = 5000

                if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val response = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        response.append(line)
                    }
                    reader.close()

                    val json = JSONObject(response.toString())
                    val currentWeather = json.optJSONObject("current_weather")
                    val hourly = json.optJSONObject("hourly")

                    val temp = currentWeather?.optDouble("temperature", 28.0) ?: 28.0
                    val windSpeed = currentWeather?.optDouble("windspeed", 14.0) ?: 14.0
                    val weatherCode = currentWeather?.optInt("weathercode", 1) ?: 1

                    val rainProbs = hourly?.optJSONArray("precipitation_probability")
                    var maxRainProb = 20
                    if (rainProbs != null && rainProbs.length() > 0) {
                        var sum = 0
                        val count = minOf(12, rainProbs.length())
                        for (i in 0 until count) {
                            sum += rainProbs.optInt(i, 20)
                        }
                        maxRainProb = sum / count
                    }

                    val humidities = hourly?.optJSONArray("relative_humidity_2m")
                    val humidity = if (humidities != null && humidities.length() > 0) humidities.optInt(0, 72) else 72

                    val (conditionText, isPlough, isSpray, isHarvest) = parseWeatherCode(weatherCode, maxRainProb, windSpeed)

                    val weather = Weather(
                        location = locationName,
                        temperatureC = temp.toInt(),
                        condition = conditionText,
                        rainProbabilityPercent = maxRainProb,
                        humidityPercent = humidity,
                        windSpeedKmH = windSpeed.toInt(),
                        isPloughingSuitable = isPlough,
                        isSprayingSuitable = isSpray,
                        isHarvestingSuitable = isHarvest,
                        updatedAt = System.currentTimeMillis()
                    )
                    onResult(weather)
                } else {
                    Log.e(TAG, "API call failed with response code: ${connection.responseCode}")
                    onResult(null)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Weather API exception", e)
                onResult(null)
            }
        }
    }

    private fun parseWeatherCode(code: Int, rainProb: Int, windSpeed: Double): Quadruple<String, Boolean, Boolean, Boolean> {
        val condition = when (code) {
            0 -> "Clear Sky ☀️"
            1, 2, 3 -> "Partly Cloudy ⛅"
            45, 48 -> "Foggy 🌫️"
            51, 53, 55 -> "Light Drizzle 🌧️"
            61, 63, 65 -> "Rainy 🌧️"
            80, 81, 82 -> "Rain Showers 🌦️"
            95, 96, 99 -> "Thunderstorm 🌩️"
            else -> "Partly Cloudy ⛅"
        }

        val isPloughing = rainProb < 40 && windSpeed < 25.0
        val isSpraying = rainProb < 20 && windSpeed < 15.0
        val isHarvesting = rainProb < 25 && windSpeed < 20.0

        return Quadruple(condition, isPloughing, isSpraying, isHarvesting)
    }

    private data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
}
