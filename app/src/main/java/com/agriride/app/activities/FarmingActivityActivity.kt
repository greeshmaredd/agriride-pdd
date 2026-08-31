package com.agriride.app.activities

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.databinding.ActivityFarmingActivityBinding
import com.agriride.app.viewmodels.BookingViewModel

class FarmingActivityActivity : BaseActivity() {

    private lateinit var binding: ActivityFarmingActivityBinding
    private var selectedActivity = "Ploughing"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFarmingActivityBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val draft = BookingViewModel.activeDraftBooking
        val eqName = draft.equipmentName.ifEmpty { "Selected Vehicle" }
        binding.tvQuestionSub.text = "Choose farming activity for $eqName:"

        binding.btnFarmingActBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.cardPloughing.setOnClickListener {
            selectedActivity = "Ploughing"
            highlightSelected("PLOUGHING")
        }

        binding.cardSowing.setOnClickListener {
            selectedActivity = "Sowing"
            highlightSelected("SOWING")
        }

        binding.cardSpraying.setOnClickListener {
            selectedActivity = "Fertilizer Spraying"
            highlightSelected("SPRAYING")
        }

        binding.btnContinueFarmingAct.setOnClickListener {
            val draft = BookingViewModel.activeDraftBooking
            BookingViewModel.activeDraftBooking = draft.copy(activity = selectedActivity)

            val intent = Intent(this, BookingDetailsActivity::class.java)
            intent.putExtra("SELECTED_ACTIVITY", selectedActivity)
            startActivity(intent)
        }
    }

    private fun highlightSelected(type: String) {
        val green = ContextCompat.getColor(this, R.color.primary_green)

        binding.cardPloughing.strokeWidth = if (type == "PLOUGHING") 4 else 2
        binding.cardPloughing.strokeColor = if (type == "PLOUGHING") green else Color.parseColor("#E0E0E0")
        binding.tvCheckPloughing.text = if (type == "PLOUGHING") "✓" else ""
        binding.tvCheckPloughing.setBackgroundResource(R.drawable.bg_dashed_circle)
        binding.tvCheckPloughing.backgroundTintList = android.content.res.ColorStateList.valueOf(if (type == "PLOUGHING") green else Color.parseColor("#E0E0E0"))

        binding.cardSowing.strokeWidth = if (type == "SOWING") 4 else 2
        binding.cardSowing.strokeColor = if (type == "SOWING") green else Color.parseColor("#E0E0E0")
        binding.tvCheckSowing.text = if (type == "SOWING") "✓" else ""
        binding.tvCheckSowing.setBackgroundResource(R.drawable.bg_dashed_circle)
        binding.tvCheckSowing.backgroundTintList = android.content.res.ColorStateList.valueOf(if (type == "SOWING") green else Color.parseColor("#E0E0E0"))

        binding.cardSpraying.strokeWidth = if (type == "SPRAYING") 4 else 2
        binding.cardSpraying.strokeColor = if (type == "SPRAYING") green else Color.parseColor("#E0E0E0")
        binding.tvCheckSpraying.text = if (type == "SPRAYING") "✓" else ""
        binding.tvCheckSpraying.setBackgroundResource(R.drawable.bg_dashed_circle)
        binding.tvCheckSpraying.backgroundTintList = android.content.res.ColorStateList.valueOf(if (type == "SPRAYING") green else Color.parseColor("#E0E0E0"))
    }
}
