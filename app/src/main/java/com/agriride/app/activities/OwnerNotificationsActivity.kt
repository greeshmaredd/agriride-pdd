package com.agriride.app.activities

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.databinding.ActivityOwnerNotificationsBinding
import com.agriride.app.databinding.ItemNotificationBinding
import com.agriride.app.models.Notification
import com.agriride.app.viewmodels.NotificationViewModel

class OwnerNotificationsActivity : BaseActivity() {

    private lateinit var binding: ActivityOwnerNotificationsBinding
    private val notificationViewModel: NotificationViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOwnerNotificationsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnNotifBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.rvNotifications.layoutManager = LinearLayoutManager(this)

        notificationViewModel.getUserNotifications().observe(this) { list ->
            if (list.isEmpty()) {
                binding.rvNotifications.visibility = View.GONE
                binding.layoutEmptyNotifications.visibility = View.VISIBLE
            } else {
                binding.rvNotifications.visibility = View.VISIBLE
                binding.layoutEmptyNotifications.visibility = View.GONE

                val adapter = NotificationAdapter(list) { notif ->
                    notificationViewModel.markAsRead(notif.notificationId)
                    Toast.makeText(this, "Marked as read", Toast.LENGTH_SHORT).show()
                }
                binding.rvNotifications.adapter = adapter
            }
        }

        binding.btnMarkAllRead.setOnClickListener {
            notificationViewModel.markAllAsRead()
            Toast.makeText(this, "All notifications marked as read", Toast.LENGTH_SHORT).show()
        }
    }
}

class NotificationAdapter(
    private val notifications: List<Notification>,
    private val onMarkReadClick: (Notification) -> Unit
) : RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder>() {

    inner class NotificationViewHolder(val binding: ItemNotificationBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotificationViewHolder {
        val binding = ItemNotificationBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return NotificationViewHolder(binding)
    }

    override fun onBindViewHolder(holder: NotificationViewHolder, position: Int) {
        val item = notifications[position]

        val iconStr = when (item.type.uppercase()) {
            "BOOKING_ACCEPTED", "BOOKING_CONFIRMED" -> "🟢"
            "BOOKING_REJECTED", "BOOKING_CANCELLED" -> "🔴"
            "WORKER_ASSIGNED" -> "👷"
            "CASH_CONFIRMED", "PAYMENT_RECEIVED" -> "💵"
            "WEATHER_ALERT" -> "🌦"
            else -> "🔔"
        }
        holder.binding.tvNotifIcon.text = iconStr
        holder.binding.tvNotifTitle.text = item.title
        holder.binding.tvNotifMessage.text = item.message
        holder.binding.tvNotifTime.text = "Just now"

        if (item.isRead) {
            holder.binding.viewUnreadDot.visibility = View.GONE
            holder.binding.btnMarkRead.visibility = View.GONE
            holder.binding.tvNotifTitle.setTypeface(null, android.graphics.Typeface.NORMAL)
        } else {
            holder.binding.viewUnreadDot.visibility = View.VISIBLE
            holder.binding.btnMarkRead.visibility = View.VISIBLE
            holder.binding.tvNotifTitle.setTypeface(null, android.graphics.Typeface.BOLD)

            holder.binding.btnMarkRead.setOnClickListener {
                onMarkReadClick(item)
            }
        }
    }

    override fun getItemCount(): Int = notifications.size
}
