package com.agriride.app.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.databinding.ItemBookingBinding
import com.agriride.app.models.Booking
import com.agriride.app.models.BookingStatus

class BookingAdapter(
    private val bookings: List<Booking>,
    private val onDetailsClick: (Booking) -> Unit,
    private val onCancelClick: ((Booking) -> Unit)? = null,
    private val onFarmerCompleteWork: ((Booking) -> Unit)? = null
) : RecyclerView.Adapter<BookingAdapter.BookingViewHolder>() {

    inner class BookingViewHolder(val binding: ItemBookingBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BookingViewHolder {
        val binding = ItemBookingBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return BookingViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BookingViewHolder, position: Int) {
        val item = bookings[position]
        val imgRes = com.agriride.app.utils.EquipmentImageHelper.getEquipmentDrawable(
            item.equipmentName,
            item.equipmentName,
            item.equipmentName
        )
        holder.binding.ivBookThumb.setImageResource(imgRes)

        holder.binding.tvBookId.text = "ID: #${item.bookingId}"
        holder.binding.tvBookEquip.text = item.equipmentName
        val ownerRate = if (item.ratePerAcre > 0) " • ₹${item.ratePerAcre.toInt()}/acre" else ""
        holder.binding.tvBookOwner.text = "Owner: ${item.ownerName.ifBlank { "Machinery Owner" }}$ownerRate"
        holder.binding.tvBookActivitySub.text = "Activity: ${item.activity} (${item.acres} Acres)"
        holder.binding.tvBookSub.text = "📅 ${item.date} • ${item.timeSlot}"
        
        val rate = if (item.ratePerAcre > 0) item.ratePerAcre else 1200.0
        val calcCost = rate * item.acres
        val total = if (item.equipmentCost > 0) item.equipmentCost else calcCost
        holder.binding.tvBookTotal.text = "₹${total.toInt()}"

        val statusText = when (item.status) {
            BookingStatus.PENDING -> "Pending"
            BookingStatus.CONFIRMED -> "On The Way"
            BookingStatus.REJECTED -> "Rejected"
            BookingStatus.ON_THE_WAY -> "On The Way"
            BookingStatus.IN_PROGRESS -> "In Progress"
            BookingStatus.COMPLETED -> "Completed"
            BookingStatus.CANCELLED -> "Cancelled"
        }
        holder.binding.tvBookStatusBadge.text = statusText

        if (item.status == BookingStatus.COMPLETED) {
            holder.binding.btnTrackBookingItem.text = "📋 View Work & Invoice"
            holder.binding.btnTrackBookingItem.setBackgroundColor(android.graphics.Color.parseColor("#164E24"))
            holder.binding.btnTrackBookingItem.setTextColor(android.graphics.Color.WHITE)
        } else {
            holder.binding.btnTrackBookingItem.text = "View Details"
            holder.binding.btnTrackBookingItem.setBackgroundColor(android.graphics.Color.parseColor("#164E24"))
            holder.binding.btnTrackBookingItem.setTextColor(android.graphics.Color.WHITE)
        }

        val canFarmerComplete = item.status == BookingStatus.CONFIRMED ||
                                item.status == BookingStatus.ON_THE_WAY ||
                                item.status == BookingStatus.IN_PROGRESS ||
                                item.bookingStatus.equals("CONFIRMED", ignoreCase = true) ||
                                item.bookingStatus.equals("IN_PROGRESS", ignoreCase = true) ||
                                item.bookingStatus.equals("ON_THE_WAY", ignoreCase = true)

        if (canFarmerComplete) {
            holder.binding.btnCompleteWorkFarmer.visibility = View.VISIBLE
            holder.binding.btnCompleteWorkFarmer.setOnClickListener {
                onFarmerCompleteWork?.invoke(item)
            }
        } else {
            holder.binding.btnCompleteWorkFarmer.visibility = View.GONE
        }

        holder.binding.btnTrackBookingItem.setOnClickListener {
            onDetailsClick(item)
        }

        holder.itemView.setOnClickListener {
            onDetailsClick(item)
        }
    }

    override fun getItemCount(): Int = bookings.size
}
