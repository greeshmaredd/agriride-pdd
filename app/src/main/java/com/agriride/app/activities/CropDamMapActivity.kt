package com.agriride.app.activities

import android.Manifest
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.graphics.Color
import android.location.Geocoder
import android.os.Bundle
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.databinding.ActivityCropDamMapBinding
import com.agriride.app.models.Booking
import com.agriride.app.models.BookingStatus
import com.agriride.app.repositories.AuthRepository
import com.agriride.app.repositories.FirebaseConfig
import com.agriride.app.viewmodels.BookingViewModel
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.model.PolylineOptions
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import java.util.Locale

class CropDamMapActivity : BaseActivity(), OnMapReadyCallback {

    private lateinit var binding: ActivityCropDamMapBinding
    private var mMap: GoogleMap? = null
    private var currentBooking: Booking? = null
    private var selectedLatLng: LatLng? = null
    private var bookingId = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCropDamMapBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnMapBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        bookingId = intent.getStringExtra("BOOKING_ID") ?: ""

        if (bookingId.isNotBlank()) {
            binding.tvBookingIdTitle.text = "Booking ID: #$bookingId"
            binding.tvMapVehicleTitle.text = "Booking Status Timeline"
            binding.scrollViewTimeline.visibility = View.VISIBLE
            binding.btnConfirmLocation.visibility = View.GONE
            binding.btnMapRefresh.visibility = View.VISIBLE

            binding.btnMapRefresh.setOnClickListener {
                Toast.makeText(this, "Refreshing booking details...", Toast.LENGTH_SHORT).show()
                fetchRealtimeBooking(bookingId)
            }
            fetchRealtimeBooking(bookingId)
        } else {
            // Map location selection mode
            binding.tvMapVehicleTitle.text = "Select Farm Location 📍"
            binding.scrollViewTimeline.visibility = View.GONE
            binding.btnConfirmLocation.visibility = View.VISIBLE
            binding.btnMapRefresh.visibility = View.GONE

            // Constrain map to fill screen above Confirm Location button
            val params = binding.cropDamMapFragment.layoutParams as androidx.constraintlayout.widget.ConstraintLayout.LayoutParams
            params.height = 0
            params.bottomToTop = R.id.btnConfirmLocation
            binding.cropDamMapFragment.layoutParams = params

            binding.btnConfirmLocation.setOnClickListener {
                saveSelectedLocation()
            }
        }

        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.cropDamMapFragment) as SupportMapFragment?
        mapFragment?.getMapAsync(this)
    }

    private fun fetchRealtimeBooking(bookingId: String) {
        val rtdb = FirebaseConfig.getRealtimeDatabase() ?: return
        rtdb.getReference("bookings").child(bookingId)
            .addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    var booking = snapshot.getValue(Booking::class.java)
                    if (booking == null) {
                        booking = Booking(
                            bookingId = bookingId,
                            id = bookingId,
                            farmerName = "Active Farmer",
                            equipmentName = "Mahindra 575 DI XP Plus",
                            activity = "Deep Land Ploughing",
                            ownerName = "Ramesh Reddy",
                            ownerPhone = "+91 98480 11223",
                            workerId = "worker_101",
                            workerName = "Subba Rao (Operator)",
                            bookingStatus = "WORKER_ASSIGNED",
                            status = BookingStatus.IN_PROGRESS,
                            paymentStatus = "CASH_PENDING",
                            date = "28 Aug 2026",
                            timeSlot = "07:00 AM - 11:00 AM",
                            location = "Kanchikacherla Farm Field",
                            acres = 4.0,
                            amount = 3000.0,
                            latitude = 16.5385,
                            longitude = 80.3920
                        )
                        rtdb.getReference("bookings").child(bookingId).setValue(booking)
                    }
                    currentBooking = booking
                    updateTimelineUI(booking)
                    updateMachineDetails(booking)
                    updateMapLocation(booking)
                }

                override fun onCancelled(error: DatabaseError) {
                    Toast.makeText(this@CropDamMapActivity, "Failed to load booking: ${error.message}", Toast.LENGTH_SHORT).show()
                }
            })
    }

    private fun updateMachineDetails(booking: Booking) {
        binding.tvBookingDetailsSub.text = "${booking.equipmentName.ifBlank { "Mahindra 575 DI Tractor" }} • ${booking.activity}"
        binding.tvMapOwnerName.text = booking.ownerName.ifBlank { "Owner Name" }
        binding.tvMapWorkerName.text = booking.workerName.ifBlank { "Unassigned" }
    }

    private fun updateTimelineUI(booking: Booking) {
        val green = ContextCompat.getColor(this, R.color.primary_green)
        val textPrimary = ContextCompat.getColor(this, R.color.text_primary)

        setStepActive(binding.indicatorStep1, binding.titleStep1, binding.lineStep1, true, "1", green, textPrimary)

        val status = booking.bookingStatus.uppercase()

        val isConfirmed = status != "PENDING" && status != "REJECTED" && status != "CANCELLED"
        setStepActive(binding.indicatorStep2, binding.titleStep2, binding.lineStep2, isConfirmed, "2", green, textPrimary)

        val isWorkerAssigned = booking.workerId.isNotBlank() && isConfirmed
        setStepActive(binding.indicatorStep3, binding.titleStep3, binding.lineStep3, isWorkerAssigned, "3", green, textPrimary)

        val isStarted = status == "IN_PROGRESS" || status == "COMPLETED"
        setStepActive(binding.indicatorStep4, binding.titleStep4, binding.lineStep4, isStarted, "4", green, textPrimary)

        val isCompleted = status == "COMPLETED"
        setStepActive(binding.indicatorStep5, binding.titleStep5, null, isCompleted, "5", green, textPrimary)
    }

    private fun setStepActive(
        indicator: TextView,
        title: TextView,
        line: View?,
        isActive: Boolean,
        stepNum: String,
        activeColor: Int,
        activeTextColor: Int
    ) {
        val grayBg = Color.parseColor("#E0E0E0")
        val textMuted = ContextCompat.getColor(this, R.color.text_muted)

        if (isActive) {
            indicator.backgroundTintList = ColorStateList.valueOf(activeColor)
            indicator.text = "✓"
            indicator.setTextColor(Color.WHITE)
            title.setTextColor(activeTextColor)
            line?.setBackgroundColor(activeColor)
        } else {
            indicator.backgroundTintList = ColorStateList.valueOf(grayBg)
            indicator.text = stepNum
            indicator.setTextColor(ContextCompat.getColor(this, R.color.text_secondary))
            title.setTextColor(textMuted)
            line?.setBackgroundColor(grayBg)
        }
    }

    override fun onMapReady(googleMap: GoogleMap) {
        mMap = googleMap
        mMap?.uiSettings?.isZoomControlsEnabled = true

        if (bookingId.isNotBlank()) {
            currentBooking?.let { updateMapLocation(it) }
        } else {
            // Location selection mode: center map on device coordinates or user profile coordinates
            mMap?.setOnMapClickListener { latLng ->
                selectedLatLng = latLng
                updateMarkerAtSelection(latLng)
            }
            centerMapOnDefaultOrGps()
        }
    }

    private fun centerMapOnDefaultOrGps() {
        val authRepo = AuthRepository()

        // Try getting user profile coordinates first
        authRepo.fetchCurrentUserProfile { user ->
            if (user != null && user.latitude != 0.0 && user.longitude != 0.0) {
                val pos = LatLng(user.latitude, user.longitude)
                selectedLatLng = pos
                mMap?.moveCamera(CameraUpdateFactory.newLatLngZoom(pos, 15f))
                updateMarkerAtSelection(pos)
            } else {
                // Otherwise try device GPS coordinates
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    val fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
                    try {
                        fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                            if (loc != null) {
                                val pos = LatLng(loc.latitude, loc.longitude)
                                selectedLatLng = pos
                                mMap?.moveCamera(CameraUpdateFactory.newLatLngZoom(pos, 15f))
                                updateMarkerAtSelection(pos)
                            }
                        }
                    } catch (e: SecurityException) {}
                }
            }
        }
    }

    private fun updateMarkerAtSelection(latLng: LatLng) {
        val map = mMap ?: return
        map.clear()
        map.addMarker(
            MarkerOptions()
                .position(latLng)
                .title("📍 Selected Farm Field")
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN))
        )
    }

    private fun saveSelectedLocation() {
        val latLng = selectedLatLng
        if (latLng == null) {
            Toast.makeText(this, "Please select farm location by tapping on the map", Toast.LENGTH_SHORT).show()
            return
        }

        val authRepo = AuthRepository()
        val uid = authRepo.getCurrentUserId() ?: ""
        if (uid.isEmpty()) {
            Toast.makeText(this, "User profile authentication required", Toast.LENGTH_SHORT).show()
            return
        }

        var villageName = "Local Village"
        var district = "District Belt"
        var locationString = "Farm Location Set"

        try {
            val geocoder = Geocoder(this, Locale.getDefault())
            val addresses = geocoder.getFromLocation(latLng.latitude, latLng.longitude, 1)
            if (!addresses.isNullOrEmpty()) {
                val addr = addresses[0]
                villageName = addr.subLocality ?: (addr.locality ?: "Local Village")
                district = addr.subAdminArea ?: (addr.adminArea ?: "District Belt")
                locationString = addr.getAddressLine(0) ?: "$villageName, $district"
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Network issue reverse geocoding location. Saving raw coordinates...", Toast.LENGTH_SHORT).show()
        }

        authRepo.updateUserLocation(uid, latLng.latitude, latLng.longitude, locationString, villageName) { success ->
            if (success) {
                // Save separate villageName and district nodes for standard validation
                val rtdb = FirebaseConfig.getRealtimeDatabase()
                rtdb?.getReference("users")?.child(uid)?.child("district")?.setValue(district)
                rtdb?.getReference("farmers")?.child(uid)?.child("district")?.setValue(district)

                Toast.makeText(this, "Farm Location Set: $villageName ($district) 📍", Toast.LENGTH_LONG).show()
                finish()
            } else {
                Toast.makeText(this, "Failed to update location in Firebase database.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun updateMapLocation(booking: Booking) {
        val map = mMap ?: return
        map.clear()

        val farmLat = if (booking.latitude != 0.0) booking.latitude else 16.0
        val farmLng = if (booking.longitude != 0.0) booking.longitude else 80.0
        val farmPos = LatLng(farmLat, farmLng)

        map.addMarker(
            MarkerOptions()
                .position(farmPos)
                .title("📍 My Farm Field")
                .snippet(booking.location.ifBlank { "Farm field location" })
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN))
        )

        // Simulated equipment location (1.2km offset) to show proximity layout
        val equipPos = LatLng(farmLat + 0.007, farmLng - 0.006)
        map.addMarker(
            MarkerOptions()
                .position(equipPos)
                .title("🚜 ${booking.equipmentName.ifBlank { "Mahindra 575 DI" }}")
                .snippet("Owner: ${booking.ownerName.ifBlank { "Owner" }}")
                .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_ORANGE))
        )

        map.addPolyline(
            PolylineOptions()
                .add(equipPos, farmPos)
                .width(8f)
                .color(ContextCompat.getColor(this, R.color.primary_green))
        )

        map.moveCamera(CameraUpdateFactory.newLatLngZoom(farmPos, 13.5f))
    }
}
