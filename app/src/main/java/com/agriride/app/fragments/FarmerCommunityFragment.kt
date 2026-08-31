package com.agriride.app.fragments

import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.activities.CommunityGroupChatActivity
import com.agriride.app.databinding.FragmentFarmerCommunityBinding
import com.agriride.app.databinding.ItemCommunityGroupBinding
import com.agriride.app.databinding.ItemCommunityPostBinding
import com.agriride.app.models.CommunityGroup
import com.agriride.app.models.CommunityPost
import com.agriride.app.viewmodels.CommunityViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class FarmerCommunityFragment : Fragment() {

    private var _binding: FragmentFarmerCommunityBinding? = null
    private val binding get() = _binding!!
    private val communityViewModel: CommunityViewModel by viewModels()

    private lateinit var groupAdapter: GroupAdapter

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFarmerCommunityBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnCommBack.setOnClickListener {
            requireActivity().onBackPressedDispatcher.onBackPressed()
        }

        setupGroupsList()
        setupPostsFeed()
    }

    private fun setupGroupsList() {
        groupAdapter = GroupAdapter { group ->
            val intent = Intent(requireContext(), CommunityGroupChatActivity::class.java).apply {
                putExtra("GROUP_ID", group.groupId)
                putExtra("GROUP_NAME", group.name)
                putExtra("GROUP_AVATAR", if (group.name.startsWith("🌾") || group.name.startsWith("🚜") || group.name.startsWith("🌱")) group.name.take(2) else "👥")
            }
            startActivity(intent)
        }

        binding.rvCommunityGroups.layoutManager = LinearLayoutManager(requireContext())
        binding.rvCommunityGroups.adapter = groupAdapter

        communityViewModel.groups.observe(viewLifecycleOwner) { groups ->
            groupAdapter.submitList(groups)
        }

        binding.btnCreateNewGroup.setOnClickListener {
            showCreateGroupDialog()
        }
    }

    private fun showCreateGroupDialog() {
        val layout = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 24)
        }

        val etGroupName = EditText(requireContext()).apply {
            hint = "Group Name (e.g. 🌾 Guntur Chilli Cultivators)"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_FLAG_CAP_WORDS
        }

        val etGroupDesc = EditText(requireContext()).apply {
            hint = "Description / Farming Purpose"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
        }

        layout.addView(etGroupName)
        layout.addView(etGroupDesc)

        AlertDialog.Builder(requireContext())
            .setTitle("Create Farmer Chat Group / కొత్త గ్రూప్")
            .setMessage("Create a WhatsApp-style discussion group for local farmers & machinery sharing:")
            .setView(layout)
            .setPositiveButton("Create Group") { dialog, _ ->
                val name = etGroupName.text.toString().trim()
                val desc = etGroupDesc.text.toString().trim()
                if (name.isNotEmpty()) {
                    communityViewModel.createGroup(name, desc) { success, newGroupId ->
                        if (success) {
                            Toast.makeText(requireContext(), "Group created successfully!", Toast.LENGTH_SHORT).show()
                            val intent = Intent(requireContext(), CommunityGroupChatActivity::class.java).apply {
                                putExtra("GROUP_ID", newGroupId)
                                putExtra("GROUP_NAME", name)
                                putExtra("GROUP_AVATAR", if (name.startsWith("🌾") || name.startsWith("🚜")) name.take(2) else "👥")
                            }
                            startActivity(intent)
                        } else {
                            Toast.makeText(requireContext(), "Failed to create group", Toast.LENGTH_SHORT).show()
                        }
                    }
                } else {
                    Toast.makeText(requireContext(), "Please enter a group name", Toast.LENGTH_SHORT).show()
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }
            .show()
    }

    private fun setupPostsFeed() {
        binding.rvCommunityPosts.layoutManager = LinearLayoutManager(requireContext())

        communityViewModel.posts.observe(viewLifecycleOwner) { posts ->
            binding.rvCommunityPosts.adapter = CommunityAdapter(posts) { post ->
                communityViewModel.toggleLike(post.postId)
            }
        }

        binding.btnSubmitPost.setOnClickListener {
            val text = binding.etCreatePostPrompt.text.toString().trim()
            if (text.isNotEmpty()) {
                communityViewModel.addPost(text)
                binding.etCreatePostPrompt.text.clear()
                Toast.makeText(requireContext(), "Your question has been posted to Agri Community!", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(requireContext(), "Please type a farming question first", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnCommAddPost.setOnClickListener {
            showCreateGroupDialog()
        }
    }

    class GroupAdapter(
        private val onGroupClick: (CommunityGroup) -> Unit
    ) : RecyclerView.Adapter<GroupAdapter.GroupViewHolder>() {

        private val items = mutableListOf<CommunityGroup>()
        private val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())

        fun submitList(newItems: List<CommunityGroup>) {
            items.clear()
            items.addAll(newItems)
            notifyDataSetChanged()
        }

        inner class GroupViewHolder(val binding: ItemCommunityGroupBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GroupViewHolder {
            val binding = ItemCommunityGroupBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return GroupViewHolder(binding)
        }

        override fun onBindViewHolder(holder: GroupViewHolder, position: Int) {
            val g = items[position]
            holder.binding.tvGroupName.text = g.name
            holder.binding.tvGroupAvatar.text = if (g.name.startsWith("🌾") || g.name.startsWith("🚜") || g.name.startsWith("🌱")) g.name.take(2) else "👥"
            holder.binding.tvGroupTime.text = if (g.lastMessageTime > 0) timeFormat.format(Date(g.lastMessageTime)) else "Today"

            val lastMsgDisplay = if (g.lastMessageSender.isNotBlank()) "${g.lastMessageSender}: ${g.lastMessage}" else g.lastMessage
            holder.binding.tvGroupLastMessage.text = if (lastMsgDisplay.isNotBlank()) lastMsgDisplay else g.description
            holder.binding.chipGroupMembersCount.text = "👥 ${g.membersCount} members"

            holder.binding.cardGroupItem.setOnClickListener {
                onGroupClick(g)
            }
        }

        override fun getItemCount(): Int = items.size
    }

    class CommunityAdapter(
        private val posts: List<CommunityPost>,
        private val onLikeClick: (CommunityPost) -> Unit
    ) : RecyclerView.Adapter<CommunityAdapter.PostViewHolder>() {

        inner class PostViewHolder(val binding: ItemCommunityPostBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PostViewHolder {
            val binding = ItemCommunityPostBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return PostViewHolder(binding)
        }

        override fun onBindViewHolder(holder: PostViewHolder, position: Int) {
            val p = posts[position]
            holder.binding.tvPostAuthor.text = p.authorName.ifEmpty { "Kalyan Ram" }
            holder.binding.tvPostAvatar.text = if (p.authorName.length >= 2) p.authorName.substring(0, 2).uppercase() else "KR"
            holder.binding.tvPostTimeLoc.text = "${p.location.ifEmpty { "Guntur" }} • 2 hours ago"
            holder.binding.tvPostQuestion.text = p.question
            holder.binding.tvPostAnswer.text = p.answer.ifEmpty { "Apply Virtako 100g/acre diluted in 200L water." }

            val likeIcon = if (p.isLiked) "❤️" else "♡"
            holder.binding.tvPostLikes.text = "$likeIcon ${if (p.likesCount > 0) p.likesCount else 24} Likes"
            holder.binding.tvPostComments.text = "💬 8 Comments"
            holder.binding.tvPostShare.text = "🔗 Share"

            holder.binding.tvPostLikes.setOnClickListener {
                onLikeClick(p)
            }
        }

        override fun getItemCount(): Int = posts.size
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
