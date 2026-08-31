package com.agriride.app.fragments

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.agriride.app.R
import com.agriride.app.activities.CropDamMapActivity
import com.agriride.app.activities.EquipmentDetailsActivity
import com.agriride.app.activities.EquipmentSearchActivity
import com.agriride.app.activities.FarmerMainActivity
import com.agriride.app.activities.LoginActivity
import com.agriride.app.activities.OwnerNotificationsActivity
import com.agriride.app.activities.ProfileActivity
import com.agriride.app.activities.SoilCropRecommendationActivity
import com.agriride.app.activities.WeatherActivity
import com.agriride.app.adapters.EquipmentAdapter
import com.agriride.app.databinding.FragmentFarmerHomeBinding
import com.agriride.app.viewmodels.EquipmentViewModel
import com.agriride.app.viewmodels.WeatherViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.util.Locale

class FarmerHomeFragment : Fragment() {

    private var _binding: FragmentFarmerHomeBinding? = null
    private val binding get() = _binding!!
    private val equipmentViewModel: EquipmentViewModel by viewModels()
    private val weatherViewModel: WeatherViewModel by viewModels()
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var farmerLat: Double = 16.5062
    private var farmerLng: Double = 80.6480

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            fetchDeviceLocationAndWeather()
        } else {
            binding.tvLocation.text = "📍 Select your farm location"
            loadWeather(0.0, 0.0, "Select farm location")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFarmerHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity())

        binding.btnQuickBook.setOnClickListener {
            startActivity(Intent(requireContext(), EquipmentSearchActivity::class.java))
        }

        binding.cardHomeSearch.setOnClickListener {
            startActivity(Intent(requireContext(), EquipmentSearchActivity::class.java))
        }

        binding.btnQuickMyBookings.setOnClickListener {
            val mainAct = activity as? FarmerMainActivity
            if (mainAct != null) {
                mainAct.findViewById<com.google.android.material.bottomnavigation.BottomNavigationView>(R.id.farmerBottomNav)?.selectedItemId = R.id.nav_bookings
            } else {
                startActivity(Intent(requireContext(), FarmerMainActivity::class.java).apply {
                    putExtra("NAV_TARGET", R.id.nav_bookings)
                })
            }
        }

        binding.btnQuickSoil.setOnClickListener {
            startActivity(Intent(requireContext(), SoilCropRecommendationActivity::class.java))
        }

        binding.btnQuickLiveMap.setOnClickListener {
            startActivity(Intent(requireContext(), CropDamMapActivity::class.java))
        }

        binding.btnHomeNotifications.setOnClickListener {
            startActivity(Intent(requireContext(), OwnerNotificationsActivity::class.java))
        }

        binding.cardHomeAvatar.setOnClickListener {
            startActivity(Intent(requireContext(), ProfileActivity::class.java))
        }

        binding.btnHomeEditProfile.setOnClickListener {
            startActivity(Intent(requireContext(), ProfileActivity::class.java))
        }

        binding.btnHomeLogout.setOnClickListener {
            val ctx = context ?: return@setOnClickListener
            androidx.appcompat.app.AlertDialog.Builder(ctx)
                .setTitle("Logout Confirmation")
                .setMessage("Are you sure you want to log out of AgriRide?")
                .setPositiveButton("Yes, Logout") { _, _ ->
                    com.agriride.app.repositories.AuthRepository().logout()
                    android.widget.Toast.makeText(ctx, "Logged out successfully.", android.widget.Toast.LENGTH_SHORT).show()
                    val intent = Intent(ctx, LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    requireActivity().finish()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }

        binding.cardWeather.setOnClickListener {
            startActivity(Intent(requireContext(), WeatherActivity::class.java))
        }

        binding.tvGreeting.setOnClickListener {
            startActivity(Intent(requireContext(), ProfileActivity::class.java))
        }

        binding.tvLocation.setOnClickListener {
            startActivity(Intent(requireContext(), CropDamMapActivity::class.java))
        }

        binding.rvEquipmentHome.layoutManager = LinearLayoutManager(requireContext())

        // Load real logged-in user profile name from Firebase Realtime Database / Auth
        loadUserProfileName()

        equipmentViewModel.equipmentList.observe(viewLifecycleOwner) { list ->
            val nearbyList = equipmentViewModel.filterEquipment(
                query = "",
                category = null,
                maxPrice = null,
                minRating = null,
                farmerLat = farmerLat,
                farmerLng = farmerLng
            )
            val displayList = if (nearbyList.isNotEmpty()) nearbyList else list
            if (displayList.isEmpty()) {
                binding.rvEquipmentHome.visibility = View.GONE
                binding.layoutEmptyHomeEquipment.visibility = View.VISIBLE
            } else {
                binding.rvEquipmentHome.visibility = View.VISIBLE
                binding.layoutEmptyHomeEquipment.visibility = View.GONE
                binding.rvEquipmentHome.adapter = EquipmentAdapter(displayList) { equipment ->
                    val intent = Intent(requireContext(), EquipmentDetailsActivity::class.java)
                    intent.putExtra("EQUIPMENT_ID", equipment.id)
                    startActivity(intent)
                }
            }
        }

        checkPermissionAndFetchLocation()
    }

    private fun loadUserProfileName() {
        val calendar = java.util.Calendar.getInstance()
        val hour = calendar.get(java.util.Calendar.HOUR_OF_DAY)
        val greetingText = when (hour) {
            in 4..11 -> "Good Morning 👋"
            in 12..16 -> "Good Afternoon 👋"
            in 17..21 -> "Good Evening 👋"
            else -> "Good Night 👋"
        }
        if (_binding != null) {
            binding.tvGreetingSub.text = greetingText
        }

        val currentUser = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
        val uid = currentUser?.uid
        if (uid != null) {
            com.agriride.app.repositories.FirebaseConfig.getRealtimeDatabase()?.getReference("users")?.child(uid)
                ?.addValueEventListener(object : com.google.firebase.database.ValueEventListener {
                    override fun onDataChange(snapshot: com.google.firebase.database.DataSnapshot) {
                        val fullName = snapshot.child("fullName").value?.toString()
                            ?: snapshot.child("name").value?.toString()
                            ?: currentUser.displayName
                        if (_binding != null && !fullName.isNullOrBlank()) {
                            binding.tvGreeting.text = fullName
                        }
                    }
                    override fun onCancelled(error: com.google.firebase.database.DatabaseError) {}
                })
        }
    }

    private fun checkPermissionAndFetchLocation() {
        val context = context ?: return
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fetchDeviceLocationAndWeather()
        } else {
            // Load user profile coordinates if permissions are not granted yet
            fallbackToProfileLocation()
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    private fun fetchDeviceLocationAndWeather() {
        val ctx = context ?: return
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (_binding == null || !isAdded) return@addOnSuccessListener
                if (location != null) {
                    val lat = location.latitude
                    val lng = location.longitude
                    var locationTitle = "Current Location"
                    try {
                        val geocoder = Geocoder(ctx, Locale.getDefault())
                        val addresses = geocoder.getFromLocation(lat, lng, 1)
                        if (!addresses.isNullOrEmpty()) {
                            val addr = addresses[0]
                            val city = addr.locality ?: (addr.subAdminArea ?: (addr.adminArea ?: "Current Location"))
                            val state = addr.adminArea ?: ""
                            locationTitle = if (state.isNotBlank()) "$city, $state" else city
                        }
                    } catch (e: Exception) {
                        locationTitle = "Current Location"
                    }
                    farmerLat = lat
                    farmerLng = lng
                    _binding?.tvLocation?.text = "📍 $locationTitle"
                    loadWeather(lat, lng, locationTitle)

                    val nearbyList = equipmentViewModel.filterEquipment(
                        query = "",
                        category = null,
                        maxPrice = null,
                        minRating = null,
                        farmerLat = lat,
                        farmerLng = lng
                    )
                    _binding?.rvEquipmentHome?.adapter = EquipmentAdapter(nearbyList) { equipment ->
                        val intent = Intent(requireContext(), EquipmentDetailsActivity::class.java)
                        intent.putExtra("EQUIPMENT_ID", equipment.id)
                        startActivity(intent)
                    }

                    // Also save these GPS coordinates to user profile dynamically
                    val authRepo = com.agriride.app.repositories.AuthRepository()
                    val uid = authRepo.getCurrentUserId() ?: ""
                    if (uid.isNotEmpty()) {
                        authRepo.updateUserLocation(uid, lat, lng, locationTitle, locationTitle.split(",").firstOrNull() ?: "")
                    }
                } else {
                    fallbackToProfileLocation()
                }
            }.addOnFailureListener {
                if (_binding != null && isAdded) {
                    fallbackToProfileLocation()
                }
            }
        } catch (e: SecurityException) {
            fallbackToProfileLocation()
        }
    }

    private fun fallbackToProfileLocation() {
        val authRepo = com.agriride.app.repositories.AuthRepository()
        authRepo.fetchCurrentUserProfile { user ->
            if (_binding == null || !isAdded) return@fetchCurrentUserProfile
            if (user != null && user.latitude != 0.0 && user.longitude != 0.0) {
                _binding?.tvLocation?.text = "📍 ${user.location.ifBlank { "My Farm Field" }}"
                loadWeather(user.latitude, user.longitude, user.location.ifBlank { "My Farm Field" })
            } else {
                _binding?.tvLocation?.text = "📍 Select your farm location"
                loadWeather(16.0, 80.0, "Select farm location")
            }
        }
    }

    private fun loadWeather(lat: Double, lng: Double, locationName: String) {
        if (_binding == null || !isAdded) return
        _binding?.tvHomeWeatherTitle?.text = "☁️ Weather in $locationName"
        weatherViewModel.getWeatherForecast(lat, lng, locationName).observe(viewLifecycleOwner) { weather ->
            if (_binding != null && isAdded) {
                _binding?.tvHomeWeatherTemp?.text = "${weather.temperatureC}°C • ${weather.condition}"
                _binding?.tvHomeWeatherDetails?.text = "Rainfall: ${weather.rainProbabilityPercent}% • Wind: ${weather.windSpeedKmH} km/h"
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
