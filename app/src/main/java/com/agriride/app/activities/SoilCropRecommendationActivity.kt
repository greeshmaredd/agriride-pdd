package com.agriride.app.activities

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.databinding.ActivitySoilCropRecommendationBinding
import com.agriride.app.models.FarmSoilProfile
import com.agriride.app.models.Weather
import com.agriride.app.viewmodels.AuthViewModel
import com.agriride.app.viewmodels.SoilViewModel
import com.agriride.app.viewmodels.WeatherViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.util.Calendar
import java.util.Locale

class SoilCropRecommendationActivity : BaseActivity() {

    private lateinit var binding: ActivitySoilCropRecommendationBinding
    private val soilViewModel: SoilViewModel by viewModels()
    private val weatherViewModel: WeatherViewModel by viewModels()
    private val authViewModel: AuthViewModel by viewModels()

    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private var liveWeather: Weather? = null
    private var currentSoilType = "Black Cotton"
    private var currentSeason = "Kharif"
    private var currentLat = 16.5062
    private var currentLng = 80.6480
    private var detectedVillage = "Detecting..."
    private var detectedDistrict = "AP"

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            fetchLiveGpsLocation()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySoilCropRecommendationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        binding.btnSoilBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        // 1. Auto-Detect Season Based on Current Month (No manual guesswork for farmer)
        setupAutoSeason()

        // 2. Fetch Live GPS Location (Replace hardcoded Vijayawada with actual farmer location)
        setupLocationDetection()

        // 3. Observe Live Weather
        weatherViewModel.getWeatherForecast().observe(this) { weather ->
            liveWeather = weather
            evaluateRecommendations(currentSoilType)
        }

        // 4. Setup Relatable Soil Type Selection (with Telugu & English names)
        setupSoilTypePicker()

        // 5. AI Recommendation Button
        binding.btnGetAiRecommendation.setOnClickListener {
            evaluateRecommendations(currentSoilType)
            Toast.makeText(this, "AI Soil & Crop Advisory updated successfully!", Toast.LENGTH_SHORT).show()
        }

        // 6. Direct Booking Action: Book Recommended Machinery
        binding.btnBookMachinery.setOnClickListener {
            val intent = Intent(this, EquipmentSearchActivity::class.java)
            startActivity(intent)
        }

        binding.cardSoilResult.setOnClickListener {
            val intent = Intent(this, EquipmentSearchActivity::class.java)
            startActivity(intent)
        }

        // 7. Bottom Navigation
        binding.navSoilHome.setOnClickListener {
            val intent = Intent(this, FarmerMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            startActivity(intent)
            finish()
        }
        binding.navSoilBookings.setOnClickListener {
            val intent = Intent(this, FarmerMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            startActivity(intent)
            finish()
        }

        // Initial evaluation
        evaluateRecommendations(currentSoilType)
    }

    /**
     * Automatically determines the farming season from current calendar month.
     * Kharif: June - October (Monsoon)
     * Rabi: October - March (Winter)
     * Zaid: March - June (Summer)
     */
    private fun setupAutoSeason() {
        val calendar = Calendar.getInstance()
        val month = calendar.get(Calendar.MONTH) + 1 // 1-12

        val (seasonKey, title, desc) = when (month) {
            in 6..10 -> Triple(
                "Kharif",
                "Kharif Season (Monsoon)",
                "Monsoon Crop Cycle • June to October • Ideal for Paddy, Cotton, Chilli"
            )
            in 11..12, in 1..3 -> Triple(
                "Rabi",
                "Rabi Season (Winter)",
                "Winter Crop Cycle • October to March • Ideal for Bengal Gram, Maize, Black Gram"
            )
            else -> Triple(
                "Zaid",
                "Zaid Season (Summer)",
                "Summer Catch Crop Cycle • March to June • Ideal for Green Gram, Sesame, Groundnut"
            )
        }

        currentSeason = seasonKey
        binding.tvCurrentSeasonName.text = title
        binding.tvCurrentSeasonDesc.text = desc
    }

    /**
     * Obtains real-time GPS coordinates and geocodes them into village and district.
     */
    private fun setupLocationDetection() {
        // Pre-fill from user profile first for instant rendering
        authViewModel.fetchCurrentUserProfile { user ->
            if (user != null) {
                if (user.villageName.isNotBlank()) {
                    detectedVillage = user.villageName
                    detectedDistrict = user.district.ifBlank { "Andhra Pradesh" }
                    binding.tvFarmLocation.text = "📍 $detectedVillage, $detectedDistrict"
                }
                if (user.latitude != 0.0 && user.longitude != 0.0) {
                    currentLat = user.latitude
                    currentLng = user.longitude
                }
            }
        }

        // Check GPS permission and fetch live position
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        ) {
            fetchLiveGpsLocation()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }

        binding.btnRefreshGps.setOnClickListener {
            fetchLiveGpsLocation()
            Toast.makeText(this, "Fetching current GPS coordinates...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun fetchLiveGpsLocation() {
        try {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
            ) {
                fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                    if (location != null) {
                        currentLat = location.latitude
                        currentLng = location.longitude
                        geocodeCoordinates(location.latitude, location.longitude)
                    } else {
                        binding.tvFarmLocation.text = "📍 $detectedVillage, $detectedDistrict (GPS active)"
                    }
                }
            }
        } catch (e: Exception) {
            binding.tvFarmLocation.text = "📍 $detectedVillage, $detectedDistrict"
        }
    }

