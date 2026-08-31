package com.agriride.app.fragments

import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.agriride.app.R
import com.agriride.app.activities.FarmerMainActivity
import com.agriride.app.activities.OwnerMainActivity
import com.agriride.app.activities.TaskDetailsActivity
import com.agriride.app.activities.WorkerTasksAttendanceActivity
import com.agriride.app.databinding.FragmentWorkerDashboardBinding
import com.agriride.app.viewmodels.WorkerViewModel

import com.agriride.app.models.Booking
import com.agriride.app.activities.LoginActivity
import com.agriride.app.activities.RegisterActivity
import java.util.Locale

class WorkerDashboardFragment : Fragment() {

    private var _binding: FragmentWorkerDashboardBinding? = null
    private val binding get() = _binding!!
    private val workerViewModel: WorkerViewModel by viewModels()
    private var activeBooking: Booking? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentWorkerDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupHeaderAndNavigation()
        setupWorkerStatus()
        setupActiveTaskActions()
    }

    private fun setupHeaderAndNavigation() {
        binding.btnWorkerBack.setOnClickListener {
            val intent = Intent(requireContext(), FarmerMainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(intent)
            requireActivity().finish()
        }

        binding.btnWorkerSwitchRole.setOnClickListener {
            showRoleSwitcher()
        }
    }

    private fun setupWorkerStatus() {
        workerViewModel.workerDetails.observe(viewLifecycleOwner) { worker ->
            binding.tvWorkDashTitle.text = worker.name.ifBlank { "Suresh Kumar" }
            val isOnDuty = worker.status.contains("On Duty", ignoreCase = true)
            binding.tvShiftStatusTag.text = if (isOnDuty) "🟢 On Duty" else "🔴 Off Duty"
            binding.tvShiftStatus.text = "Checked in today at ${worker.checkInTime.ifBlank { "06:45 AM" }} • Tap to toggle"
        }

        binding.cardWorkerStatus.setOnClickListener {
            val updated = workerViewModel.toggleCheckInStatus()
            val isOnDuty = updated.status.contains("On Duty", ignoreCase = true)
            binding.tvShiftStatusTag.text = if (isOnDuty) "🟢 On Duty" else "🔴 Off Duty"
            Toast.makeText(requireContext(), "Driver Shift Status: ${updated.status}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupActiveTaskActions() {
        workerViewModel.getActiveWorkerBooking("WRK_SURESH_1").observe(viewLifecycleOwner) { booking ->
            activeBooking = booking
            if (booking == null) {
                binding.tvTaskVehicleBadge.text = "🚜 No Assigned Work"
                binding.tvTaskVehicleBadge.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.text_muted)
                binding.tvTaskVehicleBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_primary))
                binding.tvTaskStatusBadge.text = "💤 Idle"
                binding.tvTaskStatusBadge.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.border_light)
                binding.tvTaskStatusBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.text_muted))
                
                binding.tvTaskTitle.text = "No Active Machinery Job"
                binding.tvTaskSub.text = "You will see job details here once the fleet owner confirms a booking and assigns it to you."
                
                binding.btnCallFarmer.visibility = View.GONE
                binding.btnViewRouteMap.visibility = View.GONE
                binding.btnDepartWithVehicle.visibility = View.GONE
                binding.btnCompleteOperation.visibility = View.GONE
            } else {
                binding.tvTaskVehicleBadge.text = "🚜 ${booking.equipmentName}"
                binding.tvTaskVehicleBadge.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.secondary_green_soft)
                binding.tvTaskVehicleBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.primary_green))
                
                val isWorking = booking.bookingStatus.equals("IN_PROGRESS", ignoreCase = true)
                binding.tvTaskStatusBadge.text = if (isWorking) "⚙️ Working" else "⏳ Assigned"
                binding.tvTaskStatusBadge.backgroundTintList = ContextCompat.getColorStateList(
                    requireContext(),
                    if (isWorking) R.color.accent_yellow else R.color.secondary_green_soft
                )
                binding.tvTaskStatusBadge.setTextColor(
                    ContextCompat.getColor(
                        requireContext(),
                        if (isWorking) R.color.text_primary else R.color.primary_green
                    )
                )
                
                binding.tvTaskTitle.text = "${booking.activity} Operation"
                binding.tvTaskSub.text = "Farmer: ${booking.farmerName} (${booking.farmerPhone})\nLocation: ${booking.farmVillage.ifBlank { booking.location }} • ${booking.acres} Acres\nTime Slot: ${booking.date} • ${booking.timeSlot}\nBooking Total: ₹${booking.totalAmount.toInt()} (Cash on Delivery)"
                
                binding.btnCallFarmer.visibility = View.VISIBLE
                binding.btnViewRouteMap.visibility = View.VISIBLE
                
                if (isWorking) {
                    binding.btnDepartWithVehicle.visibility = View.GONE
                    binding.btnCompleteOperation.visibility = View.VISIBLE
                    binding.btnCompleteOperation.isEnabled = true
                    binding.btnCompleteOperation.text = "Mark Operation Completed ✅"
                    binding.btnCompleteOperation.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.primary_green)
                } else {
                    binding.btnDepartWithVehicle.visibility = View.VISIBLE
                    binding.btnCompleteOperation.visibility = View.GONE
                    binding.btnDepartWithVehicle.isEnabled = true
                    binding.btnDepartWithVehicle.text = "🚀 Take Vehicle & Depart for Field"
                    binding.btnDepartWithVehicle.backgroundTintList = ContextCompat.getColorStateList(requireContext(), R.color.primary_green)
                }
            }
        }

        binding.cardTodayTask.setOnClickListener {
            if (activeBooking != null) {
                val intent = Intent(requireContext(), TaskDetailsActivity::class.java).apply {
                    putExtra("BOOKING_ID", activeBooking?.bookingId)
                }
                startActivity(intent)
            } else {
                Toast.makeText(requireContext(), "No active operation details.", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnCallFarmer.setOnClickListener {
            val phone = activeBooking?.farmerPhone ?: "+919848022338"
            val callIntent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:$phone")
            }
            startActivity(callIntent)
        }

        binding.btnViewRouteMap.setOnClickListener {
            val loc = activeBooking?.location ?: "Mevalurkuppam"
            val mapUri = Uri.parse("geo:13.0418,80.0245?q=${Uri.encode(loc)}")
            val mapIntent = Intent(Intent.ACTION_VIEW, mapUri)
            try {
                startActivity(mapIntent)
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Field Coordinates: Mevalurkuppam (13.0418 N, 80.0245 E)", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnDepartWithVehicle.setOnClickListener {
            val booking = activeBooking ?: return@setOnClickListener
            AlertDialog.Builder(requireContext())
                .setTitle("Take Vehicle & Depart / యంత్రంతో బయలుదేరండి")
                .setMessage("Confirm departure with ${booking.equipmentName} to ${booking.location} for Farmer ${booking.farmerName} (${booking.farmerPhone})?")
                .setPositiveButton("Yes, Depart for Work 🚀") { dialog, _ ->
                    com.agriride.app.repositories.WorkerRepository.workerDepartWithVehicle(
                        bookingId = booking.bookingId,
                        workerName = binding.tvWorkDashTitle.text.toString(),
                        vehicleName = booking.equipmentName,
                        location = booking.location,
                        farmerName = booking.farmerName,
                        farmerPhone = booking.farmerPhone,
                        ownerUid = booking.ownerId
                    )
                    Toast.makeText(requireContext(), "Departed for work! Notification sent to Owner.", Toast.LENGTH_LONG).show()
                    dialog.dismiss()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }

        binding.btnCompleteOperation.setOnClickListener {
            val booking = activeBooking ?: return@setOnClickListener
            AlertDialog.Builder(requireContext())
                .setTitle("Complete ${booking.activity} Operation / పని పూర్తయినట్లు నమోదు చేయండి")
                .setMessage("Are you sure the ${booking.acres} acres ${booking.activity} operation for Farmer ${booking.farmerName} is completed?")
                .setPositiveButton("Yes, Mark Completed ✅") { dialog, _ ->
                    com.agriride.app.repositories.WorkerRepository.completeWorkerOperation(
                        bookingId = booking.bookingId,
                        workerName = binding.tvWorkDashTitle.text.toString(),
                        vehicleName = booking.equipmentName,
                        location = booking.location,
                        farmerName = booking.farmerName
                    )
                    Toast.makeText(requireContext(), "Operation marked Completed! Notification sent to Owner & Farmer.", Toast.LENGTH_LONG).show()
                    dialog.dismiss()
                }
                .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
                .show()
        }

        binding.btnWorkerAttendanceHistory.setOnClickListener {
            startActivity(Intent(requireContext(), WorkerTasksAttendanceActivity::class.java))
        }

        binding.cardWorkerMetrics.setOnClickListener {
            startActivity(Intent(requireContext(), WorkerTasksAttendanceActivity::class.java))
        }

        binding.btnCallOwner.setOnClickListener {
            val phone = activeBooking?.ownerPhone ?: "+919848022338"
            val callIntent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:$phone")
            }
            startActivity(callIntent)
        }
    }

    private fun showRoleSwitcher() {
        val authRepo = com.agriride.app.repositories.AuthRepository()
        authRepo.fetchCurrentUserProfile { user ->
            if (user == null) {
                Toast.makeText(requireContext(), "Please log in first.", Toast.LENGTH_SHORT).show()
                return@fetchCurrentUserProfile
            }
            val userRoleLower = user.role.lowercase(Locale.ROOT)
            val items = arrayOf(
                "👨‍🌾 Farmer Portal (రైతు విభాగం)",
                "🚜 Equipment Owner Portal (యంత్ర యజమాని విభాగం)"
            )
            AlertDialog.Builder(requireContext())
                .setTitle("🌐 Switch Role / రోల్ మార్చండి")
                .setItems(items) { _, which ->
                    val targetRole = if (which == 0) "farmer" else "owner"
                    val hasAccess = when (targetRole) {
                        "farmer" -> userRoleLower.contains("farmer") || userRoleLower.contains("farm")
                        "owner" -> userRoleLower.contains("owner") || userRoleLower.contains("equipment")
                        else -> false
                    }
                    if (hasAccess) {
                        val intent = if (which == 0) {
                            Intent(requireContext(), FarmerMainActivity::class.java)
                        } else {
                            Intent(requireContext(), OwnerMainActivity::class.java)
                        }
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        requireActivity().finish()
                    } else {
                        val roleTitle = if (which == 0) "Farmer" else "Equipment Owner"
                        val options = arrayOf(
                            "📝 Register New $roleTitle Account",
                            "🚪 Log Out & Login with another account"
                        )
                        AlertDialog.Builder(requireContext())
                            .setTitle("$roleTitle Portal Access Required")
                            .setMessage("Your account is registered as ${user.role}. You cannot access the $roleTitle portal directly.")
                            .setItems(options) { _, choice ->
                                if (choice == 0) {
                                    val intent = Intent(requireContext(), RegisterActivity::class.java).apply {
                                        putExtra("PREFILL_EMAIL", user.email)
                                        putExtra("PREFILL_NAME", user.name)
                                        putExtra("PREFILL_ROLE", if (which == 0) "FARMER" else "OWNER")
                                    }
                                    startActivity(intent)
                                } else {
                                    authRepo.logout()
                                    val intent = Intent(requireContext(), LoginActivity::class.java).apply {
                                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                                    }
                                    startActivity(intent)
                                    requireActivity().finish()
                                }
                            }
                            .setNegativeButton("Back", null)
                            .show()
                    }
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
