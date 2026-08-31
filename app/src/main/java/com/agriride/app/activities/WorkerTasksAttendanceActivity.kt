package com.agriride.app.activities

import android.app.AlertDialog
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.widget.EditText
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.databinding.ActivityWorkerTasksAttendanceBinding
import com.agriride.app.models.Notification
import com.agriride.app.repositories.NotificationRepository
import com.agriride.app.viewmodels.WorkerViewModel

class WorkerTasksAttendanceActivity : BaseActivity() {

    private lateinit var binding: ActivityWorkerTasksAttendanceBinding
    private val workerViewModel: WorkerViewModel by viewModels()
    private var isOnDuty = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWorkerTasksAttendanceBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnWorkerTasksBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        // Toggle Shift Check-In / Check-Out
        binding.btnCheckOutWorker.setOnClickListener {
            val updated = workerViewModel.toggleCheckInStatus()
            isOnDuty = !isOnDuty
            if (isOnDuty) {
                binding.tvShiftBadge.text = "🟢 On Duty"
                binding.tvShiftBadge.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#E8F5E9"))
                binding.tvShiftBadge.setTextColor(Color.parseColor("#2E7D32"))
                binding.btnCheckOutWorker.text = "🔘 Check Out of Shift / షిఫ్ట్ ముగించండి"
                binding.btnCheckOutWorker.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#C62828"))
                Toast.makeText(this, "Shift Check-In recorded at field! Status: On Duty", Toast.LENGTH_SHORT).show()
            } else {
                binding.tvShiftBadge.text = "🔴 Off Duty"
                binding.tvShiftBadge.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#FFEBEE"))
                binding.tvShiftBadge.setTextColor(Color.parseColor("#C62828"))
                binding.btnCheckOutWorker.text = "🟢 Check In for Field Shift / హాజరు నమోదు"
                binding.btnCheckOutWorker.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#2E7D32"))
                Toast.makeText(this, "Shift Check-Out recorded! Today's wage: ₹1,200", Toast.LENGTH_SHORT).show()
            }
        }

        // Request Advance from Owner
        binding.btnRequestAdvance.setOnClickListener {
            showAdvanceRequestDialog()
        }

        // Call Fleet Owner
        binding.btnCallOwnerPayout.setOnClickListener {
            val callIntent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:+919848022338")
            }
            startActivity(callIntent)
        }
    }

    private fun showAdvanceRequestDialog() {
        val input = EditText(this).apply {
            hint = "Enter Advance Amount (e.g. 2000)"
            inputType = android.text.InputType.TYPE_CLASS_NUMBER
            setText("2000")
            setPadding(40, 30, 40, 30)
        }

        AlertDialog.Builder(this)
            .setTitle("💵 Request Wage Advance / అడ్వాన్స్ కోరండి")
            .setMessage("Request wage advance from Fleet Owner for emergency or diesel expenses:")
            .setView(input)
            .setPositiveButton("Submit Request") { dialog, _ ->
                val amountStr = input.text.toString().trim()
                val amount = amountStr.toDoubleOrNull() ?: 2000.0
                NotificationRepository.sendNotification(
                    this,
                    Notification(
                        notificationId = "NOTIF_${System.currentTimeMillis()}",
                        userId = "USR_OWNER_1",
                        title = "💵 Driver Advance Request / అడ్వాన్స్ అభ్యర్థన",
                        message = "Driver Suresh Kumar requested wage advance of ₹${amount.toInt()}.",
                        createdAt = System.currentTimeMillis(),
                        type = "WAGE_ADVANCE"
                    )
                )
                Toast.makeText(this, "Advance request for ₹${amount.toInt()} sent to Owner!", Toast.LENGTH_LONG).show()
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