    private fun geocodeCoordinates(lat: Double, lng: Double) {
        try {
            val geocoder = Geocoder(this, Locale.getDefault())
            val addresses = geocoder.getFromLocation(lat, lng, 1)
            if (!addresses.isNullOrEmpty()) {
                val addr = addresses[0]
                val village = addr.subLocality ?: addr.locality ?: "Farm Field"
                val district = addr.subAdminArea ?: addr.adminArea ?: "AP"
                detectedVillage = village
                detectedDistrict = district
                binding.tvFarmLocation.text = "📍 $village, $district"
            }
        } catch (e: Exception) {
            binding.tvFarmLocation.text = "📍 $detectedVillage, $detectedDistrict (Lat: ${String.format("%.3f", lat)})"
        }
    }

    /**
     * User-friendly soil selection.
     */
    private fun setupSoilTypePicker() {
        val soilOptions = arrayOf(
            "Black Cotton Soil",
            "Red Sandy / Loamy Soil",
            "Alluvial Delta Soil",
            "Clay Loam Soil",
            "Sandy Loam Soil"
        )

        binding.cardSelectSoilType.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Select Your Farm Soil Type")
                .setItems(soilOptions) { _, which ->
                    val chosen = soilOptions[which]
                    binding.tvSelectedSoilName.text = chosen
                    currentSoilType = when (which) {
                        0 -> "Black Cotton"
                        1 -> "Red Loamy"
                        2 -> "Alluvial Delta"
                        3 -> "Clay Loam"
                        else -> "Sandy Loam"
                    }
                    evaluateRecommendations(currentSoilType)
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    /**
     * Generates rich crop advisory based on the chosen soil type and auto-detected season.
     */
    private fun evaluateRecommendations(soilType: String) {
        val profile = FarmSoilProfile(
            userId = authViewModel.getCurrentUserId() ?: "FARMER_101",
            soilType = soilType,
            season = currentSeason,
            ph = 6.8, // standard optimal default kept internally
            nitrogen = 140.0,
            phosphorus = 35.0,
            potassium = 180.0,
            moisture = 52.0,
            latitude = currentLat,
            longitude = currentLng,
            temperature = liveWeather?.temperatureC?.toDouble() ?: 29.0,
            humidity = liveWeather?.humidityPercent?.toDouble() ?: 68.0
        )

        val recommendations = soilViewModel.generateRecommendations(profile, liveWeather)
        if (recommendations.isEmpty()) return

        // 1. Top Recommended Crop (Primary Match)
        val top = recommendations[0]
        binding.tvMatchScoreBadge.text = "${top.suitabilityScore}% Match"
        binding.tvRecommendedCrop.text = top.cropName
        binding.tvCropReason.text = top.reason
        binding.tvExpectedYield.text = top.expectedYield
        binding.tvEstimatedProfit.text = top.estimatedProfit
        binding.tvDuration.text = "📅 Duration: ${top.durationDays}"
        binding.tvWaterReq.text = "💧 Water: ${top.waterRequirement}"
        binding.tvFertilizerAdvice.text = top.fertilizerGuidance
        binding.tvPestAdvisory.text = top.pestAdvisory
        binding.tvRecommendedMachine.text = top.recommendedMachinery

        // 2. Alternative Crop 1
        val alt1 = recommendations.getOrNull(1)
        if (alt1 != null) {
            binding.cardAltCrop1.visibility = View.VISIBLE
            binding.tvAltCrop1Name.text = alt1.cropName
            binding.tvAltCrop1Info.text = "Yield: ${alt1.expectedYield} • Profit: ${alt1.estimatedProfit}"
            binding.tvAltCrop1Score.text = "${alt1.suitabilityScore}% Match"
            binding.cardAltCrop1.setOnClickListener {
                displayAltCropAdvisory(alt1)
            }
        } else {
            binding.cardAltCrop1.visibility = View.GONE
        }

        // 3. Alternative Crop 2
        val alt2 = recommendations.getOrNull(2)
        if (alt2 != null) {
            binding.cardAltCrop2.visibility = View.VISIBLE
            binding.tvAltCrop2Name.text = alt2.cropName
            binding.tvAltCrop2Info.text = "Yield: ${alt2.expectedYield} • Profit: ${alt2.estimatedProfit}"
            binding.tvAltCrop2Score.text = "${alt2.suitabilityScore}% Match"
            binding.cardAltCrop2.setOnClickListener {
                displayAltCropAdvisory(alt2)
            }
        } else {
            binding.cardAltCrop2.visibility = View.GONE
        }
    }

    private fun displayAltCropAdvisory(crop: com.agriride.app.models.CropRecommendation) {
        binding.tvMatchScoreBadge.text = "${crop.suitabilityScore}% Match"
        binding.tvRecommendedCrop.text = crop.cropName
        binding.tvCropReason.text = crop.reason
        binding.tvExpectedYield.text = crop.expectedYield
        binding.tvEstimatedProfit.text = crop.estimatedProfit
        binding.tvDuration.text = "📅 Duration: ${crop.durationDays}"
        binding.tvWaterReq.text = "💧 Water: ${crop.waterRequirement}"
        binding.tvFertilizerAdvice.text = crop.fertilizerGuidance
        binding.tvPestAdvisory.text = crop.pestAdvisory
        binding.tvRecommendedMachine.text = crop.recommendedMachinery
        Toast.makeText(this, "Showing advisory for ${crop.cropName}", Toast.LENGTH_SHORT).show()
    }
}
