package com.agriride.app.utils

import android.content.Context
import android.content.res.Configuration
import android.os.Build
import android.os.LocaleList
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import java.util.Locale

object LocaleHelper {
    private const val PREFS_NAME = "agriride_prefs"
    private const val KEY_LANGUAGE = "selected_language"

    fun onAttach(context: Context): Context {
        val lang = getLanguage(context)
        return setLocale(context, lang)
    }

    fun getLanguage(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_LANGUAGE, "en") ?: "en"
    }

    fun isTelugu(context: Context): Boolean {
        val lang = getLanguage(context)
        return lang.equals("te", ignoreCase = true) || lang.equals("telugu", ignoreCase = true)
    }

    fun setLocale(context: Context, language: String): Context {
        val langCode = when (language.lowercase()) {
            "te", "telugu" -> "te"
            "ta", "tamil" -> "ta"
            "hi", "hindi" -> "hi"
            else -> "en"
        }

        persist(context, langCode)

        val locale = Locale(langCode)
        Locale.setDefault(locale)

        val res = context.resources
        val config = Configuration(res.configuration)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            config.setLocale(locale)
            val localeList = LocaleList(locale)
            LocaleList.setDefault(localeList)
            config.setLocales(localeList)
        } else {
            @Suppress("DEPRECATION")
            config.locale = locale
        }
        config.setLayoutDirection(locale)

        @Suppress("DEPRECATION")
        res.updateConfiguration(config, res.displayMetrics)

        val appCtx = context.applicationContext
        if (appCtx != null && appCtx != context) {
            @Suppress("DEPRECATION")
            appCtx.resources.updateConfiguration(config, appCtx.resources.displayMetrics)
        }

        try {
            val appLocales = LocaleListCompat.forLanguageTags(langCode)
            if (AppCompatDelegate.getApplicationLocales() != appLocales) {
                AppCompatDelegate.setApplicationLocales(appLocales)
            }
        } catch (_: Exception) {
        }

        return context.createConfigurationContext(config)
    }

    private fun persist(context: Context, language: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_LANGUAGE, language).apply()
    }
}

