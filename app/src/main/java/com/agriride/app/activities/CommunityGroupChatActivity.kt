package com.agriride.app.activities

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.databinding.ActivityCommunityGroupChatBinding
import com.agriride.app.databinding.ItemGroupChatMessageBinding
import com.agriride.app.models.GroupChatMessage
import com.agriride.app.repositories.AuthRepository
import com.agriride.app.viewmodels.CommunityViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CommunityGroupChatActivity : BaseActivity() {

    private lateinit var binding: ActivityCommunityGroupChatBinding
    private val communityViewModel: CommunityViewModel by viewModels()

    private var groupId: String = ""
    private var groupName: String = ""
    private var groupAvatar: String = "🌾"

    private lateinit var chatAdapter: GroupChatAdapter
    private val currentUid: String by lazy {
        AuthRepository().getCurrentUserId() ?: "USR_FARMER_1"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCommunityGroupChatBinding.inflate(layoutInflater)
        setContentView(binding.root)

        groupId = intent.getStringExtra("GROUP_ID") ?: "GROUP_MEVALURKUPPAM"
        groupName = intent.getStringExtra("GROUP_NAME") ?: "🌾 Mevalurkuppam Farmers Circle"
        groupAvatar = intent.getStringExtra("GROUP_AVATAR") ?: "🌾"

        setupViews()
        observeMessages()
    }

    private fun setupViews() {
        binding.tvChatGroupName.text = groupName
        binding.tvChatAvatar.text = groupAvatar
        binding.btnChatBack.setOnClickListener {
            finish()
        }

        chatAdapter = GroupChatAdapter(currentUid)
        val layoutManager = LinearLayoutManager(this)
        layoutManager.stackFromEnd = true
        binding.rvGroupChatMessages.layoutManager = layoutManager
        binding.rvGroupChatMessages.adapter = chatAdapter

        binding.btnSendMessage.setOnClickListener {
            val text = binding.etChatMessage.text.toString().trim()
            if (text.isNotEmpty()) {
                communityViewModel.sendMessage(groupId, text) { success ->
                    if (success) {
                        binding.etChatMessage.text.clear()
                    } else {
                        Toast.makeText(this, "Failed to send message", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

        binding.btnAddMember.setOnClickListener {
            showAddMemberDialog()
        }

        binding.layoutGroupInfo.setOnClickListener {
            showGroupInfoDialog()
        }
    }

    private fun observeMessages() {
        communityViewModel.getGroupMessages(groupId).observe(this) { messages ->
            chatAdapter.submitList(messages)
            if (messages.isNotEmpty()) {
                binding.rvGroupChatMessages.scrollToPosition(messages.size - 1)
            }
        }

        communityViewModel.groups.observe(this) { groups ->
            val currentGroup = groups.find { it.groupId == groupId }
            if (currentGroup != null) {
                binding.tvChatGroupSubtitle.text = "👥 ${currentGroup.membersCount} members • Tap for details"
            }
        }
    }

    private fun showAddMemberDialog() {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 24)
        }

        val etIdentifier = EditText(this).apply {
            hint = "Mobile number (e.g. +91 98480 22338) or Email"
            inputType = android.text.InputType.TYPE_CLASS_TEXT
        }

        val etName = EditText(this).apply {
            hint = "Farmer Name (e.g. Balaji Rao)"
            inputType = android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS
        }

        layout.addView(etIdentifier)
        layout.addView(etName)

        AlertDialog.Builder(this)
            .setTitle("Add Member to Group / సభ్యుడిని చేర్చండి")
            .setMessage("Enter the mobile number or email ID of the farmer to add to $groupName:")
            .setView(layout)
            .setPositiveButton("Add Member") { dialog, _ ->
                val identifier = etIdentifier.text.toString().trim()
                val name = etName.text.toString().trim()
                if (identifier.isNotEmpty()) {
                    communityViewModel.addMemberToGroup(groupId, identifier, name) { success, msg ->
                        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this, "Please enter a valid mobile number or email", Toast.LENGTH_SHORT).show()
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
            .show()
    }

    private fun showGroupInfoDialog() {
        communityViewModel.groups.value?.find { it.groupId == groupId }?.let { group ->
            val membersText = StringBuilder("Group: ${group.name}\n\n")
            membersText.append("Description: ${group.description}\n")
            membersText.append("Total Members: ${group.membersCount}\n\n")
            membersText.append("Members List:\n")
            group.members.values.forEach { m ->
                val contact = if (m.phone.isNotBlank()) m.phone else m.email
                membersText.append("• ${m.name} ($contact) [${m.role}]\n")
            }

            AlertDialog.Builder(this)
                .setTitle("Group Info / గ్రూప్ సమాచారం")
                .setMessage(membersText.toString())
                .setPositiveButton("OK") { d, _ -> d.dismiss() }
                .show()
        }
    }

    class GroupChatAdapter(private val currentUid: String) :
        RecyclerView.Adapter<GroupChatAdapter.ChatViewHolder>() {

        private val items = mutableListOf<GroupChatMessage>()
        private val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())

        fun submitList(newItems: List<GroupChatMessage>) {
            items.clear()
            items.addAll(newItems)
            notifyDataSetChanged()
        }

        inner class ChatViewHolder(val binding: ItemGroupChatMessageBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatViewHolder {
            val binding = ItemGroupChatMessageBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return ChatViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ChatViewHolder, position: Int) {
            val msg = items[position]
            val timeStr = timeFormat.format(Date(msg.timestamp))

            when {
                msg.messageType == "SYSTEM_EVENT" -> {
                    holder.binding.layoutSystemEvent.visibility = View.VISIBLE
                    holder.binding.layoutIncoming.visibility = View.GONE
                    holder.binding.layoutOutgoing.visibility = View.GONE
                    holder.binding.tvSystemMessage.text = msg.messageText
                }
                msg.senderId == currentUid -> {
                    // Outgoing message (Right)
                    holder.binding.layoutSystemEvent.visibility = View.GONE
                    holder.binding.layoutIncoming.visibility = View.GONE
                    holder.binding.layoutOutgoing.visibility = View.VISIBLE
                    holder.binding.tvOutgoingText.text = msg.messageText
                    holder.binding.tvOutgoingTime.text = timeStr
                }
                else -> {
                    // Incoming message (Left)
                    holder.binding.layoutSystemEvent.visibility = View.GONE
                    holder.binding.layoutIncoming.visibility = View.VISIBLE
                    holder.binding.layoutOutgoing.visibility = View.GONE
                    val senderDisplay = if (msg.senderPhone.isNotBlank()) "${msg.senderName} (${msg.senderPhone})" else msg.senderName
                    holder.binding.tvIncomingSender.text = senderDisplay
                    holder.binding.tvIncomingText.text = msg.messageText
                    holder.binding.tvIncomingTime.text = timeStr
                }
            }
        }

        override fun getItemCount(): Int = items.size
    }
}
