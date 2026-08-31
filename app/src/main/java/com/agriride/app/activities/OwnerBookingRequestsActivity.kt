package com.agriride.app.activities

import android.app.AlertDialog
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.agriride.app.R
import com.agriride.app.adapters.OwnerBookingAdapter
import com.agriride.app.databinding.ActivityOwnerBookingRequestsBinding
import com.agriride.app.models.Booking
import com.agriride.app.models.Worker
import com.agriride.app.viewmodels.BookingViewModel
import com.agriride.app.viewmodels.PaymentViewModel
import com.agriride.app.viewmodels.WorkerViewModel

class OwnerBookingRequestsActivity : BaseActivity() {

    private lateinit var binding: ActivityOwnerBookingRequestsBinding
    private val bookingViewModel: BookingViewModel by viewModels()
    private val paymentViewModel: PaymentViewModel by viewModels()
    private val workerViewModel: WorkerViewModel by viewModels()

    private var allOwnerBookings: List<Booking> = emptyList()
    private var availableWorkers: List<Worker> = emptyList()
    private var currentFilter: String = "PENDING"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOwnerBookingRequestsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnOwnerReqBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.rvOwnerBookings.layoutManager = LinearLayoutManager(this)

        // Observe workers for worker assignment
        workerViewModel.getOwnerWorkers().observe(this) { workers ->
            availableWorkers = workers.filter { it.availability.equals("AVAILABLE", ignoreCase = true) }
        }

        // Observe owner bookings from Firebase Realtime Database
        bookingViewModel.getOwnerBookings().observe(this) { bookings ->
            allOwnerBookings = bookings
            
            // Set dynamic badge count for pending requests
            val pendingCount = bookings.count { it.bookingStatus.equals("PENDING", ignoreCase = true) || it.status.name.equals("PENDING", ignoreCase = true) }
            binding.tvPendingCountBadge.text = "$pendingCount Pending"

            filterAndDisplayBookings()
        }

        val initFilter = intent.getStringExtra("INITIAL_FILTER")
        if (initFilter.equals("COMPLETED", ignoreCase = true)) {
            currentFilter = "COMPLETED"
            binding.chipCompleted.isChecked = true
        }

