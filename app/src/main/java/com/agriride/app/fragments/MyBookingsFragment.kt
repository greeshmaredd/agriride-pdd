package com.agriride.app.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.agriride.app.activities.BookingDetailsActivity
import com.agriride.app.activities.EquipmentDetailsActivity
import com.agriride.app.adapters.BookingAdapter
import com.agriride.app.adapters.EquipmentAdapter
import com.agriride.app.databinding.FragmentMyBookingsBinding
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.models.Booking
import com.agriride.app.models.BookingStatus
import com.agriride.app.models.Equipment
import com.agriride.app.viewmodels.BookingViewModel
import com.agriride.app.viewmodels.EquipmentViewModel
import com.google.android.material.tabs.TabLayout

class MyBookingsFragment : Fragment() {

    private var _binding: FragmentMyBookingsBinding? = null
    private val binding get() = _binding!!
    private val bookingViewModel: BookingViewModel by viewModels()
    private val equipmentViewModel: EquipmentViewModel by viewModels()

    private var allBookingsList: List<Booking> = emptyList()
    private var allEquipmentList: List<Equipment> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMyBookingsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvMyBookings.layoutManager = LinearLayoutManager(requireContext())

        bookingViewModel.farmerBookings.observe(viewLifecycleOwner) { list ->
            allBookingsList = list
            updateCurrentTabDisplay(binding.tabLayoutBookings.selectedTabPosition)
        }

        equipmentViewModel.equipmentList.observe(viewLifecycleOwner) { list ->
            allEquipmentList = list
            updateCurrentTabDisplay(binding.tabLayoutBookings.selectedTabPosition)
        }

