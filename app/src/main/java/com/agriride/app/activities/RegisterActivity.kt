package com.agriride.app.activities

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.databinding.ActivityRegisterBinding
import com.agriride.app.models.Resource
import com.agriride.app.models.User
import com.agriride.app.viewmodels.AuthViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.util.Locale

class RegisterActivity : BaseActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private val authViewModel: AuthViewModel by viewModels()
    private var selectedRole = "FARMER"
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true) {
            fetchGpsLocation()
        } else {
            Toast.makeText(this, "Location permission required to locate village automatically", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        binding.etFullName.setText("")
        binding.etRegMobile.setText("")
        binding.etRegLocation.setText("")
        binding.etRegPassword.setText("")

        val prefillName = intent.getStringExtra("PREFILL_NAME") ?: ""
        val prefillEmail = intent.getStringExtra("PREFILL_EMAIL") ?: ""
        val prefillRole = intent.getStringExtra("PREFILL_ROLE") ?: "FARMER"

        if (prefillName.isNotBlank()) binding.etFullName.setText(prefillName)
        if (prefillEmail.isNotBlank()) {
            val phonePart = prefillEmail.substringBefore("@")
            binding.etRegMobile.setText(phonePart)
        }

        selectRole(prefillRole)

        binding.btnBackReg.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.cardRoleFarmer.setOnClickListener { selectRole("FARMER") }
        binding.cardRoleOwner.setOnClickListener { selectRole("OWNER") }
        binding.cardRoleWorker.setOnClickListener { selectRole("Worker") }

        binding.btnLocateMe.setOnClickListener {
            checkAndFetchLocation()
        }

        binding.btnCreateAccount.setOnClickListener {
            val fullName = binding.etFullName.text.toString().trim()
            val mobile = binding.etRegMobile.text.toString().trim()
            val passwordInput = binding.etRegPassword.text.toString().trim()
            val location = binding.etRegLocation.text.toString().trim()

            if (fullName.isEmpty()) {
                binding.etFullName.error = "Enter full name"
                return@setOnClickListener
            }
            if (mobile.isEmpty()) {
                binding.etRegMobile.error = "Enter phone number"
                return@setOnClickListener
            }
            if (passwordInput.length < 6) {
                binding.etRegPassword.error = "Password must be at least 6 characters"
                return@setOnClickListener
            }

            val sanitizedMobile = mobile.replace(" ", "").replace("+91", "")
            val finalEmail = if (sanitizedMobile.contains("@")) sanitizedMobile else "$sanitizedMobile@agriride.in"
            val user = User(
                name = fullName,
                email = finalEmail,
                mobileNumber = mobile,
                phone = mobile,
                role = selectedRole,
                location = location
            )

            binding.btnCreateAccount.isEnabled = false
            authViewModel.register(user, passwordInput).observe(this) { resource ->
                binding.btnCreateAccount.isEnabled = true
                when (resource) {
                    is Resource.Loading -> {
                        Toast.makeText(this, "Creating your AgriRide account...", Toast.LENGTH_SHORT).show()
                    }
                    is Resource.Success -> {
                        Toast.makeText(this, "Account created successfully! Logged in as ${resource.data.name}", Toast.LENGTH_LONG).show()

                        com.agriride.app.utils.AccountHistoryHelper.saveAccount(
                            this,
                            finalEmail,
                            selectedRole,
                            fullName
                        )

                        val targetIntent = when {
                            selectedRole.equals("OWNER", ignoreCase = true) -> Intent(this, OwnerMainActivity::class.java)
                            selectedRole.equals("Worker", ignoreCase = true) -> Intent(this, WorkerMainActivity::class.java)
                            else -> Intent(this, FarmerMainActivity::class.java)
                        }
                        startActivity(targetIntent)
                        finishAffinity()
                    }
                    is Resource.Error -> {
                        Toast.makeText(this, resource.message, Toast.LENGTH_LONG).show()
                    }
                    else -> {}
                }
            }
        }
    }

    private fun checkAndFetchLocation() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fetchGpsLocation()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    private fun fetchGpsLocation() {
        try {
            Toast.makeText(this, "Locating your current village position...", Toast.LENGTH_SHORT).show()
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (location != null) {
                    try {
                        val geocoder = Geocoder(this, Locale.getDefault())
                        val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
                        if (!addresses.isNullOrEmpty()) {
                            val addr = addresses[0]
                            val village = addr.subLocality ?: (addr.locality ?: "Vijayawada Rural")
                            val dist = addr.subAdminArea ?: (addr.adminArea ?: "Krishna")
                            val locString = "$village, $dist"
                            binding.etRegLocation.setText(locString)
                            Toast.makeText(this, "Location detected: $locString", Toast.LENGTH_SHORT).show()
                        } else {
                            binding.etRegLocation.setText("Vijayawada Rural, Krishna")
                        }
                    } catch (e: Exception) {
                        binding.etRegLocation.setText("Vijayawada Rural, Krishna")
                    }
                } else {
                    binding.etRegLocation.setText("Vijayawada Rural, Krishna")
                }
            }.addOnFailureListener {
                binding.etRegLocation.setText("Vijayawada Rural, Krishna")
            }
        } catch (e: Exception) {
            binding.etRegLocation.setText("Vijayawada Rural, Krishna")
        }
    }

    private fun selectRole(role: String) {
        selectedRole = role
        val activeBg = ContextCompat.getColor(this, R.color.primary_green)
        val inactiveBg = ContextCompat.getColor(this, R.color.surface_white)
        val activeText = ContextCompat.getColor(this, R.color.surface_white)
        val inactiveText = ContextCompat.getColor(this, R.color.text_primary)
        val borderLight = ContextCompat.getColor(this, R.color.border_light)

        binding.cardRoleFarmer.setCardBackgroundColor(inactiveBg)
        binding.cardRoleFarmer.strokeColor = borderLight
        binding.cardRoleFarmer.strokeWidth = 2
        binding.tvRoleFarmerText.setTextColor(inactiveText)

        binding.cardRoleOwner.setCardBackgroundColor(inactiveBg)
        binding.cardRoleOwner.strokeColor = borderLight
        binding.cardRoleOwner.strokeWidth = 2
        binding.tvRoleOwnerText.setTextColor(inactiveText)

        binding.cardRoleWorker.setCardBackgroundColor(inactiveBg)
        binding.cardRoleWorker.strokeColor = borderLight
        binding.cardRoleWorker.strokeWidth = 2
        binding.tvRoleWorkerText.setTextColor(inactiveText)

        when (role) {
            "FARMER" -> {
                binding.cardRoleFarmer.setCardBackgroundColor(activeBg)
                binding.cardRoleFarmer.strokeWidth = 0
                binding.tvRoleFarmerText.setTextColor(activeText)
            }
            "OWNER" -> {
                binding.cardRoleOwner.setCardBackgroundColor(activeBg)
                binding.cardRoleOwner.strokeWidth = 0
                binding.tvRoleOwnerText.setTextColor(activeText)
            }
            "Worker" -> {
                binding.cardRoleWorker.setCardBackgroundColor(activeBg)
                binding.cardRoleWorker.strokeWidth = 0
                binding.tvRoleWorkerText.setTextColor(activeText)
            }
        }
    }
}
