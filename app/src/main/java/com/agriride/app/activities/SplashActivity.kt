package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivitySplashBinding
import com.agriride.app.viewmodels.AuthViewModel

class SplashActivity : BaseActivity() {

    private lateinit var binding: ActivitySplashBinding
    private val authViewModel: AuthViewModel by viewModels()
    private var hasNavigated = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnTapToContinue.setOnClickListener {
            navigateToNext()
        }

        Handler(Looper.getMainLooper()).postDelayed({
            navigateToNext()
        }, 2500)
    }

    private fun navigateToNext() {
        if (hasNavigated) return
        hasNavigated = true

        if (authViewModel.isUserLoggedIn()) {
            var isNavigatedDone = false
            val handler = Handler(Looper.getMainLooper())

            authViewModel.fetchCurrentUserProfile { user ->
                if (!isNavigatedDone) {
                    isNavigatedDone = true
                    val role = user?.role ?: "Farmer"
                    val targetIntent = when {
                        role.contains("OWNER", ignoreCase = true) || 
                        role.contains("Owner", ignoreCase = true) || 
                        role.contains("Equipment Owner", ignoreCase = true) ->
                            Intent(this@SplashActivity, OwnerMainActivity::class.java)
                        role.contains("Worker", ignoreCase = true) -> Intent(this@SplashActivity, WorkerMainActivity::class.java)
                        role.contains("Admin", ignoreCase = true) -> Intent(this@SplashActivity, AdminMainActivity::class.java)
                        else -> Intent(this@SplashActivity, FarmerMainActivity::class.java)
                    }
                    startActivity(targetIntent)
                    finish()
                }
            }

            handler.postDelayed({
                if (!isNavigatedDone) {
                    isNavigatedDone = true
                    startActivity(Intent(this@SplashActivity, FarmerMainActivity::class.java))
                    finish()
                }
            }, 3000)
        } else {
            startActivity(Intent(this, OnboardingActivity::class.java))
            finish()
        }
    }
}
