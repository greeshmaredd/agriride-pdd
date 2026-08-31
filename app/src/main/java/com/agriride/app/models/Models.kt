package com.agriride.app.models

import com.google.firebase.database.IgnoreExtraProperties
import com.google.firebase.database.PropertyName

enum class BookingStatus {
    PENDING,
    CONFIRMED,
    REJECTED,
    ON_THE_WAY,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

data class User(
    val uid: String = "",
    val id: String = "",
    val name: String = "",
    val mobileNumber: String = "",
    val phone: String = "",
    val email: String = "",
    val role: String = "Farmer", // Farmer, OWNER (or Equipment Owner), Worker, Admin
    val location: String = "",
    val profileImage: String = "",
    val language: String = "English",
    val isVerified: Boolean = true,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val villageName: String = "",
    val district: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class Farmer(
    val id: String = "",
    val userId: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val location: String = "",
    val farmLocation: String = "",
    val profileImage: String = "",
    val preferredLanguage: String = "Telugu",
    val acresOwned: Double = 0.0,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val villageName: String = "",
    val district: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

data class EquipmentOwner(
    val uid: String = "",
    val id: String = "",
    val userId: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val location: String = "",
    val address: String = "",
    val profileImage: String = "",
    val verificationStatus: String = "VERIFIED",
    val totalEarnings: Double = 0.0,
    val totalEquipment: Int = 0,
    val monthlyEarnings: Double = 0.0,
    val rating: Double = 5.0,
    val createdAt: Long = System.currentTimeMillis()
)

data class Worker(
    val id: String = "",
    val workerId: String = "",
    val userId: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val ownerId: String = "",
    val skill: String = "Tractor Operator",
    val role: String = "Tractor Operator",
    val availability: String = "AVAILABLE", // AVAILABLE, UNAVAILABLE
    val profileImage: String = "",
    val status: String = "On Duty",
    val checkInTime: String = "",
    val assignedJobsCount: Int = 0,
    val totalEarnings: Double = 0.0,
    val pendingPayout: Double = 0.0,
    val dailyWage: Double = 600.0,
    val completedJobsCount: Int = 0,
    val villageName: String = "",
    val rating: Float = 5.0f,
    val ratingCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis()
)

data class AdminStats(
    val totalFarmers: Int = 0,
    val totalOwners: Int = 0,
    val totalWorkers: Int = 0,
    val totalEquipment: Int = 0,
    val activeBookings: Int = 0,
    val completedBookings: Int = 0,
    val totalRevenue: Double = 0.0,
    val pendingDocuments: Int = 0
)

@IgnoreExtraProperties
data class Equipment(
    val id: String = "",
    val equipmentId: String = "",
    val ownerId: String = "",
    val ownerName: String = "",
    val ownerPhone: String = "",
    val name: String = "",
    val category: String = "Tractor", // TRACTOR, PLOUGH, FERTILIZER_SPRAYER, HARVESTER, CROP_CUTTING_MACHINE, OTHER
    val type: String = "TRACTOR",
    val vehicleNumber: String = "",
    val pricePerAcre: Double = 0.0,
    val location: String = "",
    val villageName: String = "",
    val district: String = "",
    val distanceKm: Double = 0.0,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val imageUrl: String = "",
    val imageUrls: List<String> = emptyList(),
    val rating: Double = 5.0,
    val reviewCount: Int = 0,
    val available: Boolean = true,
    @get:JvmName("getIsAvailableProperty") @get:PropertyName("isAvailableFlag") val isAvailable: Boolean = true,
    val availability: String = "AVAILABLE", // AVAILABLE, UNAVAILABLE, MAINTENANCE
    val hpRating: Int = 50,
    val description: String = "",
    val verificationStatus: String = "VERIFIED",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class EquipmentDocument(
    val docId: String = "",
    val equipmentId: String = "",
    val ownerId: String = "",
    val documentType: String = "Registration Certificate (RC)",
    val name: String = "Registration Certificate (RC)",
    val documentUrl: String = "",
    val fileUrl: String = "",
    val status: String = "Verified", // Verified, Pending, Rejected
    val verificationStatus: String = "Verified",
    val uploadedAt: Long = System.currentTimeMillis(),
    val verifiedAt: Long = System.currentTimeMillis(),
    val verifiedBy: String = "ADMIN"
)

data class Booking(
    val bookingId: String = "",
    val id: String = "",
    val farmerId: String = "",
    val farmerName: String = "",
    val farmerPhone: String = "",
    val ownerId: String = "",
    val ownerName: String = "",
    val ownerPhone: String = "",
    val equipmentId: String = "",
    val equipmentName: String = "",
    val workerId: String = "",
    val workerName: String = "",
    val workerStatus: String = "", // UNASSIGNED, ASSIGNED
    val workerAssignedAt: Long = 0L,
    val assignedBy: String = "",
    val activity: String = "Ploughing",
    val location: String = "",
    val farmLocation: String = "",
    val farmVillage: String = "",
    val farmDistrict: String = "",
    val villageName: String = "",
    val district: String = "",
    val distanceKm: Double = 0.0,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val date: String = "",
    val startTime: String = "7:00 AM",
    val endTime: String = "10:00 AM",
    val timeSlot: String = "7:00 AM – 10:00 AM",
    val acres: Double = 1.0,
    val ratePerAcre: Double = 0.0,
    val pricePerAcre: Double = 0.0,
    val equipmentCost: Double = 0.0,
    val serviceFee: Double = 150.0,
    val totalAmount: Double = 0.0,
    val amount: Double = 0.0,
    var status: BookingStatus = BookingStatus.PENDING,
    var bookingStatus: String = "PENDING", // PENDING, CONFIRMED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED
    val paymentMethod: String = "CASH", // CASH / PAY AFTER SERVICE
    val paymentStatus: String = "CASH_PENDING", // CASH_PENDING, PAID
    val weatherStatus: String = "SUITABLE", // SUITABLE, CAUTION, NOT RECOMMENDED
    val weatherSummary: String = "Suitable weather for agricultural operations.",
    val driverName: String = "",
    val driverPhone: String = "",
    val rejectionReason: String = "",
    val confirmedAt: Long = 0L,
    val confirmedBy: String = "",
    val rejectedAt: Long = 0L,
    val rejectedBy: String = "",
    val startedAt: Long = 0L,
    val startedBy: String = "",
    val completedAt: Long = 0L,
    val completedBy: String = "",
    val paidAt: Long = 0L,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class Payment(
    val paymentId: String = "",
    val id: String = "",
    val bookingId: String = "",
    val farmerId: String = "",
    val ownerId: String = "",
    val amount: Double = 0.0,
    val paymentMethod: String = "CASH",
    val transactionId: String = "",
    val paymentStatus: String = "CASH_PENDING", // CASH_PENDING, PAID
    val status: String = "CASH_PENDING",
    val timestamp: Long = System.currentTimeMillis(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class Weather(
    val location: String = "Vijayawada",
    val temperatureC: Int = 28,
    val condition: String = "Partly Cloudy",
    val rainProbabilityPercent: Int = 20,
    val humidityPercent: Int = 72,
    val windSpeedKmH: Int = 14,
    val sunrise: String = "06:05 AM",
    val sunset: String = "06:38 PM",
    val isPloughingSuitable: Boolean = true,
    val isSprayingSuitable: Boolean = false,
    val isHarvestingSuitable: Boolean = true,
    val updatedAt: Long = System.currentTimeMillis()
)

data class TimeSlotRecommendation(
    val timeSlot: String,
    val isAvailable: Boolean,
    val weatherCondition: String,
    val rainProbability: Int,
    val recommendationLabel: String,
    val isBestTime: Boolean = false,
    val reason: String = "",
    val suitabilityStatus: String = "SUITABLE"
)

data class WorkerAttendance(
    val attendanceId: String = "ATT901",
    val workerId: String = "WRK301",
    val bookingId: String = "AR20260825001",
    val date: String = "28 Aug 2026",
    val checkInTime: String = "06:45 AM",
    val checkOutTime: String = "",
    val status: String = "PRESENT",
    var isPresent: Boolean = true,
    val gpsLocation: String = "Vijayawada Mandal",
    val createdAt: Long = System.currentTimeMillis()
)

data class Task(
    val taskId: String = "TSK901",
    val title: String = "Deep Ploughing Operation",
    val farmerName: String = "Ravi Kumar",
    val location: String = "Vijayawada Rural (Kanchikacherla)",
    val timeSlot: String = "7:00 AM – 10:00 AM",
    val acres: Int = 4,
    var isCompleted: Boolean = false
)

data class CommunityPost(
    val postId: String = "POST101",
    val id: String = "POST101",
    val userId: String = "USR101",
    val authorName: String = "Kalyan Ram",
    val userName: String = "Kalyan Ram",
    val userProfileImage: String = "",
    val location: String = "Guntur",
    val timestamp: String = "2 hours ago",
    val question: String = "Which pesticide is best for leaf folder control in Kharif paddy?",
    val content: String = "Which pesticide is best for leaf folder control in Kharif paddy?",
    val answer: String = "Apply Virtako 100g/acre diluted in 200L water.",
    val imageUrl: String = "",
    var likesCount: Int = 24,
    val commentsCount: Int = 8,
    var isLiked: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

data class Product(
    val id: String = "PRD101",
    val name: String = "Paddy Seeds BPT 5204 (10kg Bag)",
    val category: String = "Seeds",
    val description: String = "High quality certified paddy seeds.",
    val price: Double = 850.0,
    val rating: Double = 4.8,
    val reviews: Int = 120,
    val imageUrl: String = "",
    val stock: Int = 50,
    val isAvailable: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)

data class CartItem(
    val product: Product = Product(),
    var quantity: Int = 1
)

data class Cart(
    val items: MutableList<CartItem> = mutableListOf(
        CartItem(Product(id = "PRD101", name = "Paddy Seeds BPT 5204 (10kg Bag)", price = 850.0), quantity = 2),
        CartItem(Product(id = "PRD102", name = "Neem Coated Urea Bag (45kg)", price = 267.0), quantity = 1)
    ),
    val deliveryFee: Double = 50.0
) {
    fun getSubtotal(): Double = items.sumOf { it.product.price * it.quantity }
    fun getTotal(): Double = getSubtotal() + if (items.isNotEmpty()) deliveryFee else 0.0
}

data class Order(
    val id: String = "ORD1001",
    val userId: String = "USR101",
    val items: List<CartItem> = emptyList(),
    val subtotal: Double = 0.0,
    val deliveryFee: Double = 50.0,
    val total: Double = 0.0,
    val paymentMethod: String = "CASH",
    val paymentStatus: String = "CASH_ON_DELIVERY",
    val orderStatus: String = "PLACED",
    val deliveryAddress: String = "Vijayawada, Andhra Pradesh",
    val createdAt: Long = System.currentTimeMillis()
)

data class Notification(
    val notificationId: String = "NOTIF101",
    val userId: String = "USR101",
    val title: String = "Booking Confirmed",
    val message: String = "Your booking for Mahindra 575 DI Tractor has been confirmed.",
    val type: String = "BOOKING_CONFIRMED",
    val bookingId: String = "",
    val equipmentId: String = "",
    val isRead: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)



data class PaymentRecord(
    val paymentId: String = "PAY1001",
    val bookingId: String = "AR20260825001",
    val farmerId: String = "USR101",
    val ownerId: String = "OWN201",
    val amount: Double = 0.0,
    val currency: String = "INR",
    val paymentMethod: String = "CASH",
    val status: String = "PENDING", // PENDING, PAID, CANCELLED
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class FarmSoilProfile(
    val userId: String = "USR101",
    val soilType: String = "Alluvial Delta",
    val ph: Double = 6.8,
    val nitrogen: Double = 140.0,
    val phosphorus: Double = 35.0,
    val potassium: Double = 180.0,
    val moisture: Double = 45.0,
    val temperature: Double = 28.5,
    val humidity: Double = 65.0,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val season: String = "Kharif",
    val updatedAt: Long = System.currentTimeMillis()
)

data class CropRecommendation(
    val recommendationId: String = "REC1001",
    val userId: String = "USR101",
    val cropName: String = "Paddy (BPT 5204)",
    val teluguName: String = "వరి (సోనా మసూరి)",
    val suitabilityScore: Int = 92,
    val reason: String = "Ideal alluvial soil pH and high nitrogen level.",
    val fertilizerGuidance: String = "Nitrogen Status: MEDIUM. Apply Neem Coated Urea 45kg/acre in split doses.",
    val waterRequirement: String = "High (1200mm - 1400mm)",
    val idealPhRange: String = "6.0 - 7.5",
    val weatherStatus: String = "SUITABLE",
    val expectedYield: String = "30 - 35 Bags / Acre",
    val estimatedProfit: String = "₹42,000 - ₹55,000 / Acre",
    val durationDays: String = "135 - 145 Days",
    val recommendedMachinery: String = "50HP Tractor, Rotavator, Transplanter, Spray Drone, Combine Harvester",
    val pestAdvisory: String = "Monitor for Stem Borer. Spray Cartap Hydrochloride 50 SP if infestation occurs.",
    val createdAt: Long = System.currentTimeMillis()
)

data class CropRegion(
    val id: String = "CRG101",
    val cropName: String = "Paddy (Rice)",
    val region: String = "Krishna Delta Belt",
    val state: String = "Andhra Pradesh",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val soilType: String = "Alluvial Delta",
    val season: String = "Kharif",
    val waterRequirement: String = "High (1200mm - 1400mm)",
    val description: String = "Major paddy production region with canal irrigation network.",
    val dataSource: String = "Reference data",
    val updatedAt: Long = System.currentTimeMillis()
)

data class DamInfo(
    val damId: String = "DAM101",
    val damName: String = "Prakasam Barrage",
    val state: String = "Andhra Pradesh",
    val district: String = "NTR Krishna",
    val latitude: Double = 16.5067,
    val longitude: Double = 80.6053,
    val reservoirCapacityTmc: Double = 3.07,
    val currentWaterLevelFt: Double = 57.0,
    val waterLevelPercentage: Double = 85.0,
    val status: String = "NORMAL",
    val lastUpdated: String = "2026-08-25 18:00 IST",
    val dataSource: String = "CWC Reference Data",
    val updatedAt: Long = System.currentTimeMillis()
)

sealed class Resource<out T> {
    data class Success<out T>(val data: T) : Resource<T>()
    data class Error(val message: String, val cause: Throwable? = null) : Resource<Nothing>()
    object Loading : Resource<Nothing>()
    object Empty : Resource<Nothing>()
}

data class GroupMember(
    val userId: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val role: String = "MEMBER",
    val joinedAt: Long = System.currentTimeMillis()
)

data class CommunityGroup(
    val groupId: String = "",
    val name: String = "",
    val description: String = "",
    val createdBy: String = "",
    val createdByName: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val membersCount: Int = 1,
    val members: Map<String, GroupMember> = emptyMap(),
    val lastMessage: String = "",
    val lastMessageSender: String = "",
    val lastMessageTime: Long = System.currentTimeMillis(),
    val avatarColorHex: String = "#1B5E20"
)

data class GroupChatMessage(
    val messageId: String = "",
    val groupId: String = "",
    val senderId: String = "",
    val senderName: String = "",
    val senderPhone: String = "",
    val messageText: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val messageType: String = "TEXT" // TEXT or SYSTEM_EVENT
)
