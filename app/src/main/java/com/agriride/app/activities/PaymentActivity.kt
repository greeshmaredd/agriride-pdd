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
import com.agriride.app.databinding.ActivityPaymentBinding
import com.agriride.app.models.Booking
import com.agriride.app.models.BookingStatus
import com.agriride.app.models.PaymentRecord
import com.agriride.app.viewmodels.BookingViewModel
import com.agriride.app.viewmodels.PaymentViewModel

class PaymentActivity : BaseActivity() {

    private lateinit var binding: ActivityPaymentBinding
    private val bookingViewModel: BookingViewModel by viewModels()
    private val paymentViewModel: PaymentViewModel by viewModels()

    private var activeDraft: Booking = BookingViewModel.activeDraftBooking
    private var selectedPaymentMethod = "CASH"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPaymentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnPaymentBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        activeDraft = BookingViewModel.activeDraftBooking
        val totalAmount = if (activeDraft.totalAmount > 0) activeDraft.totalAmount else 4950.0

        binding.tvPayAmountBanner.text = "₹${totalAmount.toInt()}"
        binding.btnPayNow.text = "Confirm Booking (CASH PAYMENT) 🛡️"

        // Default: Cash selected
        selectMethod("CASH")

        binding.cardPayCash.setOnClickListener { selectMethod("CASH") }

        binding.btnPayNow.setOnClickListener {
            startPaymentProcess()
        }
    }

    private fun selectMethod(method: String) {
        selectedPaymentMethod = method
        val green = ContextCompat.getColor(this, R.color.primary_green)

        binding.cardPayCash.strokeWidth = 4
        binding.cardPayCash.strokeColor = green
        binding.radioCash.text = "●"
        binding.radioCash.backgroundTintList = android.content.res.ColorStateList.valueOf(green)
    }

    private fun startPaymentProcess() {
        binding.btnPayNow.isEnabled = false
        binding.payProgressBar.visibility = View.VISIBLE

        val pendingBookingId = "AR${(System.currentTimeMillis() % 1000000000)}"
        val pendingPaymentId = "PAY${(System.currentTimeMillis() % 1000000000)}"
        val amount = if (activeDraft.totalAmount > 0) activeDraft.totalAmount else 4950.0

        val record = PaymentRecord(
            paymentId = pendingPaymentId,
            bookingId = pendingBookingId,
            farmerId = activeDraft.farmerId,
            ownerId = activeDraft.ownerId,
            amount = amount,
            currency = "INR",
            paymentMethod = "CASH",
            status = "CASH_PENDING"
        )

        val confirmedBooking = activeDraft.copy(
            bookingId = pendingBookingId,
            status = BookingStatus.PENDING, // Screen requires initial status as PENDING
            bookingStatus = "PENDING",
            paymentStatus = "CASH_PENDING"
        )

        bookingViewModel.createBooking(confirmedBooking)
        paymentViewModel.savePaymentRecord(record) { _ ->
            binding.payProgressBar.visibility = View.GONE
            Toast.makeText(this, "Booking Requested! Pay ₹${amount.toInt()} cash after service.", Toast.LENGTH_LONG).show()

            val intent = Intent(this, BookingSuccessActivity::class.java)
            intent.putExtra("BOOKING_ID", pendingBookingId)
            intent.putExtra("AMOUNT", amount)
            startActivity(intent)
            finish()
        }
    }
}
