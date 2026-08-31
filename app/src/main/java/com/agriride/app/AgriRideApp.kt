package com.agriride.app

import android.app.Application
import android.content.Context
import android.content.res.Configuration
import com.agriride.app.utils.LocaleHelper

class AgriRideApp : Application() {

    companion object {
        lateinit var instance: AgriRideApp
            private set
    }

    override fun attachBaseContext(base: Context) {
        super.attachBaseContext(LocaleHelper.onAttach(base))
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        LocaleHelper.onAttach(this)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        LocaleHelper.onAttach(this)
    }
}
