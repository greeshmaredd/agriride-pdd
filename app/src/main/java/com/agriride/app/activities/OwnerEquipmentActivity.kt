package com.agriride.app.activities

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.R
import com.agriride.app.databinding.ActivityOwnerEquipmentBinding
import com.agriride.app.databinding.ItemOwnerEquipmentBinding
import com.agriride.app.models.Equipment
import com.agriride.app.viewmodels.EquipmentViewModel

class OwnerEquipmentActivity : BaseActivity() {

    private lateinit var binding: ActivityOwnerEquipmentBinding
    private val equipmentViewModel: EquipmentViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOwnerEquipmentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.rvOwnerEquipment.layoutManager = LinearLayoutManager(this)

        equipmentViewModel.getOwnerEquipmentList().observe(this) { equipList ->
            if (equipList.isEmpty()) {
                binding.rvOwnerEquipment.visibility = View.GONE
                binding.layoutEmptyEquipment.visibility = View.VISIBLE
            } else {
                binding.rvOwnerEquipment.visibility = View.VISIBLE
                binding.layoutEmptyEquipment.visibility = View.GONE

                val adapter = OwnerEquipmentAdapter(
                    equipments = equipList,
                    onToggleAvailability = { equipment -> handleToggleAvailability(equipment) },
                    onDeleteClick = { equipment -> handleDeleteEquipment(equipment) }
                )
                binding.rvOwnerEquipment.adapter = adapter
            }
        }

        binding.btnAddEquipmentTop.setOnClickListener {
            startActivity(Intent(this, AddEquipmentActivity::class.java))
        }

        binding.btnAddFirstEquipment.setOnClickListener {
            startActivity(Intent(this, AddEquipmentActivity::class.java))
        }
    }

    private fun handleToggleAvailability(equipment: Equipment) {
        val options = arrayOf("AVAILABLE", "UNAVAILABLE", "MAINTENANCE")
        AlertDialog.Builder(this)
            .setTitle("Set Availability for ${equipment.name}")
            .setItems(options) { dialog, which ->
                val newStatus = options[which]
                equipmentViewModel.updateEquipmentAvailability(equipment.equipmentId.ifBlank { equipment.id }, newStatus) { success ->
                    if (success) {
                        Toast.makeText(this, "Updated availability to $newStatus", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "Failed to update availability", Toast.LENGTH_SHORT).show()
                    }
                }
                dialog.dismiss()
            }
            .show()
    }

    private fun handleDeleteEquipment(equipment: Equipment) {
        AlertDialog.Builder(this)
            .setTitle("Delete Equipment")
            .setMessage("Are you sure you want to delete ${equipment.name}?")
            .setPositiveButton("Delete") { dialog, _ ->
                equipmentViewModel.deleteEquipment(equipment.equipmentId.ifBlank { equipment.id }) { success ->
                    if (success) {
                        Toast.makeText(this, "Equipment deleted successfully.", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "Failed to delete equipment.", Toast.LENGTH_SHORT).show()
                    }
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}

class OwnerEquipmentAdapter(
    private val equipments: List<Equipment>,
    private val onToggleAvailability: (Equipment) -> Unit,
    private val onDeleteClick: (Equipment) -> Unit
) : RecyclerView.Adapter<OwnerEquipmentAdapter.EquipmentViewHolder>() {

    inner class EquipmentViewHolder(val binding: ItemOwnerEquipmentBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): EquipmentViewHolder {
        val binding = ItemOwnerEquipmentBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return EquipmentViewHolder(binding)
    }

    override fun onBindViewHolder(holder: EquipmentViewHolder, position: Int) {
        val item = equipments[position]
        val context = holder.itemView.context

        holder.binding.tvOwnerEquipName.text = "🚜 ${item.name}"
        holder.binding.tvOwnerEquipType.text = "Category: ${item.type.ifBlank { item.category }}"
        holder.binding.tvOwnerEquipRate.text = "₹${item.pricePerAcre.toInt()} / acre"

        val village = if (item.villageName.isNotBlank()) item.villageName else item.location.ifBlank { "Location Available" }
        val distText = if (item.district.isNotBlank()) ", ${item.district}" else ""
        holder.binding.tvOwnerEquipLocation.text = "📍 $village$distText"

        val availStr = item.availability.ifBlank { if (item.isAvailable) "AVAILABLE" else "UNAVAILABLE" }
        holder.binding.tvOwnerEquipAvailabilityBadge.text = availStr
        val availColor = when (availStr.uppercase()) {
            "AVAILABLE" -> R.color.status_success
            "MAINTENANCE" -> R.color.accent_orange
            else -> R.color.status_error
        }
        holder.binding.tvOwnerEquipAvailabilityBadge.setTextColor(ContextCompat.getColor(context, availColor))

        val imgRes = com.agriride.app.utils.EquipmentImageHelper.getEquipmentDrawable(
            item.name,
            item.category,
            item.type
        )
        if (item.imageUrl.isNotBlank() && !item.imageUrl.contains("unsplash")) {
            com.bumptech.glide.Glide.with(context)
                .load(item.imageUrl)
                .placeholder(imgRes)
                .error(imgRes)
                .into(holder.binding.ivOwnerEquipImage)
        } else {
            holder.binding.ivOwnerEquipImage.setImageResource(imgRes)
        }

        holder.binding.btnToggleAvailability.setOnClickListener { onToggleAvailability(item) }
        holder.binding.btnDeleteEquipment.setOnClickListener { onDeleteClick(item) }
    }

    override fun getItemCount(): Int = equipments.size
}
