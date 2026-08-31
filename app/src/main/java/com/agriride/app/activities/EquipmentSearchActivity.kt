package com.agriride.app.activities

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.View
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import com.agriride.app.R
import com.agriride.app.adapters.EquipmentAdapter
import com.agriride.app.databinding.ActivityEquipmentSearchBinding
import com.agriride.app.viewmodels.EquipmentViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices

class EquipmentSearchActivity : BaseActivity() {

    private lateinit var binding: ActivityEquipmentSearchBinding
    private val viewModel: EquipmentViewModel by viewModels()
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private var selectedCategory: String? = null
    private var farmerLat: Double = 16.5062
    private var farmerLng: Double = 80.6480
    private var selectedMaxDistanceKm: Double? = null
    private var selectedMinRating: Double? = null

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            fetchGpsLocation()
        } else {
            updateList()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEquipmentSearchBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        val catFromIntent = intent.getStringExtra("CATEGORY_NAME")
        if (!catFromIntent.isNullOrBlank()) {
            selectedCategory = catFromIntent
        }

        binding.btnSearchBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.rvSearchResults.layoutManager = LinearLayoutManager(this)

        setupVehicleCategoryChips()
        setupDistanceAndRatingFilters()

        viewModel.equipmentList.observe(this) {
            updateList()
        }

        checkLocationPermission()
    }

    private fun setupVehicleCategoryChips() {
        when {
            selectedCategory?.contains("tractor", ignoreCase = true) == true -> binding.chipCatTractor.isChecked = true
            selectedCategory?.contains("harvester", ignoreCase = true) == true -> binding.chipCatHarvester.isChecked = true
            selectedCategory?.contains("drone", ignoreCase = true) == true -> binding.chipCatDrone.isChecked = true
            selectedCategory?.contains("rotavator", ignoreCase = true) == true -> binding.chipCatRotavator.isChecked = true
            selectedCategory?.contains("transplanter", ignoreCase = true) == true -> binding.chipCatTransplanter.isChecked = true
            selectedCategory?.contains("sprayer", ignoreCase = true) == true -> binding.chipCatSprayer.isChecked = true
            selectedCategory?.contains("thresher", ignoreCase = true) == true -> binding.chipCatThresher.isChecked = true
            selectedCategory?.contains("baler", ignoreCase = true) == true -> binding.chipCatBaler.isChecked = true
            else -> binding.chipAllVehicles.isChecked = true
        }

        binding.chipGroupVehicles.setOnCheckedStateChangeListener { _, checkedIds ->
            selectedCategory = when {
                checkedIds.contains(R.id.chipCatTractor) -> "Tractor"
                checkedIds.contains(R.id.chipCatHarvester) -> "Harvester"
                checkedIds.contains(R.id.chipCatDrone) -> "Drone"
                checkedIds.contains(R.id.chipCatRotavator) -> "Rotavator"
                checkedIds.contains(R.id.chipCatTransplanter) -> "Transplanter"
                checkedIds.contains(R.id.chipCatSprayer) -> "Sprayer"
                checkedIds.contains(R.id.chipCatThresher) -> "Thresher"
                checkedIds.contains(R.id.chipCatBaler) -> "Baler"
                else -> null
            }
            updateList()
        }
    }

    private fun setupDistanceAndRatingFilters() {
        // Distance filter click
        binding.chipDistanceFilter.setOnClickListener {
            val distanceOptions = arrayOf(
                "⚡ Nearest First (< 5 km / సమీపంలో ఉన్నవి)",
                "📍 Within 10 km (< 10 కి.మీ)",
                "📍 Within 20 km (< 20 కి.మీ)",
                "🌐 All Nearby Distances (అన్ని దూరాలు)"
            )
            AlertDialog.Builder(this)
                .setTitle("📍 Filter by Distance / దూరం ఎంపిక")
                .setItems(distanceOptions) { _, which ->
                    when (which) {
                        0 -> {
                            selectedMaxDistanceKm = 5.0
                            binding.chipDistanceFilter.text = "📍 Distance: < 5 km ✖"
                        }
                        1 -> {
                            selectedMaxDistanceKm = 10.0
                            binding.chipDistanceFilter.text = "📍 Distance: < 10 km ✖"
                        }
                        2 -> {
                            selectedMaxDistanceKm = 20.0
                            binding.chipDistanceFilter.text = "📍 Distance: < 20 km ✖"
                        }
                        else -> {
                            selectedMaxDistanceKm = null
                            binding.chipDistanceFilter.text = "📍 Distance: Nearest ˅"
                        }
                    }
                    updateList()
                }
                .show()
        }

        // Rating filter click
        binding.chipRatingFilter.setOnClickListener {
            val ratingOptions = arrayOf(
                "⭐ Top Rated (4.8+ ⭐ / అత్యధిక రేటింగ్)",
                "⭐ Highly Rated (4.5+ ⭐)",
                "⭐ Good (4.0+ ⭐)",
                "🔄 All Ratings (అన్నీ)"
            )
            AlertDialog.Builder(this)
                .setTitle("⭐ Filter by Rating / రేటింగ్ ఎంపిక")
                .setItems(ratingOptions) { _, which ->
                    when (which) {
                        0 -> {
                            selectedMinRating = 4.8
                            binding.chipRatingFilter.text = "⭐ 4.8+ Top Rated ✖"
                        }
                        1 -> {
                            selectedMinRating = 4.5
                            binding.chipRatingFilter.text = "⭐ 4.5+ Rated ✖"
                        }
                        2 -> {
                            selectedMinRating = 4.0
                            binding.chipRatingFilter.text = "⭐ 4.0+ Rated ✖"
                        }
                        else -> {
                            selectedMinRating = null
                            binding.chipRatingFilter.text = "⭐ Rating: All ˅"
                        }
                    }
                    updateList()
                }
                .show()
        }
    }

    private fun checkLocationPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fetchGpsLocation()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    private fun fetchGpsLocation() {
        val authRepo = com.agriride.app.repositories.AuthRepository()
        authRepo.fetchCurrentUserProfile { user ->
            if (user != null && user.latitude != 0.0 && user.longitude != 0.0) {
                farmerLat = user.latitude
                farmerLng = user.longitude
            }
            try {
                fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                    if (location != null) {
                        farmerLat = location.latitude
                        farmerLng = location.longitude
                    }
                    updateList()
                }.addOnFailureListener {
                    updateList()
                }
            } catch (e: SecurityException) {
                updateList()
            }
        }
    }

    private fun updateList() {
        val filtered = viewModel.filterEquipment(
            query = "",
            category = selectedCategory,
            maxPrice = null,
            minRating = selectedMinRating,
            farmerLat = farmerLat,
            farmerLng = farmerLng,
            maxDistanceKm = selectedMaxDistanceKm
        )

        val catName = selectedCategory ?: "Farm"
        binding.tvResultsCount.text = "📍 Found ${filtered.size} Verified $catName Machines Nearby (0.8 - 5.0 km)"

        if (filtered.isEmpty()) {
            binding.tvEmptyState.visibility = View.VISIBLE
            binding.rvSearchResults.visibility = View.GONE
        } else {
            binding.tvEmptyState.visibility = View.GONE
            binding.rvSearchResults.visibility = View.VISIBLE
            binding.rvSearchResults.adapter = EquipmentAdapter(filtered) { equipment ->
                if (equipment.isAvailable && equipment.available) {
                    val intent = Intent(this, EquipmentDetailsActivity::class.java)
                    intent.putExtra("EQUIPMENT_ID", equipment.id)
                    startActivity(intent)
                } else {
                    android.widget.Toast.makeText(this, "This equipment is currently unavailable.", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
