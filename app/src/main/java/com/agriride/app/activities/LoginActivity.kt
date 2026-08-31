package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.databinding.ActivityLoginBinding
import com.agriride.app.models.Resource
import com.agriride.app.models.User
import com.agriride.app.utils.AccountHistoryHelper
import com.agriride.app.viewmodels.AuthViewModel

class LoginActivity : BaseActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val authViewModel: AuthViewModel by viewModels()
    private var selectedLoginRole: String = "FARMER"

    private fun selectLoginRole(role: String) {
        selectedLoginRole = role
        val green = ContextCompat.getColor(this, R.color.primary_green)
        val white = ContextCompat.getColor(this, R.color.surface_white)
        val textPrimary = ContextCompat.getColor(this, R.color.text_primary)
        val borderLight = ContextCompat.getColor(this, R.color.border_light)

        binding.cardRoleFarmerLogin.setCardBackgroundColor(white)
        binding.cardRoleFarmerLogin.strokeColor = borderLight
        binding.cardRoleFarmerLogin.strokeWidth = 2
        binding.tvRoleFarmerLoginText.setTextColor(textPrimary)

        binding.cardRoleOwnerLogin.setCardBackgroundColor(white)
        binding.cardRoleOwnerLogin.strokeColor = borderLight
        binding.cardRoleOwnerLogin.strokeWidth = 2
        binding.tvRoleOwnerLoginText.setTextColor(textPrimary)

        binding.cardRoleWorkerLogin.setCardBackgroundColor(white)
        binding.cardRoleWorkerLogin.strokeColor = borderLight
        binding.cardRoleWorkerLogin.strokeWidth = 2
        binding.tvRoleWorkerLoginText.setTextColor(textPrimary)

        when (role) {
            "FARMER" -> {
                binding.cardRoleFarmerLogin.setCardBackgroundColor(green)
                binding.cardRoleFarmerLogin.strokeWidth = 0
                binding.tvRoleFarmerLoginText.setTextColor(white)
            }
            "OWNER" -> {
                binding.cardRoleOwnerLogin.setCardBackgroundColor(green)
                binding.cardRoleOwnerLogin.strokeWidth = 0
                binding.tvRoleOwnerLoginText.setTextColor(white)
            }
            "Worker" -> {
                binding.cardRoleWorkerLogin.setCardBackgroundColor(green)
                binding.cardRoleWorkerLogin.strokeWidth = 0
                binding.tvRoleWorkerLoginText.setTextColor(white)
            }
        }
    }

    private fun navigateToSelectedRole(user: User) {
        val targetIntent = when (selectedLoginRole) {
            "OWNER" -> Intent(this, OwnerMainActivity::class.java)
            "Worker" -> Intent(this, WorkerMainActivity::class.java)
            else -> Intent(this, FarmerMainActivity::class.java)
        }
        val roleName = when (selectedLoginRole) {
            "OWNER" -> "Equipment Owner"
            "Worker" -> "Worker / Operator"
            else -> "Farmer"
        }
        Toast.makeText(this, "Welcome! Logged in as $roleName.", Toast.LENGTH_SHORT).show()
        targetIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(targetIntent)
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        selectLoginRole("FARMER")

        binding.cardRoleFarmerLogin.setOnClickListener { selectLoginRole("FARMER") }
        binding.cardRoleOwnerLogin.setOnClickListener { selectLoginRole("OWNER") }
        binding.cardRoleWorkerLogin.setOnClickListener { selectLoginRole("Worker") }

        setupSavedAccountsDropdown()

        binding.btnLoginSubmit.setOnClickListener {
            val input = binding.etMobile.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (input.isEmpty()) {
                binding.etMobile.error = "Enter mobile number or email"
                return@setOnClickListener
            }
            if (password.isEmpty()) {
                binding.etPassword.error = "Enter password"
                return@setOnClickListener
            }

            val email = if (input.contains("@")) input else "$input@agriride.in"
            binding.btnLoginSubmit.isEnabled = false

            var hasNavigated = false
            authViewModel.login(email, password).observe(this) { resource ->
                binding.btnLoginSubmit.isEnabled = true
                when (resource) {
                    is Resource.Loading -> {
                        Toast.makeText(this, "Logging in...", Toast.LENGTH_SHORT).show()
                    }
                    is Resource.Success -> {
                        if (!hasNavigated) {
                            val userRoleLower = resource.data.role.lowercase(java.util.Locale.ROOT)
                            val selectedRoleLower = selectedLoginRole.lowercase(java.util.Locale.ROOT)

                            val isFarmerMatch = selectedRoleLower == "farmer" && (userRoleLower.contains("farmer") || userRoleLower.contains("farm"))
                            val isOwnerMatch = selectedRoleLower == "owner" && (userRoleLower.contains("owner") || userRoleLower.contains("equipment"))
                            val isWorkerMatch = selectedRoleLower == "worker" && (userRoleLower.contains("worker") || userRoleLower.contains("driver") || userRoleLower.contains("operator"))

                            if (!isFarmerMatch && !isOwnerMatch && !isWorkerMatch) {
                                val registeredDisplay = when {
                                    userRoleLower.contains("farmer") -> "Farmer"
                                    userRoleLower.contains("owner") || userRoleLower.contains("equipment") -> "Equipment Owner"
                                    userRoleLower.contains("worker") || userRoleLower.contains("driver") || userRoleLower.contains("operator") -> "Worker"
                                    else -> resource.data.role
                                }
                                Toast.makeText(this@LoginActivity, "This account is registered as a $registeredDisplay. Please select the correct role above to login.", Toast.LENGTH_LONG).show()
                                authViewModel.logout()
                            } else {
                                hasNavigated = true
                                AccountHistoryHelper.saveAccount(
                                    this@LoginActivity,
                                    email,
                                    selectedLoginRole,
                                    resource.data.name
                                )
                                navigateToSelectedRole(resource.data)
                            }
                        }
                    }
                    is Resource.Error -> {
                        Toast.makeText(this, resource.message, Toast.LENGTH_LONG).show()
                    }
                    else -> {}
                }
            }
        }

        binding.tvForgotPassword.setOnClickListener {
            val input = binding.etMobile.text.toString().trim()
            if (input.isEmpty()) {
                binding.etMobile.error = "Enter mobile number or email to reset password"
                return@setOnClickListener
            }
            val email = if (input.contains("@")) input else "$input@agriride.in"
            authViewModel.sendPasswordReset(email).observe(this) { res ->
                when (res) {
                    is Resource.Loading -> Toast.makeText(this, "Sending password reset link...", Toast.LENGTH_SHORT).show()
                    is Resource.Success -> Toast.makeText(this, "Password reset link sent to $email", Toast.LENGTH_LONG).show()
                    is Resource.Error -> Toast.makeText(this, res.message, Toast.LENGTH_LONG).show()
                    else -> {}
                }
            }
        }

        binding.tvRegisterLink.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun setupSavedAccountsDropdown() {
        val savedAccounts = AccountHistoryHelper.getSavedAccounts(this)
        val emails = savedAccounts.map { it.email }.distinct()

        if (emails.isNotEmpty()) {
            val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, emails)
            binding.etMobile.setAdapter(adapter)

            binding.etMobile.setOnClickListener {
                if (binding.etMobile.text.isNullOrBlank()) {
                    binding.etMobile.showDropDown()
                }
            }

            binding.etMobile.setOnFocusChangeListener { _, hasFocus ->
                if (hasFocus && binding.etMobile.text.isNullOrBlank()) {
                    binding.etMobile.showDropDown()
                }
            }

            binding.etMobile.setOnItemClickListener { _, _, position, _ ->
                val selectedEmail = adapter.getItem(position) ?: return@setOnItemClickListener
                val matchingAccount = savedAccounts.firstOrNull { it.email.equals(selectedEmail, ignoreCase = true) }
                if (matchingAccount != null) {
                    val roleCode = when {
                        matchingAccount.role.contains("owner", ignoreCase = true) -> "OWNER"
                        matchingAccount.role.contains("worker", ignoreCase = true) -> "Worker"
                        else -> "FARMER"
                    }
                    selectLoginRole(roleCode)
                }
            }

            val latest = savedAccounts.first()
            binding.etMobile.setText(latest.email)
            val latestRole = when {
                latest.role.contains("owner", ignoreCase = true) -> "OWNER"
                latest.role.contains("worker", ignoreCase = true) -> "Worker"
                else -> "FARMER"
            }
            selectLoginRole(latestRole)
        }
    }
}