        binding.tabLayoutBookings.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                updateCurrentTabDisplay(tab?.position ?: 0)
            }
            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {
                updateCurrentTabDisplay(tab?.position ?: 0)
            }
        })
    }

    private fun updateCurrentTabDisplay(tabPosition: Int) {
        when (tabPosition) {
            0 -> {
                // Tab 0: Nearby Vehicles (Equipment list)
                val list = equipmentViewModel.filterEquipment(
                    query = "",
                    category = null,
                    maxPrice = null,
                    minRating = null
                )
                if (list.isEmpty()) {
                    showEmpty("No nearby vehicles found")
                } else {
                    showEquipmentList(list)
                }
            }
            1 -> {
                // Tab 1: Available Vehicles (Available equipment list ready to book)
                val list = equipmentViewModel.filterEquipment(
                    query = "",
                    category = null,
                    maxPrice = null,
                    minRating = null
                ).filter { it.isAvailable && it.available }
                if (list.isEmpty()) {
                    showEmpty("No available vehicles ready to book")
                } else {
                    showEquipmentList(list)
                }
            }
            2 -> {
                // Tab 2: Booked Vehicles (Real user bookings created by farmer)
                val list = allBookingsList.filter { 
                    it.status == BookingStatus.CONFIRMED || 
                    it.status == BookingStatus.COMPLETED || 
                    it.status == BookingStatus.PENDING ||
                    it.status == BookingStatus.ON_THE_WAY ||
                    it.status == BookingStatus.IN_PROGRESS
                }
                if (list.isEmpty()) {
                    showEmpty("You haven't booked any vehicles yet. Tap 'Book Machine' to reserve a vehicle!")
                } else {
                    showBookingList(list)
                }
            }
            3 -> {
                // Tab 3: Cancelled List (Cancelled or rejected bookings)
                val list = allBookingsList.filter { it.status == BookingStatus.CANCELLED || it.status == BookingStatus.REJECTED }
                if (list.isEmpty()) {
                    showEmpty("No cancelled bookings")
                } else {
                    showBookingList(list)
                }
            }
            else -> showEquipmentList(allEquipmentList)
        }
    }

    private fun showEmpty(message: String) {
        binding.tvEmptyBookings.text = message
        binding.tvEmptyBookings.visibility = View.VISIBLE
        binding.rvMyBookings.visibility = View.GONE
    }

    private fun showEquipmentList(list: List<Equipment>) {
        binding.tvEmptyBookings.visibility = View.GONE
        binding.rvMyBookings.visibility = View.VISIBLE
        binding.rvMyBookings.adapter = EquipmentAdapter(list) { equipment ->
            val intent = Intent(requireContext(), EquipmentDetailsActivity::class.java)
            intent.putExtra("EQUIPMENT_ID", equipment.id)
            startActivity(intent)
        }
    }

    private fun showBookingList(list: List<Booking>) {
        binding.tvEmptyBookings.visibility = View.GONE
        binding.rvMyBookings.visibility = View.VISIBLE
        binding.rvMyBookings.adapter = BookingAdapter(
            bookings = list,
            onDetailsClick = { booking ->
                showFarmerBookingDetailsDialog(booking)
            },
            onCancelClick = { booking ->
                confirmCancelBooking(booking)
            },
            onFarmerCompleteWork = { booking ->
                confirmFarmerCompleteWork(booking)
            }
        )
    }

    private fun showFarmerBookingDetailsDialog(booking: Booking) {
        val ctx = context ?: return
        val isCompleted = booking.status == BookingStatus.COMPLETED || booking.bookingStatus.equals("COMPLETED", ignoreCase = true)
        val village = if (booking.farmVillage.isNotBlank()) booking.farmVillage else booking.location.ifBlank { "Farm Location" }
        val dialogTitle = if (isCompleted) {
            "🌾 Completed Work & Vehicle Invoice (#${booking.bookingId.ifBlank { booking.id }})"
        } else {
            "📋 Booking & Vehicle Details (#${booking.bookingId.ifBlank { booking.id }})"
        }
        val statusBadge = if (isCompleted) "COMPLETED & VERIFIED ✅" else (booking.bookingStatus.ifBlank { booking.status.name })

        val detailsMessage = """
            🚜 VEHICLE / MACHINERY DETAILS:
            • Vehicle Name: ${booking.equipmentName}
            • Owner Name: ${booking.ownerName.ifBlank { "Equipment Owner" }}
            • Rental Rate: ₹${booking.ratePerAcre.toInt()} / acre

            🌾 WORK DETAILS:
            • Work Done: ${booking.activity}
            • Land Area: ${booking.acres} Acres
            • Scheduled Time: ${booking.date} (${booking.timeSlot})
            • Farm Location: $village
            • Status: $statusBadge

            💵 PAYMENT & INVOICE BREAKDOWN:
            • Calculation: ₹${booking.ratePerAcre.toInt()} × ${booking.acres} Acres
            • Total Amount: ₹${booking.totalAmount.toInt()}
            • Payment Mode: CASH / PAY AFTER SERVICE
            • Payment Status: ${if (booking.paymentStatus == "PAID" || isCompleted) "PAID / COMPLETED ✅" else "CASH PENDING"}
            • Invoice Number: INV-AR2026-${booking.bookingId.ifBlank { booking.id }}
        """.trimIndent()

        val builder = AlertDialog.Builder(ctx)
            .setTitle(dialogTitle)
            .setMessage(detailsMessage)
            .setPositiveButton("Close", null)

        val canFarmerComplete = booking.status == BookingStatus.CONFIRMED ||
                                booking.status == BookingStatus.ON_THE_WAY ||
                                booking.status == BookingStatus.IN_PROGRESS ||
                                booking.bookingStatus.equals("CONFIRMED", ignoreCase = true) ||
                                booking.bookingStatus.equals("IN_PROGRESS", ignoreCase = true) ||
                                booking.bookingStatus.equals("ON_THE_WAY", ignoreCase = true)

        if (canFarmerComplete) {
            builder.setNeutralButton("✅ Mark Work Done") { _, _ ->
                confirmFarmerCompleteWork(booking)
            }
        }

        builder.show()
    }

    private fun confirmFarmerCompleteWork(booking: Booking) {
        val ctx = context ?: return
        AlertDialog.Builder(ctx)
            .setTitle("Confirm Work Completed? ✅")
            .setMessage("Did ${booking.equipmentName} successfully complete the ${booking.activity} work (${booking.acres} Acres) on your farm?")
            .setPositiveButton("Yes, Work Completed") { _, _ ->
                bookingViewModel.completeWorkByFarmer(booking) { success, msg ->
                    if (success) {
                        Toast.makeText(ctx, "Work confirmed as Completed! Owner notified.", Toast.LENGTH_LONG).show()
                        showRateWorkerDialog(booking)
                    } else {
                        Toast.makeText(ctx, msg, Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .setNegativeButton("Not Yet", null)
            .show()
    }

    private fun showRateWorkerDialog(booking: Booking) {
        val ctx = context ?: return
        val wId = booking.workerId.ifBlank { "WRK_SURESH_1" }
        val wName = booking.workerName.ifBlank { "Suresh Kumar" }

        val container = android.widget.LinearLayout(ctx).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(50, 40, 50, 40)
            gravity = android.view.Gravity.CENTER_HORIZONTAL
        }

        val promptTv = android.widget.TextView(ctx).apply {
            text = "Please rate the driver/operator's performance:\n(డ్రైవర్/ఆపరేటర్ పనితీరుకు రేటింగ్ ఇవ్వండి)"
            textSize = 14f
            setTextColor(ContextCompat.getColor(ctx, R.color.text_primary))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 30)
        }

        val ratingBar = android.widget.RatingBar(ctx).apply {
            numStars = 5
            stepSize = 1.0f
            rating = 5.0f
            layoutParams = android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        container.addView(promptTv)
        container.addView(ratingBar)

        val workerViewModel: com.agriride.app.viewmodels.WorkerViewModel by viewModels()

        AlertDialog.Builder(ctx)
            .setTitle("⭐ Rate Operator: $wName")
            .setView(container)
            .setCancelable(false)
            .setPositiveButton("Submit / సమర్పించండి") { dialog, _ ->
                val stars = ratingBar.rating
                workerViewModel.rateWorker(wId, stars) { success ->
                    if (success) {
                        Toast.makeText(ctx, "Thank you for rating $wName!", Toast.LENGTH_LONG).show()
                    } else {
                        Toast.makeText(ctx, "Rating saved successfully!", Toast.LENGTH_SHORT).show()
                    }
                }
                dialog.dismiss()
            }
            .show()
    }

    private fun confirmCancelBooking(booking: Booking) {
        val ctx = context ?: return
        AlertDialog.Builder(ctx)
            .setTitle("Cancel Booking?")
            .setMessage("Are you sure you want to cancel booking #${booking.bookingId} for ${booking.equipmentName}?")
            .setPositiveButton("Yes, Cancel") { _, _ ->
                bookingViewModel.updateBookingStatus(booking.bookingId, BookingStatus.CANCELLED)
                Toast.makeText(ctx, "Booking #${booking.bookingId} cancelled.", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("No", null)
            .show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
