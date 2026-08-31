package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityEquipmentDetailsBinding
import com.agriride.app.models.Booking
import com.agriride.app.viewmodels.BookingViewModel
import com.agriride.app.viewmodels.EquipmentViewModel

class EquipmentDetailsActivity : BaseActivity() {

    private lateinit var binding: ActivityEquipmentDetailsBinding
    private val equipmentViewModel: EquipmentViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEquipmentDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnDetailBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        val equipmentId = intent.getStringExtra("EQUIPMENT_ID") ?: "EQ101"
        val equipment = equipmentViewModel.getEquipmentById(equipmentId)

        if (equipment != null) {
            val imageRes = com.agriride.app.utils.EquipmentImageHelper.getEquipmentDrawable(
                equipment.name,
                equipment.category,
                equipment.type
            )

            com.bumptech.glide.Glide.with(this)
                .load(if (equipment.imageUrl.isNotBlank() && !equipment.imageUrl.contains("unsplash")) equipment.imageUrl else imageRes)
                .placeholder(imageRes)
                .error(imageRes)
                .into(binding.ivEqDetailHeader)

            binding.tvEqName.text = equipment.name
            binding.tvEqOwnerName.text = equipment.ownerName.ifEmpty { "Ramesh Patel" }
            binding.tvOwnerAvatarText.text = if (equipment.ownerName.isNotBlank()) equipment.ownerName.take(2).uppercase() else "RP"
            binding.tvOwnerRating.text = "⭐ ${equipment.rating} (42)"
            binding.tvEqPrice.text = "₹${equipment.pricePerAcre.toInt()}"

            val locText = if (equipment.villageName.isNotBlank()) "${equipment.villageName}, ${equipment.district.ifBlank { "Local District" }}" else equipment.location.ifBlank { "Local Area" }
            val distText = if (equipment.distanceKm > 0) " (${String.format("%.1f", equipment.distanceKm)} km away)" else ""
            binding.tvEqLocationSub.text = "📍 $locText$distText"

            binding.tvEqDesc.text = equipment.description.ifEmpty {
                "Heavy duty 50HP tractor equipped with 36-blade rotavator for deep ploughing and wet soil preparation. Driven by experienced worker."
            }

            val isAvail = equipment.isAvailable && equipment.available
            if (!isAvail) {
                binding.tvDetailAvailBadge.text = "Currently Unavailable"
                binding.tvDetailAvailBadge.setTextColor(android.graphics.Color.RED)
                binding.btnBookNow.isEnabled = false
                binding.btnBookNow.text = "Currently Unavailable"
            } else {
                binding.tvDetailAvailBadge.text = "Available Today"
            }
        }

        binding.btnBookNow.setOnClickListener {
            val selectedEq = equipment ?: equipmentViewModel.getEquipmentById("EQ101")!!
            if (!selectedEq.isAvailable || !selectedEq.available) {
                Toast.makeText(this, "This equipment is currently unavailable.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            BookingViewModel.activeDraftBooking = Booking(
                equipmentId = selectedEq.id,
                equipmentName = selectedEq.name,
                ownerName = selectedEq.ownerName,
                ownerId = selectedEq.ownerId,
                ratePerAcre = selectedEq.pricePerAcre
            )
            val intent = Intent(this, FarmingActivityActivity::class.java)
            intent.putExtra("EQUIPMENT_ID", selectedEq.id)
            startActivity(intent)
        }
    }
}
