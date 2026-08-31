package com.agriride.app.activities

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.EditText
import android.widget.Toast
import androidx.activity.viewModels
import com.agriride.app.R
import com.agriride.app.databinding.ActivityOwnerWeeklyTrendsBinding
import com.agriride.app.models.Booking
import com.agriride.app.models.BookingStatus
import com.agriride.app.viewmodels.BookingViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class OwnerWeeklyTrendsActivity : BaseActivity() {

    private lateinit var binding: ActivityOwnerWeeklyTrendsBinding
    private val bookingViewModel: BookingViewModel by viewModels()

    private val currentUserUid: String
        get() = FirebaseAuth.getInstance().currentUser?.uid ?: "default_owner"

    // Default daily values
    private var monRev = 3600.0
    private var tueRev = 1200.0
    private var wedRev = 4800.0
    private var thuRev = 2400.0
    private var friRev = 0.0
    private var satRev = 6000.0
    private var sunRev = 400.0

    private var ploughingCount = 5
    private var harvestingCount = 3
    private var droneCount = 2
    private var otherCount = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOwnerWeeklyTrendsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnTrendsBack.setOnClickListener {
            finish()
        }

        binding.btnEnterDailyEarnings.setOnClickListener {
            showManualEarningsDialog()
        }

        // Fetch manual weekly trends from Firebase if they exist
        fetchManualTrends()
    }

    private fun fetchManualTrends() {
        val ref = FirebaseDatabase.getInstance().getReference("owners")
            .child(currentUserUid).child("manualWeeklyTrends")

        ref.get().addOnSuccessListener { snapshot ->
            if (snapshot.exists()) {
                monRev = snapshot.child("mon").getValue(Double::class.java) ?: monRev
                tueRev = snapshot.child("tue").getValue(Double::class.java) ?: tueRev
                wedRev = snapshot.child("wed").getValue(Double::class.java) ?: wedRev
                thuRev = snapshot.child("thu").getValue(Double::class.java) ?: thuRev
                friRev = snapshot.child("fri").getValue(Double::class.java) ?: friRev
                satRev = snapshot.child("sat").getValue(Double::class.java) ?: satRev
                sunRev = snapshot.child("sun").getValue(Double::class.java) ?: sunRev
                
                ploughingCount = snapshot.child("ploughingCount").getValue(Int::class.java) ?: ploughingCount
                harvestingCount = snapshot.child("harvestingCount").getValue(Int::class.java) ?: harvestingCount
                droneCount = snapshot.child("droneCount").getValue(Int::class.java) ?: droneCount
                otherCount = snapshot.child("otherCount").getValue(Int::class.java) ?: otherCount

                updateUI()
            } else {
                // Otherwise calculate from real bookings
                bookingViewModel.getOwnerBookings().observe(this) { bookings ->
                    calculateFromBookings(bookings)
                }
            }
        }.addOnFailureListener {
            // Fallback to calculated bookings
            bookingViewModel.getOwnerBookings().observe(this) { bookings ->
                calculateFromBookings(bookings)
            }
        }
    }

    private fun calculateFromBookings(bookings: List<Booking>) {
        val completedBookings = bookings.filter { 
            it.status == BookingStatus.COMPLETED || 
            it.bookingStatus.equals("COMPLETED", ignoreCase = true)
        }

        if (completedBookings.isEmpty()) {
            updateUI()
            return
        }

        // Reset to zeros for calculation
        monRev = 0.0
        tueRev = 0.0
        wedRev = 0.0
        thuRev = 0.0
        friRev = 0.0
        satRev = 0.0
        sunRev = 0.0
        
        ploughingCount = 0
        harvestingCount = 0
        droneCount = 0
        otherCount = 0

        val sdf = SimpleDateFormat("dd MMM yyyy", Locale.ROOT)

        for (booking in completedBookings) {
            val amount = if (booking.totalAmount > 0) booking.totalAmount else (booking.ratePerAcre * booking.acres)
            
            val activity = booking.activity.lowercase(Locale.ROOT)
            if (activity.contains("plough") || activity.contains("plow") || activity.contains("దున్న")) {
                ploughingCount++
            } else if (activity.contains("harvest") || activity.contains("కోత")) {
                harvestingCount++
            } else if (activity.contains("drone") || activity.contains("పిచికారీ")) {
                droneCount++
            } else {
                otherCount++
            }

            try {
                val dateObj = sdf.parse(booking.date)
                if (dateObj != null) {
                    val bCal = Calendar.getInstance()
                    bCal.time = dateObj
                    when (bCal.get(Calendar.DAY_OF_WEEK)) {
                        Calendar.MONDAY -> monRev += amount
                        Calendar.TUESDAY -> tueRev += amount
                        Calendar.WEDNESDAY -> wedRev += amount
                        Calendar.THURSDAY -> thuRev += amount
                        Calendar.FRIDAY -> friRev += amount
                        Calendar.SATURDAY -> satRev += amount
                        Calendar.SUNDAY -> sunRev += amount
                    }
                }
            } catch (e: Exception) {
                val hash = booking.id.hashCode().coerceAtLeast(0)
                when (hash % 7) {
                    0 -> monRev += amount
                    1 -> tueRev += amount
                    2 -> wedRev += amount
                    3 -> thuRev += amount
                    4 -> friRev += amount
                    5 -> satRev += amount
                    6 -> sunRev += amount
                }
            }
        }
        updateUI()
    }

    private fun updateUI() {
        // Update progress bars
        binding.barMon.progress = monRev.toInt()
        binding.barTue.progress = tueRev.toInt()
        binding.barWed.progress = wedRev.toInt()
        binding.barThu.progress = thuRev.toInt()
        binding.barFri.progress = friRev.toInt()
        binding.barSat.progress = satRev.toInt()
        binding.barSun.progress = sunRev.toInt()

        // Update text labels
        binding.tvMonRev.text = "₹${monRev.toInt()}"
        binding.tvTueRev.text = "₹${tueRev.toInt()}"
        binding.tvWedRev.text = "₹${wedRev.toInt()}"
        binding.tvThuRev.text = "₹${thuRev.toInt()}"
        binding.tvFriRev.text = "₹${friRev.toInt()}"
        binding.tvSatRev.text = "₹${satRev.toInt()}"
        binding.tvSunRev.text = "₹${sunRev.toInt()}"

        val totalWeeklyRevenue = monRev + tueRev + wedRev + thuRev + friRev + satRev + sunRev
        val fuelMaintenance = totalWeeklyRevenue * 0.15
        val driverWages = totalWeeklyRevenue * 0.25
        val netProfit = totalWeeklyRevenue - fuelMaintenance - driverWages

        binding.tvWeeklyTotalRev.text = "₹${totalWeeklyRevenue.toInt()}"
        binding.tvWeeklyFuelCost.text = "₹${fuelMaintenance.toInt()}"
        binding.tvWeeklyDriverPayout.text = "₹${driverWages.toInt()}"
        binding.tvWeeklyNetProfit.text = "₹${netProfit.toInt()}"

        binding.tvOpPloughing.text = "• Ploughing (దున్నడం): $ploughingCount Operations"
        binding.tvOpHarvesting.text = "• Harvesting (కోత పనులు): $harvestingCount Operations"
        binding.tvOpDrone.text = "• Drone Spraying (మందుల పిచికారీ): $droneCount Operations"
        binding.tvOpOther.text = "• Others: $otherCount Operation${if (otherCount != 1) "s" else ""}"
    }

    private fun showManualEarningsDialog() {
        val view = LayoutInflater.from(this).inflate(R.layout.dialog_enter_daily_earnings, null)
        val etMon = view.findViewById<EditText>(R.id.etMon)
        val etTue = view.findViewById<EditText>(R.id.etTue)
        val etWed = view.findViewById<EditText>(R.id.etWed)
        val etThu = view.findViewById<EditText>(R.id.etThu)
        val etFri = view.findViewById<EditText>(R.id.etFri)
        val etSat = view.findViewById<EditText>(R.id.etSat)
        val etSun = view.findViewById<EditText>(R.id.etSun)

        etMon.setText(monRev.toInt().toString())
        etTue.setText(tueRev.toInt().toString())
        etWed.setText(wedRev.toInt().toString())
        etThu.setText(thuRev.toInt().toString())
        etFri.setText(friRev.toInt().toString())
        etSat.setText(satRev.toInt().toString())
        etSun.setText(sunRev.toInt().toString())

        AlertDialog.Builder(this)
            .setTitle("✏️ Enter Daily Earnings (₹)")
            .setView(view)
            .setPositiveButton("Save / సేవ్ చేయండి") { dialog, _ ->
                val mMon = etMon.text.toString().toDoubleOrNull() ?: 0.0
                val mTue = etTue.text.toString().toDoubleOrNull() ?: 0.0
                val mWed = etWed.text.toString().toDoubleOrNull() ?: 0.0
                val mThu = etThu.text.toString().toDoubleOrNull() ?: 0.0
                val mFri = etFri.text.toString().toDoubleOrNull() ?: 0.0
                val mSat = etSat.text.toString().toDoubleOrNull() ?: 0.0
                val mSun = etSun.text.toString().toDoubleOrNull() ?: 0.0

                val dataMap = mapOf(
                    "mon" to mMon,
                    "tue" to mTue,
                    "wed" to mWed,
                    "thu" to mThu,
                    "fri" to mFri,
                    "sat" to mSat,
                    "sun" to mSun,
                    "ploughingCount" to ploughingCount,
                    "harvestingCount" to harvestingCount,
                    "droneCount" to droneCount,
                    "otherCount" to otherCount
                )

                FirebaseDatabase.getInstance().getReference("owners")
                    .child(currentUserUid).child("manualWeeklyTrends")
                    .setValue(dataMap)
                    .addOnSuccessListener {
                        Toast.makeText(this, "Daily earnings updated successfully!", Toast.LENGTH_SHORT).show()
                        monRev = mMon
                        tueRev = mTue
                        wedRev = mWed
                        thuRev = mThu
                        friRev = mFri
                        satRev = mSat
                        sunRev = mSun
                        updateUI()
                    }
                    .addOnFailureListener {
                        Toast.makeText(this, "Failed to update database.", Toast.LENGTH_SHORT).show()
                    }
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
