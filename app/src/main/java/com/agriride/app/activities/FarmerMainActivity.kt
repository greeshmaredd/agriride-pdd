package com.agriride.app.activities

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.agriride.app.R
import com.agriride.app.databinding.ActivityFarmerMainBinding
import com.agriride.app.fragments.AgriculturalStoreFragment
import com.agriride.app.fragments.FarmerCommunityFragment
import com.agriride.app.fragments.FarmerHomeFragment
import com.agriride.app.fragments.MyBookingsFragment
import com.agriride.app.viewmodels.NotificationViewModel

class FarmerMainActivity : BaseActivity() {

    private lateinit var binding: ActivityFarmerMainBinding
    private val notificationViewModel: NotificationViewModel by viewModels()

    private val requestPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        notificationViewModel.fetchAndSaveFcmToken()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityFarmerMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else {
                notificationViewModel.fetchAndSaveFcmToken()
            }
        } else {
            notificationViewModel.fetchAndSaveFcmToken()
        }

        binding.farmerBottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    loadFragment(FarmerHomeFragment())
                    true
                }
                R.id.nav_bookings -> {
                    loadFragment(MyBookingsFragment())
                    true
                }
                R.id.nav_profile -> {
                    loadFragment(com.agriride.app.fragments.ProfileFragment())
                    true
                }
                else -> false
            }
        }

        val targetNavId = intent.getIntExtra("NAV_TARGET", R.id.nav_home)
        if (savedInstanceState == null) {
            binding.farmerBottomNav.selectedItemId = targetNavId
            if (supportFragmentManager.findFragmentById(R.id.farmerFragmentContainer) == null) {
                loadFragment(FarmerHomeFragment())
            }
        }
    }

    fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.farmerFragmentContainer, fragment)
            .commit()
    }
}
