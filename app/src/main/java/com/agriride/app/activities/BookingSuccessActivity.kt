package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityBookingSuccessBinding
import com.agriride.app.viewmodels.BookingViewModel

class BookingSuccessActivity : BaseActivity() {

    private lateinit var binding: ActivityBookingSuccessBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookingSuccessBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val bookingId = intent.getStringExtra("BOOKING_ID") ?: "AR20260825001"
        val amount = intent.getDoubleExtra("AMOUNT", 4950.0)

        val draft = BookingViewModel.activeDraftBooking

        binding.tvBookingId.text = "Booking ID: #$bookingId"
        binding.tvSuccessEquip.text = draft.equipmentName.ifEmpty { "Mahindra 575 DI Tractor" }
        binding.tvSuccessSlot.text = "${draft.date.ifEmpty { "28 Aug 2026" }} • ${draft.timeSlot.ifEmpty { "7:00 AM" }}"
        binding.tvSuccessLocation.text = draft.location.ifEmpty { "My Farm Location" }
        binding.tvSuccessAmount.text = "₹${amount.toInt()}"

        binding.btnTrackSuccess.setOnClickListener {
            val intent = Intent(this, FarmerMainActivity::class.java)
            intent.putExtra("NAV_TAB", "BOOKINGS")
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            finish()
        }

        binding.btnGoToBookings.setOnClickListener {
            val intent = Intent(this, FarmerMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(intent)
            finish()
        }
    }
}
