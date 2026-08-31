package com.agriride.app.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.agriride.app.R
import com.agriride.app.activities.BookingDetailsActivity
import com.agriride.app.activities.FarmerMainActivity
import com.agriride.app.repositories.FirebaseConfig
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class AgriFirebaseMessagingService : FirebaseMessagingService() {

    private val tag = "AgriFirebaseMessaging"

    companion object {
        const val CHANNEL_ID = "agriride_notifications"
        const val CHANNEL_NAME = "AgriRide Notifications"

        fun showLocalNotification(
            context: Context,
            title: String,
            message: String,
            type: String = "GENERAL",
            targetId: String = ""
        ) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "AgriRide real-time booking and task alerts"
                    enableVibration(true)
                }
                notificationManager.createNotificationChannel(channel)
            }

            val intent = when {
                targetId.isNotBlank() && type.startsWith("BOOKING") -> {
                    Intent(context, BookingDetailsActivity::class.java).apply {
                        putExtra("BOOKING_ID", targetId)
                    }
                }
                else -> Intent(context, FarmerMainActivity::class.java)
            }
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP

            val pendingIntent = PendingIntent.getActivity(
                context,
                System.currentTimeMillis().toInt(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(message)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)

            notificationManager.notify((System.currentTimeMillis() % 10000).toInt(), builder.build())
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "AgriRide Alert"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["message"] ?: "Booking status updated"
        val type = remoteMessage.data["type"] ?: "GENERAL"
        val targetId = remoteMessage.data["bookingId"] ?: remoteMessage.data["id"] ?: ""

        Log.d(tag, "FCM Message received: $title - $body")
        showLocalNotification(applicationContext, title, body, type, targetId)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(tag, "Refreshed FCM token: $token")
        try {
            val uid = FirebaseAuth.getInstance().currentUser?.uid
            if (!uid.isNullOrEmpty()) {
                val rtdb = FirebaseConfig.getRealtimeDatabase()
                rtdb?.getReference("users")?.child(uid)?.child("fcmToken")?.setValue(token)
            }
        } catch (e: Exception) {
            Log.e(tag, "Failed to update FCM token in RTDB", e)
        }
    }
}
