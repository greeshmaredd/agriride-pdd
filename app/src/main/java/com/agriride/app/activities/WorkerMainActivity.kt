package com.agriride.app.activities

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.R
import com.agriride.app.databinding.ActivityWorkerMainBinding
import com.agriride.app.fragments.WorkerDashboardFragment
import com.agriride.app.viewmodels.NotificationViewModel

class WorkerMainActivity : BaseActivity() {

    private lateinit var binding: ActivityWorkerMainBinding
    private val notificationViewModel: NotificationViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWorkerMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        notificationViewModel.fetchAndSaveFcmToken()

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.workerFragmentContainer, WorkerDashboardFragment())
                .commit()
        }
    }
}
