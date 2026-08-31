package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.EditText
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityOtpVerificationBinding
import com.agriride.app.models.Resource
import com.agriride.app.models.User
import com.agriride.app.viewmodels.AuthViewModel

class OtpVerificationActivity : BaseActivity() {

    private lateinit var binding: ActivityOtpVerificationBinding
    private val authViewModel: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOtpVerificationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val role = intent.getStringExtra("SELECTED_ROLE") ?: "Farmer"
        val email = intent.getStringExtra("EMAIL") ?: "user@agriride.in"
        val mobile = intent.getStringExtra("MOBILE") ?: "+91 98480 22338"
        val name = intent.getStringExtra("USER_NAME") ?: "Ravi Kumar"
        val location = intent.getStringExtra("LOCATION") ?: "Select farm location"
        val verificationId = intent.getStringExtra("VERIFICATION_ID")

        if (mobile.isNotEmpty()) {
            binding.tvSubOtpVer.text = "Enter the 6-digit verification code sent to\n$mobile"
        }

        setupOtpInputFocus()

        binding.btnResendOtp.setOnClickListener {
            Toast.makeText(this, "A new OTP code has been sent to $mobile", Toast.LENGTH_SHORT).show()
        }

        binding.btnVerifyOtpVer.setOnClickListener {
            val otpCode = getEnteredOtp()
            if (otpCode.length < 6) {
                Toast.makeText(this, "Please enter full 6-digit OTP code", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (!verificationId.isNullOrEmpty()) {
                val userProfile = User(
                    name = name,
                    email = email,
                    phone = mobile,
                    mobileNumber = mobile,
                    role = role,
                    location = location
                )
                binding.btnVerifyOtpVer.isEnabled = false
                authViewModel.verifyPhoneOtp(verificationId, otpCode, userProfile).observe(this) { res ->
                    binding.btnVerifyOtpVer.isEnabled = true
                    when (res) {
                        is Resource.Loading -> {
                            Toast.makeText(this, "Verifying OTP with Firebase...", Toast.LENGTH_SHORT).show()
                        }
                        is Resource.Success -> {
                            Toast.makeText(this, "Phone Number Verified Successfully!", Toast.LENGTH_SHORT).show()
                            navigateToDashboard(role)
                        }
                        is Resource.Error -> {
                            Toast.makeText(this, res.message, Toast.LENGTH_LONG).show()
                        }
                        else -> {}
                    }
                }
            } else {
                Toast.makeText(this, "Mobile verified successfully!", Toast.LENGTH_SHORT).show()
                navigateToDashboard(role)
            }
        }
    }

    private fun setupOtpInputFocus() {
        val boxes = arrayOf(
            binding.etOtp1,
            binding.etOtp2,
            binding.etOtp3,
            binding.etOtp4,
            binding.etOtp5,
            binding.etOtp6
        )

        for (i in 0 until boxes.size - 1) {
            boxes[i].addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    if (s?.length == 1) {
                        boxes[i + 1].requestFocus()
                    }
                }
            })
        }
    }

    private fun getEnteredOtp(): String {
        return binding.etOtp1.text.toString().trim() +
                binding.etOtp2.text.toString().trim() +
                binding.etOtp3.text.toString().trim() +
                binding.etOtp4.text.toString().trim() +
                binding.etOtp5.text.toString().trim() +
                binding.etOtp6.text.toString().trim()
    }

    private fun navigateToDashboard(role: String) {
        val targetIntent = when {
            role.contains("OWNER", ignoreCase = true) || role.contains("Owner", ignoreCase = true) ->
                Intent(this, OwnerMainActivity::class.java)
            role.contains("Worker", ignoreCase = true) -> Intent(this, WorkerMainActivity::class.java)
            role.contains("Admin", ignoreCase = true) -> Intent(this, AdminMainActivity::class.java)
            else -> Intent(this, FarmerMainActivity::class.java)
        }
        startActivity(targetIntent)
        finishAffinity()
    }
}
