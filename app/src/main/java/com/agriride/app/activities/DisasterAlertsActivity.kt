package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityDisasterAlertsBinding

class DisasterAlertsActivity : BaseActivity() {

    private lateinit var binding: ActivityDisasterAlertsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDisasterAlertsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnAlertsBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.navAlertsHome.setOnClickListener {
            val intent = Intent(this, FarmerMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            startActivity(intent)
            finish()
        }

        binding.navAlertsBookings.setOnClickListener {
            val intent = Intent(this, FarmerMainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            startActivity(intent)
            finish()
        }
    }
}
