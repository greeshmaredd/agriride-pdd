package com.agriride.app.activities

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.R
import com.agriride.app.databinding.ActivityOwnerMainBinding
import com.agriride.app.fragments.OwnerDashboardFragment
import com.agriride.app.viewmodels.NotificationViewModel

class OwnerMainActivity : BaseActivity() {

    private lateinit var binding: ActivityOwnerMainBinding
    private val notificationViewModel: NotificationViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOwnerMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        notificationViewModel.fetchAndSaveFcmToken()

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.ownerFragmentContainer, OwnerDashboardFragment())
                .commit()
        }
    }
}
