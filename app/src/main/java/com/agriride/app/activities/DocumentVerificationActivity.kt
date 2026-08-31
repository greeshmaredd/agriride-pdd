package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityDocumentVerificationBinding

class DocumentVerificationActivity : BaseActivity() {

    private lateinit var binding: ActivityDocumentVerificationBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDocumentVerificationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnDocBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.btnViewRc.setOnClickListener {
            Toast.makeText(this, "Displaying Registration Certificate (RC)", Toast.LENGTH_SHORT).show()
        }

        binding.btnViewIns.setOnClickListener {
            Toast.makeText(this, "Displaying Vehicle Insurance Certificate", Toast.LENGTH_SHORT).show()
        }

        binding.btnViewPermit.setOnClickListener {
            Toast.makeText(this, "Displaying Commercial Permit", Toast.LENGTH_SHORT).show()
        }

        binding.btnSubmitVerification.setOnClickListener {
            Toast.makeText(this, "KYC verified and equipment active on portal!", Toast.LENGTH_LONG).show()

            // Navigate to Booking Requests Screen 27
            val intent = Intent(this, OwnerBookingRequestsActivity::class.java)
            startActivity(intent)
            finish()
        }
    }
}
