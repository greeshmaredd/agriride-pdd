package com.agriride.app.activities

import android.graphics.Color
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.messaging.FirebaseMessaging
import java.util.UUID

class FirebaseVerificationActivity : BaseActivity() {

    private lateinit var logContainer: LinearLayout
    private val TAG = "FIREBASE_VERIFY"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val scrollView = ScrollView(this)
        logContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 48, 32, 48)
            setBackgroundColor(Color.parseColor("#0F172A"))
        }
        scrollView.addView(logContainer)
        setContentView(scrollView)

        addLogHeader("🔥 AGRI-RIDE FIREBASE CONNECTIVITY TEST")
        runAllTests()
    }

    private fun addLogHeader(text: String) {
        val textView = TextView(this).apply {
            this.text = text
            textSize = 20f
            setTextColor(Color.WHITE)
            setTypeface(null, android.graphics.Typeface.BOLD)
            setPadding(0, 0, 0, 32)
        }
        logContainer.addView(textView)
        Log.i(TAG, text)
    }

    private fun addTestResult(testName: String, passed: Boolean, details: String) {
        val statusText = if (passed) "PASS" else "FAIL"

        val textView = TextView(this).apply {
            text = "• $testName: [$statusText]\n  $details\n"
            textSize = 15f
            setTextColor(if (passed) Color.parseColor("#22C55E") else Color.parseColor("#FCA5A5"))
            setPadding(0, 8, 0, 16)
        }
        logContainer.addView(textView)
        Log.i(TAG, "[$statusText] $testName: $details")
    }

    private fun runAllTests() {
        testAuth { authPassed, authDetails ->
            addTestResult("1. Firebase Authentication", authPassed, authDetails)

            testDatabase { dbPassed, dbDetails ->
                addTestResult("2. Realtime Database read/write", dbPassed, dbDetails)

                testStorage { storagePassed, storageDetails ->
                    addTestResult("3. Image Storage (Zero-Cost Spark Mode)", storagePassed, storageDetails)

                    testFcm { fcmPassed, fcmDetails ->
                        addTestResult("4. FCM token registration", fcmPassed, fcmDetails)
                        Log.i(TAG, "=== ALL TESTS COMPLETED ===")
                    }
                }
            }
        }
    }

    // 1. Firebase Authentication
    private fun testAuth(onComplete: (Boolean, String) -> Unit) {
        val auth = FirebaseAuth.getInstance()
        val testEmail = "testfarmer@agriride.in"
        val testPass = "123456"

        auth.signInWithEmailAndPassword(testEmail, testPass)
            .addOnSuccessListener { res ->
                onComplete(true, "Signed in with email successfully (UID: ${res.user?.uid})")
            }
            .addOnFailureListener { exc ->
                auth.createUserWithEmailAndPassword(testEmail, testPass)
                    .addOnSuccessListener { res ->
                        onComplete(true, "Registered new user in Firebase Auth successfully (UID: ${res.user?.uid})")
                    }
                    .addOnFailureListener { exc2 ->
                        auth.signInAnonymously()
                            .addOnSuccessListener { resAnon ->
                                onComplete(true, "Anonymous auth succeeded (UID: ${resAnon.user?.uid})")
                            }
                            .addOnFailureListener { excAnon ->
                                onComplete(false, "Email Sign-In: '${exc.message}' | Email Create: '${exc2.message}' | Anon Auth: '${excAnon.message}'")
                            }
                    }
            }
    }

    // 2. Realtime Database read/write
    private fun testDatabase(onComplete: (Boolean, String) -> Unit) {
        val dbRef = FirebaseDatabase.getInstance().getReference("_connectivity_test")
        val testKey = UUID.randomUUID().toString()
        val testVal = "AgriRide_DB_Test_${System.currentTimeMillis()}"

        dbRef.child(testKey).setValue(testVal)
            .addOnSuccessListener {
                dbRef.child(testKey).get()
                    .addOnSuccessListener { snapshot ->
                        val readVal = snapshot.value.toString()
                        if (readVal == testVal) {
                            dbRef.child(testKey).removeValue()
                            onComplete(true, "Wrote & read back key '$testKey' matching value '$readVal'")
                        } else {
                            onComplete(false, "Value mismatch. Expected '$testVal' but read '$readVal'")
                        }
                    }
                    .addOnFailureListener { exc ->
                        onComplete(false, "DB Read failed: ${exc.message}")
                    }
            }
            .addOnFailureListener { exc ->
                onComplete(false, "DB Write failed: ${exc.message}")
            }
    }

    // 3. Image Storage (Zero-Cost Spark Plan Base64/Realtime Storage)
    private fun testStorage(onComplete: (Boolean, String) -> Unit) {
        val dummyImageBytes = "AgriRide Zero-Cost Image Storage Test Payload".toByteArray()
        val base64Image = Base64.encodeToString(dummyImageBytes, Base64.DEFAULT)
        val imageId = UUID.randomUUID().toString()

        val dbRef = FirebaseDatabase.getInstance().getReference("storage_images").child(imageId)
        dbRef.setValue(mapOf("data" to base64Image, "createdAt" to System.currentTimeMillis()))
            .addOnSuccessListener {
                dbRef.get()
                    .addOnSuccessListener { snapshot ->
                        val retrievedData = snapshot.child("data").value?.toString()
                        if (retrievedData == base64Image) {
                            dbRef.removeValue()
                            onComplete(true, "Zero-Cost Image Storage active via Firebase Realtime Database (Encoded & retrieved $imageId)")
                        } else {
                            onComplete(false, "Image data verification mismatch")
                        }
                    }
                    .addOnFailureListener { exc ->
                        onComplete(false, "Image retrieve failed: ${exc.message}")
                    }
            }
            .addOnFailureListener { exc ->
                onComplete(false, "Image upload failed: ${exc.message}")
            }
    }

    // 4. FCM Token registration
    private fun testFcm(onComplete: (Boolean, String) -> Unit) {
        FirebaseMessaging.getInstance().token
            .addOnSuccessListener { token ->
                if (!token.isNullOrEmpty()) {
                    onComplete(true, "FCM token retrieved successfully (${token.take(30)}...)")
                } else {
                    onComplete(false, "FCM token retrieved was null or empty")
                }
            }
            .addOnFailureListener { exc ->
                onComplete(false, "FCM token retrieval failed: ${exc.message}")
            }
    }
}
