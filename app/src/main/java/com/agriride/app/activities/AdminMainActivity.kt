package com.agriride.app.activities

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityAdminMainBinding

class AdminMainActivity : BaseActivity() {

    private lateinit var binding: ActivityAdminMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAdminMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}
