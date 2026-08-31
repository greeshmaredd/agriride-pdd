package com.agriride.app.activities

import android.Manifest
import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.databinding.ActivityBookingDetailsBinding
import com.agriride.app.models.Booking
import com.agriride.app.repositories.AuthRepository
import com.agriride.app.viewmodels.BookingViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.util.Calendar
import java.util.Locale

class BookingDetailsActivity : BaseActivity() {

    private lateinit var binding: ActivityBookingDetailsBinding
    private val bookingViewModel: BookingViewModel by viewModels()
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private var currentAcres = 4.0
    private var profileLat = 0.0
    private var profileLng = 0.0
    private var profileVillage = ""
    private var profileDistrict = ""

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (granted) {
            fetchRealGpsLocation()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookingDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        val draft = BookingViewModel.activeDraftBooking

        binding.btnBookingDetailsBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.tvSelectedActivityDisplay.text = draft.activity.ifEmpty { "Ploughing" }
        binding.etBookingDate.setText("28 August 2026")
        binding.etStartTime.setText("07:00 AM")

        val imgRes = com.agriride.app.utils.EquipmentImageHelper.getEquipmentDrawable(
            draft.equipmentName,
            draft.equipmentName,
            draft.equipmentName
        )
        binding.ivBookingEquipThumb.setImageResource(imgRes)
        binding.tvBookingEquipName.text = draft.equipmentName.ifEmpty { "Farm Machinery" }
        binding.tvBookingOwnerName.text = "Owner: ${draft.ownerName.ifEmpty { "Registered Owner" }}"
        val rateDisplay = if (draft.ratePerAcre > 0) "₹${draft.ratePerAcre.toInt()} / acre • Available" else "Standard Rate • Available"
        binding.tvBookingRateInfo.text = rateDisplay

        updateAcresUI(draft.ratePerAcre)

        binding.btnMinusAcres.setOnClickListener {
            if (currentAcres > 1) {
                currentAcres--
                updateAcresUI(draft.ratePerAcre)
            }
        }

        binding.btnPlusAcres.setOnClickListener {
            currentAcres++
            updateAcresUI(draft.ratePerAcre)
        }

        // Fetch user profile coordinates as default fallback
        val authRepo = AuthRepository()
        authRepo.fetchCurrentUserProfile { user ->
            if (user != null) {
                profileLat = user.latitude
                profileLng = user.longitude
                profileVillage = user.villageName
                // If district is not in user model, fallback
                profileDistrict = "Krishna" 

                if (binding.etFarmLoc.text.toString().isBlank() && user.location.isNotBlank()) {
                    binding.etFarmLoc.setText(user.location)
                    BookingViewModel.activeDraftBooking = BookingViewModel.activeDraftBooking.copy(
                        latitude = user.latitude,
                        longitude = user.longitude,
                        location = user.location,
                        villageName = user.villageName,
                        farmVillage = user.villageName
                    )
                }
            }
            checkAndFetchLocation()
        }

        binding.etBookingDate.setOnClickListener {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            val dpd = DatePickerDialog(this, { _, y, m, d ->
                val dateStr = "$d ${getMonthName(m)} $y"
                binding.etBookingDate.setText(dateStr)
            }, year, month, day)
            dpd.datePicker.minDate = System.currentTimeMillis()
            dpd.show()
        }

        binding.etStartTime.setOnClickListener {
            val calendar = Calendar.getInstance()
            val hour = calendar.get(Calendar.HOUR_OF_DAY)
            val minute = calendar.get(Calendar.MINUTE)

            TimePickerDialog(this, { _, h, m ->
                val amPm = if (h < 12) "AM" else "PM"
                val displayHour = if (h == 0 || h == 12) 12 else h % 12
                val timeStr = String.format("%02d:%02d %s", displayHour, m, amPm)
                binding.etStartTime.setText(timeStr)
            }, hour, minute, false).show()
        }

        binding.btnCheckSmartSchedule.setOnClickListener {
            val location = binding.etFarmLoc.text.toString().trim()
            val date = binding.etBookingDate.text.toString().trim()

            if (location.isEmpty()) {
                binding.etFarmLoc.error = "Enter farm location"
                return@setOnClickListener
            }
            if (date.isEmpty()) {
                binding.etBookingDate.error = "Select preferred date"
                return@setOnClickListener
            }

            // Verify if there are any available slots on the selected date to prevent double bookings early
            val slots = bookingViewModel.getRecommendedTimeSlots(
                equipmentId = draft.equipmentId,
                date = date,
                activity = draft.activity
            )
            val anyAvailable = slots.any { it.isAvailable }
            if (!anyAvailable) {
                Toast.makeText(this, "This equipment is fully booked on $date. Please select another date.", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val (cost, total) = bookingViewModel.calculateTotal(draft.ratePerAcre, currentAcres)

            // Resolve actual coordinates & names to pass into draft
            val finalLat = if (BookingViewModel.activeDraftBooking.latitude != 0.0) BookingViewModel.activeDraftBooking.latitude else profileLat
            val finalLng = if (BookingViewModel.activeDraftBooking.longitude != 0.0) BookingViewModel.activeDraftBooking.longitude else profileLng
            val finalVillage = if (BookingViewModel.activeDraftBooking.villageName.isNotBlank()) BookingViewModel.activeDraftBooking.villageName else profileVillage
            val finalDistrict = if (BookingViewModel.activeDraftBooking.district.isNotBlank()) BookingViewModel.activeDraftBooking.district else profileDistrict

            BookingViewModel.activeDraftBooking = draft.copy(
                location = location,
                farmLocation = location,
                acres = currentAcres,
                date = date,
                equipmentCost = cost,
                totalAmount = total,
                amount = cost, // amount = acres * pricePerAcre
                latitude = finalLat,
                longitude = finalLng,
                villageName = finalVillage,
                farmVillage = finalVillage,
                district = finalDistrict,
                farmDistrict = finalDistrict
            )

            val intent = Intent(this, SmartSchedulingActivity::class.java)
            intent.putExtra("BOOKING_DATE", date)
            startActivity(intent)
        }
    }

    private fun updateAcresUI(ratePerAcre: Double) {
        binding.tvAcresDisplay.text = "$currentAcres Acres"
        val (cost, _) = bookingViewModel.calculateTotal(ratePerAcre, currentAcres)
        binding.tvEstimatedCost.text = "Estimated Machine Cost: ₹${cost.toInt()} (₹${ratePerAcre.toInt()}/acre × $currentAcres acres)"
    }

    private fun checkAndFetchLocation() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fetchRealGpsLocation()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    private fun fetchRealGpsLocation() {
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (location != null && binding.etFarmLoc.text.toString().isBlank()) {
                    val lat = location.latitude
                    val lng = location.longitude
                    try {
                        val geocoder = Geocoder(this, Locale.getDefault())
                        val addresses = geocoder.getFromLocation(lat, lng, 1)
                        if (!addresses.isNullOrEmpty()) {
                            val addr = addresses[0]
                            val area = addr.subLocality ?: (addr.locality ?: (addr.subAdminArea ?: (addr.adminArea ?: "")))
                            val city = addr.locality ?: (addr.adminArea ?: "")
                            val locText = if (area.isNotBlank() && area != city) "$area, $city" else city
                            val village = addr.subLocality ?: (addr.locality ?: "")
                            val dist = addr.subAdminArea ?: (addr.adminArea ?: "")

                            if (locText.isNotBlank()) {
                                binding.etFarmLoc.setText(locText)
                                BookingViewModel.activeDraftBooking = BookingViewModel.activeDraftBooking.copy(
                                    latitude = lat,
                                    longitude = lng,
                                    location = locText,
                                    farmLocation = locText,
                                    villageName = village,
                                    farmVillage = village,
                                    district = dist,
                                    farmDistrict = dist
                                )
                            }
                        }
                    } catch (e: Exception) {
                    }
                }
            }
        } catch (e: SecurityException) {
        }
    }

    private fun getMonthName(month: Int): String {
        val months = arrayOf("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December")
        return if (month in 0..11) months[month] else ""
    }
}
