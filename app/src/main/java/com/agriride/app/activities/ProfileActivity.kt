package com.agriride.app.activities

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityProfileBinding
import com.agriride.app.models.Resource
import com.agriride.app.models.User
import com.agriride.app.viewmodels.AuthViewModel
import com.bumptech.glide.Glide

class ProfileActivity : BaseActivity() {

    private lateinit var binding: ActivityProfileBinding
    private val authViewModel: AuthViewModel by viewModels()
    private var currentUser: User? = null

    private val selectProfileImageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) {
            val userId = authViewModel.getCurrentUserId() ?: return@registerForActivityResult
            Toast.makeText(this, "Uploading profile image to Firebase Storage...", Toast.LENGTH_SHORT).show()
            authViewModel.uploadProfileImage(userId, uri, onProgress = { p ->
                Toast.makeText(this, "Uploading: $p%", Toast.LENGTH_SHORT).show()
            }) { res ->
                when (res) {
                    is Resource.Success -> {
                        Toast.makeText(this, "Profile image updated successfully!", Toast.LENGTH_SHORT).show()
                    }
                    is Resource.Error -> {
                        Toast.makeText(this, "Upload error: ${res.message}", Toast.LENGTH_SHORT).show()
                    }
                    else -> {}
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)

        loadProfile()

        binding.cardProfileUser.setOnClickListener {
            selectProfileImageLauncher.launch("image/*")
        }

        binding.btnEditProfileDetails.setOnClickListener {
            showEditProfileDialog()
        }

        binding.btnSwitchRoleProf.setOnClickListener {
            showRoleSwitcherDialog()
        }

        binding.btnSetFarmLocationProf.setOnClickListener {
            startActivity(Intent(this, CropDamMapActivity::class.java))
        }

        binding.btnChangeLangProf.setOnClickListener {
            startActivity(Intent(this, LanguageSelectionActivity::class.java))
        }

        binding.btnHelpSupport.setOnClickListener {
            val role = currentUser?.role ?: "Farmer"
            val supportMsg = when {
                role.contains("OWNER", ignoreCase = true) || role.contains("Owner", ignoreCase = true) ->
                    "AgriRide Owner Partner Support: 1800-425-2475 (Toll Free)"
                role.contains("Worker", ignoreCase = true) ->
                    "AgriRide Operator Worker Helpline: 1800-425-2476 (Toll Free)"
                else ->
                    "AgriRide Farmer Support: 1800-425-2474 (Toll Free)"
            }
            Toast.makeText(this, supportMsg, Toast.LENGTH_LONG).show()
        }

        binding.btnNotificationsProf.setOnClickListener {
            startActivity(Intent(this, OwnerNotificationsActivity::class.java))
        }

        binding.btnLogoutProfile.setOnClickListener {
            AlertDialog.Builder(this)
                .setTitle("Logout Confirmation")
                .setMessage("Are you sure you want to log out of AgriRide?")
                .setPositiveButton("Yes, Logout") { _, _ ->
                    authViewModel.logout()
                    Toast.makeText(this, "Logged out successfully.", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this, LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
    }

    private fun loadProfile() {
        authViewModel.fetchCurrentUserProfile { user ->
            if (user != null) {
                currentUser = user
                binding.tvProfileName.text = "${user.name} 👋"
                val locDisplay = if (user.location.isNotBlank() && !user.location.contains("Vijayawada", ignoreCase = true) && !user.location.contains("Select", ignoreCase = true)) user.location else "Location not set (Tap to set)"
                binding.tvProfileDetails.text = "${user.phone.ifEmpty { user.email }} • $locDisplay"
                val role = user.role.ifBlank { "Farmer" }
                binding.tvProfileRole.text = "Role: $role"

                if (user.profileImage.isNotBlank()) {
                    Glide.with(this)
                        .load(user.profileImage)
                        .placeholder(com.agriride.app.R.drawable.ic_tractor)
                        .error(com.agriride.app.R.drawable.ic_tractor)
                        .into(binding.ivProfilePic)
                } else {
                    binding.ivProfilePic.setImageResource(com.agriride.app.R.drawable.ic_tractor)
                }

                val supportBtnText = when {
                    role.contains("OWNER", ignoreCase = true) || role.contains("Owner", ignoreCase = true) -> "❓ Help & Owner Partner Support"
                    role.contains("Worker", ignoreCase = true) -> "❓ Help & Worker Operator Support"
                    else -> "❓ Help & Farmer Support"
                }
                binding.btnHelpSupport.text = supportBtnText
            }
        }
    }

    private fun showEditProfileDialog() {
        val context = this
        val userId = authViewModel.getCurrentUserId() ?: return

        val container = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 30, 50, 10)
        }

        val etName = EditText(context).apply {
            hint = "Full Name"
            setText(currentUser?.name ?: "")
        }

        val etPhone = EditText(context).apply {
            hint = "Phone Number"
            inputType = android.text.InputType.TYPE_CLASS_PHONE
            setText(currentUser?.phone ?: "")
        }

        val etLocation = EditText(context).apply {
            hint = "Farm / District Location"
            val loc = currentUser?.location ?: ""
            setText(if (!loc.contains("Vijayawada", ignoreCase = true) && !loc.contains("Select", ignoreCase = true)) loc else "")
        }

        container.addView(etName)
        container.addView(etPhone)
        container.addView(etLocation)

        val roleStr = currentUser?.role ?: "Farmer"
        val dialogTitle = when {
            roleStr.contains("OWNER", ignoreCase = true) || roleStr.contains("Owner", ignoreCase = true) -> "✏️ Edit Owner Profile"
            roleStr.contains("Worker", ignoreCase = true) -> "✏️ Edit Worker Profile"
            else -> "✏️ Edit Farmer Profile"
        }

        AlertDialog.Builder(context)
            .setTitle(dialogTitle)
            .setMessage("Update your profile details below:")
            .setView(container)
            .setPositiveButton("Save Changes") { _, _ ->
                val newName = etName.text.toString().trim()
                val newPhone = etPhone.text.toString().trim()
                val newLoc = etLocation.text.toString().trim()

                if (newName.isBlank()) {
                    Toast.makeText(context, "Name cannot be empty", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }

                authViewModel.updateUserProfile(userId, newName, newPhone, newLoc) { success ->
                    if (success) {
                        Toast.makeText(context, "Profile updated successfully!", Toast.LENGTH_SHORT).show()
                        loadProfile()
                    } else {
                        Toast.makeText(context, "Failed to update profile.", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showRoleSwitcherDialog() {
        val user = currentUser ?: User(
            name = "User",
            email = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser?.email ?: "",
            role = "Farmer"
        )

        val items = arrayOf(
            "👨‍🌾 Farmer Portal (రైతు విభాగం)",
            "🚜 Equipment Owner Portal (యంత్ర యజమాని విభాగం)",
            "👷 Worker / Driver Console (కూలీ / ఆపరేటర్ విభాగం)"
        )

        AlertDialog.Builder(this)
            .setTitle("🌐 Select AgriRide Role Mode / రోల్ ఎంచుకోండి")
            .setMessage("Select which role dashboard to open or register for:")
            .setItems(items) { _, which: Int ->
                when (which) {
                    0 -> handleRoleAction("Farmer (రైతు)", "FARMER", FarmerMainActivity::class.java, user)
                    1 -> handleRoleAction("Equipment Owner (యంత్ర యజమాని)", "OWNER", OwnerMainActivity::class.java, user)
                    2 -> handleRoleAction("Worker / Operator (కూలీ / డ్రైవర్)", "Worker", WorkerMainActivity::class.java, user)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun handleRoleAction(roleTitle: String, roleCode: String, targetClass: Class<*>, user: User) {
        val userRoleLower = user.role.lowercase(java.util.Locale.ROOT)
        val targetRoleLower = roleCode.lowercase(java.util.Locale.ROOT)

        val isFarmerMatch = targetRoleLower == "farmer" && (userRoleLower.contains("farmer") || userRoleLower.contains("farm"))
        val isOwnerMatch = targetRoleLower == "owner" && (userRoleLower.contains("owner") || userRoleLower.contains("equipment"))
        val isWorkerMatch = targetRoleLower == "worker" && (userRoleLower.contains("worker") || userRoleLower.contains("driver") || userRoleLower.contains("operator"))

        val hasAccess = isFarmerMatch || isOwnerMatch || isWorkerMatch

        val options = if (hasAccess) {
            arrayOf("🚀 Open $roleTitle Dashboard (లాగిన్ / తెరవండి)")
        } else {
            arrayOf(
                "📝 Register / Setup New $roleTitle Account (కొత్తగా నమోదు చేసుకోండి)",
                "🚪 Log Out & Login with another account"
            )
        }

        AlertDialog.Builder(this)
            .setTitle(roleTitle)
            .setItems(options) { _, choice ->
                if (hasAccess) {
                    Toast.makeText(this, "Opening $roleTitle...", Toast.LENGTH_SHORT).show()
                    val intent = Intent(this, targetClass).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    }
                    startActivity(intent)
                    finish()
                } else {
                    if (choice == 0) {
                        val intent = Intent(this, RegisterActivity::class.java).apply {
                            putExtra("PREFILL_EMAIL", user.email)
                            putExtra("PREFILL_NAME", user.name)
                            putExtra("PREFILL_ROLE", roleCode)
                        }
                        startActivity(intent)
                    } else {
                        authViewModel.logout()
                        val intent = Intent(this, LoginActivity::class.java).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        }
                        startActivity(intent)
                        finish()
                    }
                }
            }
            .setNegativeButton("Back", null)
            .show()
    }
}
