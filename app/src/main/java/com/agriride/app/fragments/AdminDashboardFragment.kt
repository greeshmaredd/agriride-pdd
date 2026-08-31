package com.agriride.app.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.agriride.app.activities.LoginActivity
import com.agriride.app.databinding.FragmentAdminDashboardBinding
import com.agriride.app.viewmodels.AdminViewModel

class AdminDashboardFragment : Fragment() {

    private var _binding: FragmentAdminDashboardBinding? = null
    private val binding get() = _binding!!
    private val adminViewModel: AdminViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAdminDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adminViewModel.documents.observe(viewLifecycleOwner) { docs ->
            val pending = docs.count { it.status == "PENDING" || it.verificationStatus == "PENDING" }
            if (pending > 0) {
                Toast.makeText(requireContext(), "$pending RC Document(s) Pending Admin Verification", Toast.LENGTH_SHORT).show()
            }
        }

        binding.cardAdminRevenue.setOnClickListener {
            val docs = adminViewModel.documents.value ?: emptyList()
            val pendingDoc = docs.firstOrNull { it.status == "PENDING" }
            if (pendingDoc != null) {
                adminViewModel.updateDocumentStatus(pendingDoc.docId, "VERIFIED")
                Toast.makeText(requireContext(), "Document ${pendingDoc.docId} marked as VERIFIED! ✓", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(requireContext(), "All vehicle documents verified!", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnLogoutAdmin.setOnClickListener {
            Toast.makeText(requireContext(), "Admin Logged out.", Toast.LENGTH_SHORT).show()
            val intent = Intent(requireContext(), LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            requireActivity().finish()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
