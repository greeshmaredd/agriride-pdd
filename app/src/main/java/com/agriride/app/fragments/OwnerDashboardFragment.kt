package com.agriride.app.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.agriride.app.activities.AddEquipmentActivity
import com.agriride.app.activities.OwnerBookingRequestsActivity
import com.agriride.app.activities.OwnerEquipmentActivity
import com.agriride.app.databinding.FragmentOwnerDashboardBinding
import com.agriride.app.viewmodels.AuthViewModel
import com.agriride.app.viewmodels.BookingViewModel
import com.agriride.app.viewmodels.EquipmentViewModel

class OwnerDashboardFragment : Fragment() {

    private var _binding: FragmentOwnerDashboardBinding? = null
    private val binding get() = _binding!!

    private val authViewModel: AuthViewModel by viewModels()
    private val equipmentViewModel: EquipmentViewModel by viewModels()
    private val bookingViewModel: BookingViewModel by viewModels()
    private val notificationViewModel: com.agriride.app.viewmodels.NotificationViewModel by viewModels()
    private val workerViewModel: com.agriride.app.viewmodels.WorkerViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOwnerDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Load profile info
        authViewModel.fetchCurrentUserProfile { user ->
            if (_binding != null && user != null && user.name.isNotBlank()) {
                binding.tvOwnerNameHeader.text = user.name
            }
        }

        binding.cardOwnerHeaderBanner.setOnClickListener {
            startActivity(Intent(requireContext(), com.agriride.app.activities.ProfileActivity::class.java))
        }

        binding.btnOwnerNotifications.setOnClickListener {
            startActivity(Intent(requireContext(), com.agriride.app.activities.OwnerNotificationsActivity::class.java))
        }

        // Observe notifications for red dot alert
        notificationViewModel.getUserNotifications().observe(viewLifecycleOwner) { notifs ->
            val hasUnread = notifs.any { !it.isRead }
            binding.dotOwnerNotif.visibility = if (hasUnread) View.VISIBLE else View.GONE
        }

        // Observe real Firebase Equipment
        equipmentViewModel.getOwnerEquipmentList().observe(viewLifecycleOwner) { equipList ->
            binding.tvMetricTotalVehicles.text = "${equipList.size} Machines"
        }

        // Observe workers count
        workerViewModel.getOwnerWorkers().observe(viewLifecycleOwner) { workers ->
            val activeCount = workers.count { it.availability.equals("AVAILABLE", ignoreCase = true) }
            binding.tvWorkersCountBadge.text = "$activeCount Active"
        }

        // Observe real Firebase Bookings
        bookingViewModel.getOwnerBookings().observe(viewLifecycleOwner) { bookings ->
            val pendingCount = bookings.count { it.bookingStatus.equals("PENDING", ignoreCase = true) || it.status.name.equals("PENDING", ignoreCase = true) }
            val activeCount = bookings.count { it.bookingStatus.equals("IN_PROGRESS", ignoreCase = true) || it.status.name == "IN_PROGRESS" || it.status.name == "CONFIRMED" || it.status.name == "ON_THE_WAY" }
            val completedCount = bookings.count { it.bookingStatus.equals("COMPLETED", ignoreCase = true) || it.status.name.equals("COMPLETED", ignoreCase = true) }
            val totalEarnings = bookings.filter { it.paymentStatus == "PAID" || it.status.name == "COMPLETED" }.sumOf { if (it.totalAmount > 0) it.totalAmount else (it.ratePerAcre * it.acres) }

            binding.tvMetricTodayActive.text = "$activeCount Active"
            binding.tvMetricPendingNew.text = "$pendingCount New"
            binding.tvMetricCompletedWorks.text = "$completedCount Completed"
            binding.tvMetricMonthlyRev.text = "₹${totalEarnings.toInt()}"
        }

        // Quick Action Navigations
        binding.btnRegisterNewEquipment.setOnClickListener {
            startActivity(Intent(requireContext(), AddEquipmentActivity::class.java))
        }

        binding.btnManageVehicles.setOnClickListener {
            startActivity(Intent(requireContext(), OwnerEquipmentActivity::class.java))
        }

        binding.btnIncomingRequests.setOnClickListener {
            startActivity(Intent(requireContext(), OwnerBookingRequestsActivity::class.java))
        }

        binding.btnManageWorkers.setOnClickListener {
            startActivity(Intent(requireContext(), com.agriride.app.activities.OwnerEarningsWorkersActivity::class.java))
        }

        binding.cardMetricToday.setOnClickListener {
            startActivity(Intent(requireContext(), OwnerBookingRequestsActivity::class.java))
        }

        binding.cardMetricPending.setOnClickListener {
            startActivity(Intent(requireContext(), OwnerBookingRequestsActivity::class.java))
        }

        binding.cardMetricCompletedWorks.setOnClickListener {
            val intent = Intent(requireContext(), OwnerBookingRequestsActivity::class.java)
            intent.putExtra("INITIAL_FILTER", "COMPLETED")
            startActivity(intent)
        }

        binding.cardMetricVehicles.setOnClickListener {
            startActivity(Intent(requireContext(), OwnerEquipmentActivity::class.java))
        }

        binding.cardMetricRevenue.setOnClickListener {
            startActivity(Intent(requireContext(), com.agriride.app.activities.OwnerWeeklyTrendsActivity::class.java))
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
