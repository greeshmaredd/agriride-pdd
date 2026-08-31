package com.agriride.app.fragments

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.agriride.app.R
import com.agriride.app.activities.CartActivity
import com.agriride.app.databinding.FragmentAgriculturalStoreBinding
import com.agriride.app.databinding.ItemStoreProductBinding
import com.agriride.app.models.Product
import com.agriride.app.viewmodels.StoreViewModel

class AgriculturalStoreFragment : Fragment() {

    private var _binding: FragmentAgriculturalStoreBinding? = null
    private val binding get() = _binding!!
    private val storeViewModel: StoreViewModel by viewModels()

    private var currentCategory = "All"
    private var allProductList = listOf<Product>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAgriculturalStoreBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnStoreBack.setOnClickListener {
            requireActivity().onBackPressedDispatcher.onBackPressed()
        }

        binding.rvStoreProducts.layoutManager = GridLayoutManager(requireContext(), 2)
        allProductList = storeViewModel.getProducts()

        loadFilteredProducts("All")

        binding.chipAllProducts.setOnClickListener { filterCategory("All", it as TextView) }
        binding.chipSeeds.setOnClickListener { filterCategory("Seeds", it as TextView) }
        binding.chipFertilizers.setOnClickListener { filterCategory("Fertilizers", it as TextView) }
        binding.chipTools.setOnClickListener { filterCategory("Tools", it as TextView) }

        storeViewModel.cart.observe(viewLifecycleOwner) { cart ->
            val totalItems = cart.items.sumOf { it.quantity }
            binding.tvStoreCartBadge.text = if (totalItems > 0) "$totalItems" else "2"
        }

        binding.frameStoreCart.setOnClickListener {
            startActivity(Intent(requireContext(), CartActivity::class.java))
        }
    }

    private fun filterCategory(cat: String, selectedView: TextView) {
        currentCategory = cat
        val green = ContextCompat.getColor(requireContext(), R.color.primary_green)

        val chips = listOf(binding.chipAllProducts, binding.chipSeeds, binding.chipFertilizers, binding.chipTools)
        chips.forEach { chip ->
            chip.backgroundTintList = android.content.res.ColorStateList.valueOf(Color.parseColor("#F0F4F1"))
            chip.setTextColor(Color.parseColor("#4A5568"))
        }

        selectedView.backgroundTintList = android.content.res.ColorStateList.valueOf(green)
        selectedView.setTextColor(Color.WHITE)

        loadFilteredProducts(cat)
    }

    private fun loadFilteredProducts(category: String) {
        val filtered = if (category == "All") allProductList else allProductList.filter { it.category.equals(category, ignoreCase = true) }
        binding.rvStoreProducts.adapter = ProductGridAdapter(filtered) { product ->
            storeViewModel.addToCart(product)
            Toast.makeText(requireContext(), "Added ${product.name} to Cart!", Toast.LENGTH_SHORT).show()
        }
    }

    class ProductGridAdapter(
        private val products: List<Product>,
        private val onAddToCartClick: (Product) -> Unit
    ) : RecyclerView.Adapter<ProductGridAdapter.ProductGridViewHolder>() {

        inner class ProductGridViewHolder(val binding: ItemStoreProductBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductGridViewHolder {
            val binding = ItemStoreProductBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            )
            return ProductGridViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ProductGridViewHolder, position: Int) {
            val p = products[position]
            holder.binding.tvProductName.text = p.name
            holder.binding.tvProductRating.text = "⭐ ${p.rating} (${p.reviews} reviews)"
            holder.binding.tvProductPrice.text = "₹${p.price.toInt()}"

            when {
                p.category.equals("Seeds", ignoreCase = true) -> {
                    holder.binding.tvProductIcon.text = "🌱"
                    holder.binding.frameProductImage.backgroundTintList = android.content.res.ColorStateList.valueOf(Color.parseColor("#EBF5ED"))
                }
                p.category.equals("Fertilizers", ignoreCase = true) -> {
                    holder.binding.tvProductIcon.text = "⚗️"
                    holder.binding.frameProductImage.backgroundTintList = android.content.res.ColorStateList.valueOf(Color.parseColor("#FFF8E1"))
                }
                else -> {
                    holder.binding.tvProductIcon.text = "🧰"
                    holder.binding.frameProductImage.backgroundTintList = android.content.res.ColorStateList.valueOf(Color.parseColor("#E3F2FD"))
                }
            }

            holder.binding.btnAddToCart.setOnClickListener {
                onAddToCartClick(p)
            }
        }

        override fun getItemCount(): Int = products.size
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
