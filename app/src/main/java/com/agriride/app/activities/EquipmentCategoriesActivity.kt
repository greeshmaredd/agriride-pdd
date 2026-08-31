package com.agriride.app.activities

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.databinding.ActivityEquipmentCategoriesBinding
import com.agriride.app.databinding.ItemEquipmentBinding
import com.agriride.app.viewmodels.EquipmentViewModel

class EquipmentCategoriesActivity : BaseActivity() {

    private lateinit var binding: ActivityEquipmentCategoriesBinding
    private val viewModel: EquipmentViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEquipmentCategoriesBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnCatBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        binding.btnCatSearch.setOnClickListener {
            startActivity(Intent(this, EquipmentSearchActivity::class.java))
        }

        binding.cardCatTractor.setOnClickListener { openCategorySearch("Tractor") }
        binding.cardCatPlough.setOnClickListener { openCategorySearch("Plough") }
        binding.cardCatSprayer.setOnClickListener { openCategorySearch("Sprayer") }
        binding.cardCatHarvester.setOnClickListener { openCategorySearch("Harvester") }

        val categories = viewModel.getCategories().filter {
            !it.equals("Tractor", ignoreCase = true) &&
                    !it.equals("Plough", ignoreCase = true) &&
                    !it.equals("Sprayer", ignoreCase = true) &&
                    !it.equals("Harvester", ignoreCase = true)
        }

        binding.rvCategories.layoutManager = GridLayoutManager(this, 2)
        binding.rvCategories.adapter = CategoryAdapter(categories) { category ->
            openCategorySearch(category)
        }
    }

    private fun openCategorySearch(category: String) {
        val intent = Intent(this, EquipmentSearchActivity::class.java)
        intent.putExtra("CATEGORY_NAME", category)
        startActivity(intent)
    }

    class CategoryAdapter(
        private val categories: List<String>,
        private val onCategoryClick: (String) -> Unit
    ) : RecyclerView.Adapter<CategoryAdapter.CategoryViewHolder>() {

        inner class CategoryViewHolder(val binding: ItemEquipmentBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CategoryViewHolder {
            val binding = ItemEquipmentBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return CategoryViewHolder(binding)
        }

        override fun onBindViewHolder(holder: CategoryViewHolder, position: Int) {
            val cat = categories[position]
            val icon = when {
                cat.contains("Seeder", ignoreCase = true) -> "🌱"
                cat.contains("Cultivator", ignoreCase = true) -> "🌿"
                cat.contains("Cutter", ignoreCase = true) -> "✂️"
                else -> "🚜"
            }
            holder.binding.tvItemName.text = "$icon $cat"
            holder.binding.tvItemOwner.text = "Tap to view available $cat machines"
            holder.binding.tvItemPrice.text = "Browse"
            holder.binding.tvItemRating.text = "⭐ 4.8"
            holder.itemView.setOnClickListener { onCategoryClick(cat) }
        }

        override fun getItemCount(): Int = categories.size
    }
}
