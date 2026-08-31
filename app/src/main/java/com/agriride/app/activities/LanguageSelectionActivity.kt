package com.agriride.app.activities

import android.content.Intent
import android.content.res.ColorStateList
import android.os.Bundle
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.agriride.app.R
import com.agriride.app.databinding.ActivityLanguageSelectionBinding
import com.agriride.app.utils.LocaleHelper

class LanguageSelectionActivity : BaseActivity() {

    private lateinit var binding: ActivityLanguageSelectionBinding
    private var selectedLang = "English"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLanguageSelectionBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val currentCode = LocaleHelper.getLanguage(this)
        val initialLang = when (currentCode) {
            "te" -> "Telugu"
            "ta" -> "Tamil"
            "hi" -> "Hindi"
            else -> "English"
        }
        selectLanguage(initialLang)

        binding.cardEng.setOnClickListener { selectLanguage("English") }
        binding.cardTel.setOnClickListener { selectLanguage("Telugu") }
        binding.cardTam.setOnClickListener { selectLanguage("Tamil") }
        binding.cardHin.setOnClickListener { selectLanguage("Hindi") }

        binding.btnContinueLangSel.setOnClickListener {
            val langCode = when (selectedLang) {
                "Telugu" -> "te"
                "Tamil" -> "ta"
                "Hindi" -> "hi"
                else -> "en"
            }
            LocaleHelper.setLocale(this, langCode)
            val msg = if (langCode == "te") "భాష విజయవంతంగా తెలుగుకు మార్చబడింది" else "Language set to $selectedLang"
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()

            val authRepo = com.agriride.app.repositories.AuthRepository()
            if (authRepo.isUserLoggedIn()) {
                authRepo.fetchCurrentUserProfile { user ->
                    val role = user?.role ?: "Farmer"
                    val intent = when {
                        role.contains("Owner", ignoreCase = true) -> Intent(this, OwnerMainActivity::class.java)
                        role.contains("Worker", ignoreCase = true) -> Intent(this, WorkerMainActivity::class.java)
                        else -> Intent(this, FarmerMainActivity::class.java)
                    }
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }
            } else {
                val intent = Intent(this, LoginActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            }
        }
    }

    private fun selectLanguage(lang: String) {
        selectedLang = lang
        val langCode = when (lang) {
            "Telugu" -> "te"
            "Tamil" -> "ta"
            "Hindi" -> "hi"
            else -> "en"
        }
        LocaleHelper.setLocale(this, langCode)

        val primaryGreen = ContextCompat.getColor(this, R.color.primary_green)
        val mutedText = ContextCompat.getColor(this, R.color.text_muted)
        val selectedBg = ContextCompat.getColor(this, R.color.secondary_green_soft)
        val whiteBg = ContextCompat.getColor(this, R.color.surface_white)
        val borderLight = ContextCompat.getColor(this, R.color.border_light)

        // Reset all cards
        binding.cardEng.setCardBackgroundColor(whiteBg)
        binding.cardEng.strokeColor = borderLight
        binding.cardEng.strokeWidth = 2
        binding.rbEnglish.isChecked = false
        binding.rbEnglish.buttonTintList = ColorStateList.valueOf(mutedText)

        binding.cardTel.setCardBackgroundColor(whiteBg)
        binding.cardTel.strokeColor = borderLight
        binding.cardTel.strokeWidth = 2
        binding.rbTelugu.isChecked = false
        binding.rbTelugu.buttonTintList = ColorStateList.valueOf(mutedText)

        binding.cardTam.setCardBackgroundColor(whiteBg)
        binding.cardTam.strokeColor = borderLight
        binding.cardTam.strokeWidth = 2
        binding.rbTamil.isChecked = false
        binding.rbTamil.buttonTintList = ColorStateList.valueOf(mutedText)

        binding.cardHin.setCardBackgroundColor(whiteBg)
        binding.cardHin.strokeColor = borderLight
        binding.cardHin.strokeWidth = 2
        binding.rbHindi.isChecked = false
        binding.rbHindi.buttonTintList = ColorStateList.valueOf(mutedText)

        when (lang) {
            "English" -> {
                binding.cardEng.setCardBackgroundColor(selectedBg)
                binding.cardEng.strokeColor = primaryGreen
                binding.cardEng.strokeWidth = 4
                binding.rbEnglish.isChecked = true
                binding.rbEnglish.buttonTintList = ColorStateList.valueOf(primaryGreen)
                binding.btnContinueLangSel.text = "Continue ➔"
            }
            "Telugu" -> {
                binding.cardTel.setCardBackgroundColor(selectedBg)
                binding.cardTel.strokeColor = primaryGreen
                binding.cardTel.strokeWidth = 4
                binding.rbTelugu.isChecked = true
                binding.rbTelugu.buttonTintList = ColorStateList.valueOf(primaryGreen)
                binding.btnContinueLangSel.text = "కొనసాగించండి ➔"
            }
            "Tamil" -> {
                binding.cardTam.setCardBackgroundColor(selectedBg)
                binding.cardTam.strokeColor = primaryGreen
                binding.cardTam.strokeWidth = 4
                binding.rbTamil.isChecked = true
                binding.rbTamil.buttonTintList = ColorStateList.valueOf(primaryGreen)
                binding.btnContinueLangSel.text = "தொடరவும் ➔"
            }
            "Hindi" -> {
                binding.cardHin.setCardBackgroundColor(selectedBg)
                binding.cardHin.strokeColor = primaryGreen
                binding.cardHin.strokeWidth = 4
                binding.rbHindi.isChecked = true
                binding.rbHindi.buttonTintList = ColorStateList.valueOf(primaryGreen)
                binding.btnContinueLangSel.text = "आगे बढ़ें ➔"
            }
        }
    }
}
