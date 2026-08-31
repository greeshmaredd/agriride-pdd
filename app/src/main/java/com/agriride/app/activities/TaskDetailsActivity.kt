package com.agriride.app.activities

import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.databinding.ActivityTaskDetailsBinding
import com.agriride.app.viewmodels.WorkerViewModel

class TaskDetailsActivity : BaseActivity() {

    private lateinit var binding: ActivityTaskDetailsBinding
    private val workerViewModel: WorkerViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityTaskDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnTaskDetBack.setOnClickListener {
            finish()
        }

        binding.btnCallFarmerDet.setOnClickListener {
            val callIntent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:+919848022338")
            }
            startActivity(callIntent)
        }

        binding.btnMarkTaskComplete.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Mark Task Completed / పని పూర్తయింది")
                .setMessage("Confirm that the 4-acre deep ploughing operation is completed and ready for farmer handover?")
                .setPositiveButton("Yes, Confirm Completion") { dialog, _ ->
                    workerViewModel.toggleTaskCompletion("TSK901")
                    binding.tvTaskStatusBadge.text = "Completed ✅"
                    binding.tvTaskStatusBadge.setTextColor(ContextCompat.getColor(this, R.color.status_success))
                    binding.btnMarkTaskComplete.text = "Operation Completed ✅"
                    binding.btnMarkTaskComplete.isEnabled = false
                    binding.btnMarkTaskComplete.backgroundTintList = ContextCompat.getColorStateList(this, R.color.text_muted)
                    Toast.makeText(this, "Ploughing task marked Completed! Notification sent to Owner.", Toast.LENGTH_SHORT).show()
                    dialog.dismiss()
                }
                .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
                .show()
        }
    }
}