        // Setup filter chip listeners
        binding.cgBookingFilters.setOnCheckedStateChangeListener { _, checkedIds ->
            if (checkedIds.isNotEmpty()) {
                currentFilter = when (checkedIds.first()) {
                    R.id.chipPending -> "PENDING"
                    R.id.chipConfirmed -> "CONFIRMED"
                    R.id.chipInProgress -> "IN_PROGRESS"
                    R.id.chipCompleted -> "COMPLETED"
                    R.id.chipRejected -> "REJECTED"
                    else -> "ALL"
                }
                filterAndDisplayBookings()
            }
        }
    }

    private fun filterAndDisplayBookings() {
        val filtered = when (currentFilter) {
            "ALL" -> allOwnerBookings
            else -> allOwnerBookings.filter {
                it.bookingStatus.equals(currentFilter, ignoreCase = true) ||
                it.status.name.equals(currentFilter, ignoreCase = true)
            }
        }

        if (filtered.isEmpty()) {
            binding.rvOwnerBookings.visibility = View.GONE
            binding.tvEmptyOwnerBookings.visibility = View.VISIBLE
            binding.tvEmptyOwnerBookings.text = "No $currentFilter booking requests found."
        } else {
            binding.rvOwnerBookings.visibility = View.VISIBLE
            binding.tvEmptyOwnerBookings.visibility = View.GONE

            val adapter = OwnerBookingAdapter(
                bookings = filtered,
                onAcceptClick = { booking -> handleAcceptBooking(booking) },
                onRejectClick = { booking -> handleRejectBooking(booking) },
                onAssignWorkerClick = { booking -> handleAssignWorker(booking) },
                onStartWorkClick = { booking -> handleStartWork(booking) },
                onCompleteWorkClick = { booking -> handleCompleteWork(booking) },
                onConfirmCashClick = { booking -> handleConfirmCash(booking) },
                onItemClick = { booking -> showBookingDetailsDialog(booking) }
            )
            binding.rvOwnerBookings.adapter = adapter
        }
    }

    private fun showBookingDetailsDialog(booking: Booking) {
        val bStatus = booking.bookingStatus.ifBlank { booking.status.name }
        val isCompleted = bStatus.equals("COMPLETED", ignoreCase = true)
        val village = if (booking.farmVillage.isNotBlank()) booking.farmVillage else booking.location.ifBlank { "Farm Location" }
        val distStr = if (booking.distanceKm > 0) "${booking.distanceKm} km" else "Calculated distance"
        val payStr = if (booking.paymentStatus == "PAID") "PAID (CASH) ✅" else "CASH PENDING (Pay after service)"

        val dialogTitle = if (isCompleted) {
            "🌾 Completed Work & Vehicle Details (#${booking.bookingId.ifBlank { booking.id }})"
        } else {
            "📋 Booking Request Details (#${booking.bookingId.ifBlank { booking.id }})"
        }

        val detailsMessage = """
            🚜 VEHICLE / EQUIPMENT DETAILS:
            • Machine: ${booking.equipmentName}
            • Rental Rate: ₹${booking.ratePerAcre.toInt()} / acre

            👤 FARMER WHO BOOKED:
            • Name: ${booking.farmerName.ifBlank { "Farmer" }}
            • Phone: ${booking.farmerPhone.ifBlank { "+91 98480 22338" }}
            • Farm Village: $village
            • Distance: $distStr

            🌾 WORK DETAILS:
            • Activity Completed: ${booking.activity}
            • Land Area: ${booking.acres} Acres
            • Scheduled Slot: ${booking.date} (${booking.timeSlot})
            • Work Status: ${if (isCompleted) "COMPLETED & VERIFIED BY FARMER ✅" else bStatus}

            💵 PAYMENT & EARNINGS BREAKDOWN:
            • Calculation: ₹${booking.ratePerAcre.toInt()} × ${booking.acres} Acres
            • Total Amount: ₹${booking.totalAmount.toInt()}
            • Payment Mode: CASH ON DELIVERY / PAY AFTER SERVICE
            • Payment Status: $payStr
        """.trimIndent()

        val builder = AlertDialog.Builder(this)
            .setTitle(dialogTitle)
            .setMessage(detailsMessage)

        if (bStatus == "PENDING") {
            builder.setPositiveButton("ACCEPT") { _, _ -> handleAcceptBooking(booking) }
            builder.setNegativeButton("REJECT") { _, _ -> handleRejectBooking(booking) }
            builder.setNeutralButton("Close", null)
        } else if (bStatus == "CONFIRMED") {
            builder.setPositiveButton("ASSIGN WORKER") { _, _ -> handleAssignWorker(booking) }
            builder.setNegativeButton("START WORK") { _, _ -> handleStartWork(booking) }
            builder.setNeutralButton("Close", null)
        } else if (bStatus == "IN_PROGRESS") {
            builder.setPositiveButton("COMPLETE WORK") { _, _ -> handleCompleteWork(booking) }
            builder.setNeutralButton("Close", null)
        } else if (bStatus == "COMPLETED" && booking.paymentStatus != "PAID") {
            builder.setPositiveButton("CONFIRM CASH") { _, _ -> handleConfirmCash(booking) }
            builder.setNeutralButton("Close", null)
        } else {
            builder.setPositiveButton("OK", null)
        }

        builder.show()
    }

    private fun handleAcceptBooking(booking: Booking) {
        bookingViewModel.acceptBooking(booking.bookingId.ifBlank { booking.id }) { success, message ->
            if (success) {
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
            } else {
                AlertDialog.Builder(this)
                    .setTitle("Cannot Accept Booking")
                    .setMessage(message)
                    .setPositiveButton("OK", null)
                    .show()
            }
        }
    }

    private fun handleRejectBooking(booking: Booking) {
        val reasons = arrayOf(
            "Equipment unavailable",
            "Time conflict",
            "Maintenance",
            "Weather concern",
            "Other reason"
        )
        AlertDialog.Builder(this)
            .setTitle("Select Rejection Reason")
            .setItems(reasons) { dialog, which ->
                val reason = reasons[which]
                bookingViewModel.rejectBooking(booking.bookingId.ifBlank { booking.id }, reason) { success ->
                    if (success) {
                        Toast.makeText(this, "Booking rejected. Farmer notified.", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "Failed to reject booking.", Toast.LENGTH_SHORT).show()
                    }
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun handleAssignWorker(booking: Booking) {
        if (availableWorkers.isEmpty()) {
            AlertDialog.Builder(this)
                .setTitle("No Workers Available")
                .setMessage("Please add or set workers to AVAILABLE in Manage Workers section.")
                .setPositiveButton("OK", null)
                .show()
            return
        }

        val workerNames = availableWorkers.map { "${it.name} (⭐${String.format(java.util.Locale.ROOT, "%.1f", it.rating)} • ${it.skill})" }.toTypedArray()
        AlertDialog.Builder(this)
            .setTitle("Assign Worker to Job")
            .setItems(workerNames) { dialog, which ->
                val selectedWorker = availableWorkers[which]
                val wId = selectedWorker.id.ifBlank { selectedWorker.workerId }
                bookingViewModel.assignWorkerToBooking(
                    bookingId = booking.bookingId.ifBlank { booking.id },
                    workerId = wId,
                    workerName = selectedWorker.name
                ) { success ->
                    if (success) {
                        Toast.makeText(this, "Assigned ${selectedWorker.name} to booking!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this, "Failed to assign worker.", Toast.LENGTH_SHORT).show()
                    }
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun handleStartWork(booking: Booking) {
        bookingViewModel.startWork(booking.bookingId.ifBlank { booking.id }) { success ->
            if (success) {
                Toast.makeText(this, "Work started! Job status updated to IN_PROGRESS.", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Failed to start work.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun handleCompleteWork(booking: Booking) {
        bookingViewModel.completeWork(booking.bookingId.ifBlank { booking.id }) { success ->
            if (success) {
                Toast.makeText(this, "Work completed! Please collect CASH payment from farmer.", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(this, "Failed to complete work.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun handleConfirmCash(booking: Booking) {
        val bId = booking.bookingId.ifBlank { booking.id }
        val payId = "PAY_$bId"
        paymentViewModel.confirmOwnerCashPayment(
            paymentId = payId,
            bookingId = bId,
            farmerId = booking.farmerId,
            amount = booking.totalAmount
        ) { success ->
            if (success) {
                Toast.makeText(this, "Cash payment of ₹${booking.totalAmount.toInt()} confirmed! Status set to PAID.", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(this, "Failed to confirm cash payment.", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
