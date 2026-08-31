package com.agriride.app.activities

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.databinding.ActivityWeatherBinding
import com.agriride.app.viewmodels.WeatherViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.util.Locale

class WeatherActivity : BaseActivity() {

    private lateinit var binding: ActivityWeatherBinding
    private val viewModel: WeatherViewModel by viewModels()
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private var fallbackLat = 0.0
    private var fallbackLng = 0.0
    private var fallbackLoc = "Select farm location"

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            fetchRealLocationWeather()
        } else {
            fallbackToProfileWeather()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWeatherBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        binding.btnWeatherBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.btnWeatherAlertsBell.setOnClickListener {
            startActivity(Intent(this, DisasterAlertsActivity::class.java))
        }

        binding.cardMainTemp.setOnClickListener {
            startActivity(Intent(this, DisasterAlertsActivity::class.java))
        }

        // Bottom Navigation click handlers
        binding.navHome.setOnClickListener {
            val intent = Intent(this, FarmerMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            startActivity(intent)
            finish()
        }
        binding.navBookings.setOnClickListener {
            val intent = Intent(this, FarmerMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            startActivity(intent)
            finish()
        }

        // Load profile coordinates first as a baseline fallback
        val authRepo = com.agriride.app.repositories.AuthRepository()
        authRepo.fetchCurrentUserProfile { user ->
            if (user != null) {
                fallbackLat = user.latitude
                fallbackLng = user.longitude
                fallbackLoc = user.location.ifBlank { "My Farm Field" }
            }
            checkLocationPermissionAndFetch()
        }
    }

    private fun checkLocationPermissionAndFetch() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fetchRealLocationWeather()
        } else {
            fallbackToProfileWeather()
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    private fun fetchRealLocationWeather() {
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (location != null) {
                    val lat = location.latitude
                    val lng = location.longitude
                    var cityName = "Current Location"
                    try {
                        val geocoder = Geocoder(this, Locale.getDefault())
                        val addresses = geocoder.getFromLocation(lat, lng, 1)
                        if (!addresses.isNullOrEmpty()) {
                            val addr = addresses[0]
                            val city = addr.locality ?: (addr.subAdminArea ?: (addr.adminArea ?: "Current Location"))
                            cityName = "$city • Andhra Pradesh"
                        }
                    } catch (e: Exception) {
                        cityName = "Current Location"
                    }
                    loadWeather(lat, lng, cityName)
                } else {
                    fallbackToProfileWeather()
                }
            }.addOnFailureListener {
                fallbackToProfileWeather()
            }
        } catch (e: SecurityException) {
            fallbackToProfileWeather()
        }
    }

    private fun fallbackToProfileWeather() {
        if (fallbackLat != 0.0 && fallbackLng != 0.0) {
            loadWeather(fallbackLat, fallbackLng, fallbackLoc)
        } else {
            // Safe coordinates fallback, no hardcoded Vijayawada
            loadWeather(16.0, 80.0, "Andhra Pradesh Belt")
        }
    }

    private fun loadWeather(lat: Double, lng: Double, locationName: String) {
        binding.tvWeatherLocationHeader.text = locationName
        viewModel.getWeatherForecast(lat, lng, locationName).observe(this) { weather ->
            binding.tvTempDisplay.text = "${weather.temperatureC}°C"
            binding.tvCondDisplay.text = "${weather.condition} • ${weather.rainProbabilityPercent}% Chance of Rain"
            binding.tvWeatherHumidity.text = "${weather.humidityPercent}%"
            binding.tvWeatherWind.text = "${weather.windSpeedKmH} km/h"
        }
    }
}
