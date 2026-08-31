package com.agriride.app.activities

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.databinding.ActivitySmartSchedulingBinding
import com.agriride.app.viewmodels.BookingViewModel
import com.agriride.app.viewmodels.WeatherViewModel

class SmartSchedulingActivity : BaseActivity() {

    private lateinit var binding: ActivitySmartSchedulingBinding
    private val bookingViewModel: BookingViewModel by viewModels()
    private val weatherViewModel: WeatherViewModel by viewModels()
    private var selectedTimeSlot = "7:00 AM – 10:00 AM"

    private var isSlot1Available = true
    private var isSlot2Available = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySmartSchedulingBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSmartBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        val draft = BookingViewModel.activeDraftBooking
        val date = intent.getStringExtra("BOOKING_DATE") ?: draft.date

        if (date.isNotBlank()) {
            binding.tvSmartDateDisplay.text = "📅 $date"
        }
        if (draft.location.isNotBlank()) {
            val locShort = draft.location.split(",").firstOrNull() ?: draft.location
            binding.tvSmartLocationPill.text = "$locShort, AP"
        }

        weatherViewModel.weatherForecast.observe(this) { weather ->
            val recommendations = bookingViewModel.getRecommendedTimeSlots(
                equipmentId = draft.equipmentId,
                date = date,
                activity = draft.activity,
                weather = weather
            )

            // Process recommendation 1: 7:00 AM – 10:00 AM
            val rec1 = recommendations.find { it.timeSlot.contains("7:00 AM") }
            if (rec1 != null) {
                isSlot1Available = rec1.isAvailable
                binding.tvRecommendEqStatus.text = if (rec1.isAvailable) "✔ Equipment: Available" else "❌ Equipment: Already Booked"
                binding.tvRecommendEqStatus.setTextColor(
                    if (rec1.isAvailable) ContextCompat.getColor(this, R.color.status_success)
                    else Color.RED
                )
                binding.tvRecommendWeatherStatus.text = "☀️ Weather: ${rec1.weatherCondition}"
                if (!rec1.isAvailable) {
                    binding.cardRecommendedSlot.setCardBackgroundColor(Color.parseColor("#F5F5F5"))
                    binding.cardRecommendedSlot.strokeColor = Color.parseColor("#E0E0E0")
                    binding.cardRecommendedSlot.isEnabled = false
                }
            }

            // Process recommendation 2: 10:00 AM – 1:00 PM
            val rec2 = recommendations.find { it.timeSlot.contains("10:00 AM") }
            if (rec2 != null) {
                isSlot2Available = rec2.isAvailable
                binding.tvRainEqStatus.text = if (rec2.isAvailable) "✔ Equipment: Available" else "❌ Equipment: Already Booked"
                binding.tvRainEqStatus.setTextColor(
                    if (rec2.isAvailable) ContextCompat.getColor(this, R.color.status_success)
                    else Color.RED
                )
                binding.tvRainWeatherStatus.text = "🌧️ Weather: ${rec2.weatherCondition}"
                if (!rec2.isAvailable) {
                    binding.cardRainSlot.setCardBackgroundColor(Color.parseColor("#F5F5F5"))
                    binding.cardRainSlot.strokeColor = Color.parseColor("#E0E0E0")
                    binding.cardRainSlot.isEnabled = false
                }
            }

            // Set default selected slot based on availability
            if (isSlot1Available) {
                selectSlot1()
            } else if (isSlot2Available) {
                selectSlot2()
            } else {
                binding.btnSelectSlot.isEnabled = false
                binding.btnSelectSlot.text = "No Slots Available today ❌"
                binding.btnSelectSlot.backgroundTintList = android.content.res.ColorStateList.valueOf(Color.GRAY)
            }
        }

        binding.cardRecommendedSlot.setOnClickListener {
            if (isSlot1Available) selectSlot1()
        }

        binding.cardRainSlot.setOnClickListener {
            if (isSlot2Available) selectSlot2()
        }

        binding.btnSelectSlot.setOnClickListener {
            val updatedDraft = BookingViewModel.activeDraftBooking
            BookingViewModel.activeDraftBooking = updatedDraft.copy(timeSlot = selectedTimeSlot)

            val intent = Intent(this, BookingSummaryActivity::class.java)
            startActivity(intent)
        }
    }

    private fun selectSlot1() {
        selectedTimeSlot = "7:00 AM – 10:00 AM"
        binding.cardRecommendedSlot.strokeWidth = 4
        binding.cardRecommendedSlot.strokeColor = ContextCompat.getColor(this, R.color.primary_green)
        binding.cardRainSlot.strokeWidth = 2
        binding.cardRainSlot.strokeColor = Color.parseColor("#E0E0E0")
        binding.btnSelectSlot.text = "Select Recommended Time (7:00 AM) ➔"
    }

    private fun selectSlot2() {
        selectedTimeSlot = "10:00 AM – 1:00 PM"
        binding.cardRainSlot.strokeWidth = 4
        binding.cardRainSlot.strokeColor = ContextCompat.getColor(this, R.color.primary_green)
        binding.cardRecommendedSlot.strokeWidth = 2
        binding.cardRecommendedSlot.strokeColor = Color.parseColor("#E0E0E0")
        binding.btnSelectSlot.text = "Select Rain Slot (10:00 AM) ➔"
        Toast.makeText(this, "Caution: Higher rain probability during midday slot", Toast.LENGTH_SHORT).show()
    }
}
