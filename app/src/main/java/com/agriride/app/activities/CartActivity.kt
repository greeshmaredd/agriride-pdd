package com.agriride.app.activities

import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.agriride.app.databinding.ActivityCartBinding
import com.agriride.app.viewmodels.StoreViewModel

class CartActivity : BaseActivity() {

    private lateinit var binding: ActivityCartBinding
    private val viewModel: StoreViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCartBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel.cart.observe(this) { cart ->
            if (cart.items.isEmpty()) {
                binding.tvCartItemNames.text = "Your Cart is Empty"
                binding.tvCartItemBreakdown.text = "Add items from the store"
                binding.tvSubtotal.text = "₹0"
                binding.tvDeliveryFee.text = "₹0"
                binding.tvCartTotal.text = "₹0"
                binding.btnCheckoutCart.isEnabled = false
            } else {
                val itemSummary = cart.items.joinToString(" + ") { "${it.product.name} (${it.quantity}x)" }
                binding.tvCartItemNames.text = itemSummary
                binding.tvCartItemBreakdown.text = "Items: ${cart.items.size} Products (${cart.items.sumOf { it.quantity }} Total Units)"
                binding.tvSubtotal.text = "₹${cart.getSubtotal().toInt()}"
                binding.tvDeliveryFee.text = "₹${cart.deliveryFee.toInt()}"
                binding.tvCartTotal.text = "₹${cart.getTotal().toInt()}"
                binding.btnCheckoutCart.isEnabled = true
            }
        }

        binding.btnCheckoutCart.setOnClickListener {
            viewModel.clearCart()
            Toast.makeText(this, "Order placed successfully! Delivery within 24 hours.", Toast.LENGTH_LONG).show()
            finish()
        }
    }
}
