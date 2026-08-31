package com.agriride.app.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.databinding.ItemOwnerBookingBinding
import com.agriride.app.models.Booking

class OwnerBookingAdapter(
    private val bookings: List<Booking>,
    private val onAcceptClick: (Booking) -> Unit,
    private val onRejectClick: (Booking) -> Unit,
    private val onAssignWorkerClick: (Booking) -> Unit,
    private val onStartWorkClick: (Booking) -> Unit,
    private val onCompleteWorkClick: (Booking) -> Unit,
    private val onConfirmCashClick: (Booking) -> Unit,
    private val onItemClick: ((Booking) -> Unit)? = null
) : RecyclerView.Adapter<OwnerBookingAdapter.OwnerBookingViewHolder>() {

    inner class OwnerBookingViewHolder(val binding: ItemOwnerBookingBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OwnerBookingViewHolder {
        val binding = ItemOwnerBookingBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return OwnerBookingViewHolder(binding)
    }

    override fun onBindViewHolder(holder: OwnerBookingViewHolder, position: Int) {
        val item = bookings[position]

        holder.binding.tvBookingId.text = "Booking #${item.bookingId.ifBlank { item.id }}"
        holder.binding.tvEquipmentName.text = "🚜 Vehicle: ${item.equipmentName.ifBlank { "Tractor / Machinery" }}"
        val phoneSuffix = if (item.farmerPhone.isNotBlank()) " • 📞 ${item.farmerPhone}" else ""
        holder.binding.tvFarmerInfo.text = "👤 Booked By: ${item.farmerName.ifBlank { "Farmer" }}$phoneSuffix"
        holder.binding.tvActivity.text = "🌾 Work: ${item.activity} (${item.acres} Acres)"

        val dateStr = if (item.date.isNotBlank()) item.date else "28 Aug 2026"
        val timeStr = if (item.timeSlot.isNotBlank()) item.timeSlot else "7:00 AM"
        holder.binding.tvDateTime.text = "📅 Date & Time: $dateStr • $timeStr"

        val village = if (item.farmVillage.isNotBlank()) item.farmVillage else item.location.ifBlank { "Farm Location" }
        holder.binding.tvLocation.text = "📍 Farm Location: $village"

        val payText = if (item.paymentStatus == "PAID") "PAID" else "Cash Pending"
        holder.binding.tvEarnings.text = "💵 Earnings: ₹${item.totalAmount.toInt()} ($payText)"

        val bStatus = item.bookingStatus.ifBlank { item.status.name }
        holder.binding.tvBookingStatusChip.text = bStatus

        holder.binding.btnItemViewDetails.setOnClickListener {
            onItemClick?.invoke(item)
        }

        holder.itemView.setOnClickListener {
            onItemClick?.invoke(item)
        }

        // Dynamic Action Buttons Layout
        when (bStatus.uppercase()) {
            "PENDING" -> {
                holder.binding.layoutPendingActions.visibility = View.VISIBLE
                holder.binding.layoutConfirmedActions.visibility = View.GONE
                holder.binding.btnItemCompleteWork.visibility = View.GONE
                holder.binding.btnItemConfirmCash.visibility = View.GONE

                holder.binding.btnItemAccept.setOnClickListener { onAcceptClick(item) }
                holder.binding.btnItemReject.setOnClickListener { onRejectClick(item) }
            }
            "CONFIRMED" -> {
                holder.binding.layoutPendingActions.visibility = View.GONE
                holder.binding.layoutConfirmedActions.visibility = View.VISIBLE
                holder.binding.btnItemCompleteWork.visibility = View.GONE
                holder.binding.btnItemConfirmCash.visibility = View.GONE

                holder.binding.btnItemAssignWorker.setOnClickListener { onAssignWorkerClick(item) }
                holder.binding.btnItemStartWork.setOnClickListener { onStartWorkClick(item) }
            }
            "IN_PROGRESS" -> {
                holder.binding.layoutPendingActions.visibility = View.GONE
                holder.binding.layoutConfirmedActions.visibility = View.GONE
                holder.binding.btnItemCompleteWork.visibility = View.VISIBLE
                holder.binding.btnItemConfirmCash.visibility = View.GONE

                holder.binding.btnItemCompleteWork.setOnClickListener { onCompleteWorkClick(item) }
            }
            "COMPLETED" -> {
                holder.binding.layoutPendingActions.visibility = View.GONE
                holder.binding.layoutConfirmedActions.visibility = View.GONE
                holder.binding.btnItemCompleteWork.visibility = View.GONE

                if (item.paymentStatus != "PAID") {
                    holder.binding.btnItemConfirmCash.visibility = View.VISIBLE
                    holder.binding.btnItemConfirmCash.setOnClickListener { onConfirmCashClick(item) }
                } else {
                    holder.binding.btnItemConfirmCash.visibility = View.GONE
                }
            }
            else -> {
                holder.binding.layoutPendingActions.visibility = View.GONE
                holder.binding.layoutConfirmedActions.visibility = View.GONE
                holder.binding.btnItemCompleteWork.visibility = View.GONE
                holder.binding.btnItemConfirmCash.visibility = View.GONE
            }
        }
    }

    override fun getItemCount(): Int = bookings.size
}
