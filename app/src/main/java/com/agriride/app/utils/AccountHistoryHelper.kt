package com.agriride.app.utils

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class SavedAccount(
    val email: String,
    val role: String,
    val name: String = ""
)

object AccountHistoryHelper {
    private const val PREF_NAME = "agriride_accounts_pref"
    private const val KEY_ACCOUNTS = "saved_accounts_json"

    fun saveAccount(context: Context, email: String, role: String, name: String = "") {
        if (email.isBlank()) return
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val currentAccounts = getSavedAccounts(context).toMutableList()

        currentAccounts.removeAll { it.email.equals(email.trim(), ignoreCase = true) }
        currentAccounts.add(0, SavedAccount(email = email.trim(), role = role.trim(), name = name.trim()))

        val jsonArray = JSONArray()
        currentAccounts.take(10).forEach { acc ->
            val obj = JSONObject()
            obj.put("email", acc.email)
            obj.put("role", acc.role)
            obj.put("name", acc.name)
            jsonArray.put(obj)
        }
        prefs.edit().putString(KEY_ACCOUNTS, jsonArray.toString()).apply()
    }

    fun getSavedAccounts(context: Context): List<SavedAccount> {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val jsonStr = prefs.getString(KEY_ACCOUNTS, null) ?: return emptyList()
        val list = mutableListOf<SavedAccount>()
        try {
            val jsonArray = JSONArray(jsonStr)
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                val email = obj.optString("email")
                val role = obj.optString("role", "Farmer")
                val name = obj.optString("name", "")
                if (email.isNotBlank()) {
                    list.add(SavedAccount(email = email, role = role, name = name))
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return list
    }

    fun getSavedEmails(context: Context): List<String> {
        return getSavedAccounts(context).map { it.email }.distinct()
    }
}
