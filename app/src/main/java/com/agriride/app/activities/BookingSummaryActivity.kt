package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityBookingSummaryBinding
import com.agriride.app.viewmodels.BookingViewModel

class BookingSummaryActivity : BaseActivity() {

    private lateinit var binding: ActivityBookingSummaryBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookingSummaryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnSummaryBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.btnEditBooking.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        val draft = BookingViewModel.activeDraftBooking

        val imgRes = com.agriride.app.utils.EquipmentImageHelper.getEquipmentDrawable(
            draft.equipmentName,
            draft.equipmentName,
            draft.equipmentName
        )
        binding.ivSumEquipThumb.setImageResource(imgRes)

        binding.tvSumEquip.text = draft.equipmentName.ifEmpty { "Mahindra 575 DI Tractor" }
        binding.tvSumOwner.text = draft.ownerName.ifEmpty { "Ramesh Patel" }
        binding.tvSumLocation.text = if (draft.location.isNotBlank()) draft.location else "Kothapalli, AP"
        binding.tvSumActivity.text = draft.activity.ifEmpty { "Ploughing" }

        val dateText = if (draft.date.isNotBlank()) draft.date.take(6) else "28 Aug"
        val slotText = if (draft.timeSlot.isNotBlank()) draft.timeSlot else "7:00-10:00 AM"
        binding.tvSumSlot.text = "$dateText • $slotText"

        val acres = if (draft.acres > 0.0) draft.acres else 4.0
        val acresDisplay = if (acres % 1.0 == 0.0) acres.toInt().toString() else acres.toString()
        binding.tvSumLandSize.text = "$acresDisplay Acres"

        val rate = if (draft.ratePerAcre > 0.0) draft.ratePerAcre else 1200.0
        val cost = if (draft.equipmentCost > 0.0) draft.equipmentCost else rate * acres
        val serviceFee = 150.0
        val total = cost + serviceFee

        binding.tvSumRateCalc.text = "Rate (₹${rate.toInt()} × $acresDisplay Acres):"
        binding.tvEquipmentCost.text = "₹${cost.toInt()}"
        binding.tvServiceFee.text = "₹${serviceFee.toInt()}"

        BookingViewModel.activeDraftBooking = draft.copy(
            acres = acres,
            equipmentCost = cost,
            serviceFee = serviceFee,
            totalAmount = total
        )

        binding.btnConfirmSummary.setOnClickListener {
            val intent = Intent(this, PaymentActivity::class.java)
            startActivity(intent)
        }
    }
}
