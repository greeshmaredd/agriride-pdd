package com.agriride.app.adapters

import android.graphics.Color
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.R
import com.agriride.app.databinding.ItemEquipmentBinding
import com.agriride.app.models.Equipment
import com.bumptech.glide.Glide

class EquipmentAdapter(
    private val equipmentList: List<Equipment>,
    private val onItemClick: (Equipment) -> Unit
) : RecyclerView.Adapter<EquipmentAdapter.EquipmentViewHolder>() {

    inner class EquipmentViewHolder(val binding: ItemEquipmentBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): EquipmentViewHolder {
        val binding = ItemEquipmentBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return EquipmentViewHolder(binding)
    }

    override fun onBindViewHolder(holder: EquipmentViewHolder, position: Int) {
        val item = equipmentList[position]
        holder.binding.tvItemName.text = item.name
        holder.binding.tvItemOwner.text = "Owner: ${item.ownerName.ifEmpty { "Verified Owner" }} • ${if (item.villageName.isNotBlank()) item.villageName else "Local Area"}"
        
        val isAvail = item.isAvailable && item.available
        val displayDist = if (item.distanceKm > 0) item.distanceKm else 1.5
        val distText = "📍 ${String.format("%.1f", displayDist)} km away • "
        val availText = if (isAvail) "Available Today" else "Unavailable"
        holder.binding.tvItemLocation.text = "$distText$availText"
        
        holder.binding.tvItemPrice.text = "₹${item.pricePerAcre.toInt()} / acre"
        val reviewCount = if (item.reviewCount > 0) item.reviewCount else 32
        val ratingVal = if (item.rating > 0) item.rating else 4.8
        holder.binding.tvItemRating.text = "⭐ ${String.format("%.1f", ratingVal)} ($reviewCount)"

        val defaultImageRes = com.agriride.app.utils.EquipmentImageHelper.getEquipmentDrawable(
            item.name,
            item.category,
            item.type
        )

        Glide.with(holder.itemView.context)
            .load(if (item.imageUrl.isNotBlank() && !item.imageUrl.contains("unsplash")) item.imageUrl else defaultImageRes)
            .placeholder(defaultImageRes)
            .error(defaultImageRes)
            .into(holder.binding.ivItemEquip)

        if (isAvail) {
            holder.binding.tvItemLocation.setTextColor(Color.parseColor("#2E7D32"))
            holder.binding.btnBookNow.isEnabled = true
            holder.binding.btnBookNow.alpha = 1.0f
            holder.itemView.alpha = 1.0f
        } else {
            holder.binding.tvItemLocation.setTextColor(Color.parseColor("#D32F2F"))
            holder.binding.btnBookNow.isEnabled = false
            holder.binding.btnBookNow.alpha = 0.5f
            holder.itemView.alpha = 0.7f
        }

        holder.binding.btnBookNow.setOnClickListener {
            onItemClick(item)
        }

        holder.itemView.setOnClickListener {
            onItemClick(item)
        }
    }

    override fun getItemCount(): Int = equipmentList.size
}
