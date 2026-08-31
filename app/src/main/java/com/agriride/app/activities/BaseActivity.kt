package com.agriride.app.activities

import android.content.Context
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.utils.LocaleHelper

abstract class BaseActivity : AppCompatActivity() {
    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleHelper.onAttach(newBase))
    }
}
