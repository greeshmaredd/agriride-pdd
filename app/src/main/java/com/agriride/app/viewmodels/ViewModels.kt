package com.agriride.app.viewmodels

import android.app.Activity
import android.net.Uri
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.agriride.app.models.*
import com.agriride.app.repositories.*
import com.agriride.app.services.*
import com.google.firebase.auth.PhoneAuthProvider

class AuthViewModel : ViewModel() {
    private val authRepo = AuthRepository()

    fun getCurrentUserId(): String? = authRepo.getCurrentUserId()

    fun login(email: String, pass: String): LiveData<Resource<User>> {
        return authRepo.login(email, pass)
    }

    fun firebaseAuthWithGoogle(idToken: String): LiveData<Resource<User>> {
        return authRepo.firebaseAuthWithGoogle(idToken)
    }

    fun sendPhoneOtp(phoneNumber: String, activity: Activity, callbacks: PhoneAuthProvider.OnVerificationStateChangedCallbacks) {
        authRepo.sendPhoneOtp(phoneNumber, activity, callbacks)
    }

    fun verifyPhoneOtp(verificationId: String, code: String, userProfile: User? = null): LiveData<Resource<User>> {
        return authRepo.verifyPhoneOtp(verificationId, code, userProfile)
    }

    fun loginWithMobile(mobile: String, pass: String): LiveData<Boolean> {
        val result = MutableLiveData<Boolean>()
        val email = if (mobile.contains("@")) mobile else "$mobile@agriride.in"
        authRepo.login(email, pass).observeForever { res ->
            result.value = res is Resource.Success
        }
        return result
    }

    fun register(user: User, pass: String = "AgriRide123"): LiveData<Resource<User>> {
        return authRepo.register(user, pass)
    }

    fun registerSimple(user: User): LiveData<Boolean> {
        val result = MutableLiveData<Boolean>()
        authRepo.register(user, "AgriRide123").observeForever { res ->
            result.value = res is Resource.Success
        }
        return result
    }

    fun verifyOtp(otp: String): LiveData<Boolean> {
        val result = MutableLiveData<Boolean>()
        result.value = true
        return result
    }

    fun uploadProfileImage(userId: String, uri: Uri, onProgress: (Int) -> Unit = {}, onResult: (Resource<String>) -> Unit) {
        StorageRepository.uploadProfileImage(userId, uri, onProgress, onResult)
    }

    fun updateUserProfile(userId: String, name: String, phone: String, location: String, onComplete: (Boolean) -> Unit = {}) {
        authRepo.updateUserProfile(userId, name, phone, location, onComplete)
    }

    fun updateUserLocation(userId: String, lat: Double, lng: Double, locationString: String, villageName: String = "", onComplete: (Boolean) -> Unit = {}) {
        authRepo.updateUserLocation(userId, lat, lng, locationString, villageName, onComplete)
    }

    fun sendVerificationEmail(): LiveData<Resource<Boolean>> {
        return authRepo.sendVerificationEmail()
    }

    fun checkEmailVerification(): Boolean {
        return authRepo.checkEmailVerification()
    }

    fun isUserLoggedIn(): Boolean = !authRepo.getCurrentUserId().isNullOrEmpty()

    fun fetchCurrentUserProfile(onResult: (User?) -> Unit) {
        authRepo.fetchCurrentUserProfile(onResult)
    }

    fun sendPasswordReset(email: String): LiveData<Resource<Boolean>> {
        return authRepo.sendPasswordResetEmail(email)
    }

    fun logout() {
        authRepo.logout()
    }
}

class EquipmentViewModel : ViewModel() {
    private val authRepo = AuthRepository()
    val equipmentList: LiveData<List<Equipment>> = EquipmentRepository.getEquipmentList()

    fun getCategories(): List<String> = EquipmentRepository.getCategories()

    fun getEquipmentById(id: String): Equipment? = EquipmentRepository.getEquipmentById(id)

    fun getOwnerEquipmentList(): LiveData<List<Equipment>> {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        return EquipmentRepository.getOwnerEquipmentList(ownerUid)
    }

    fun addEquipment(equipment: Equipment, onComplete: (Boolean) -> Unit = {}) = EquipmentRepository.addEquipment(equipment, onComplete)

    fun updateEquipmentAvailability(equipmentId: String, availability: String, onComplete: (Boolean) -> Unit = {}) {
        EquipmentRepository.updateEquipmentAvailability(equipmentId, availability, onComplete)
    }

    fun deleteEquipment(equipmentId: String, onComplete: (Boolean) -> Unit = {}) {
        EquipmentRepository.deleteEquipment(equipmentId, onComplete)
    }

    fun filterEquipment(
        query: String = "",
        category: String? = null,
        maxPrice: Double? = null,
        minRating: Double? = null,
        farmerLat: Double = 0.0,
        farmerLng: Double = 0.0,
        maxDistanceKm: Double? = null
    ): List<Equipment> {
        return EquipmentRepository.filterEquipment(query, category, maxPrice, minRating, farmerLat, farmerLng, maxDistanceKm)
    }

    fun uploadEquipmentImage(equipmentId: String, uri: Uri, onProgress: (Int) -> Unit = {}, onResult: (Resource<String>) -> Unit) {
        StorageRepository.uploadEquipmentImage(equipmentId, uri, onProgress, onResult)
    }

    fun uploadEquipmentDocument(
        ownerId: String,
        equipmentId: String,
        documentType: String,
        uri: Uri,
        onProgress: (Int) -> Unit = {},
        onResult: (Resource<EquipmentDocument>) -> Unit
    ) {
        StorageRepository.uploadEquipmentDocument(ownerId, equipmentId, documentType, uri, onProgress, onResult)
    }
}

class BookingViewModel : ViewModel() {
    private val authRepo = AuthRepository()
    private val schedulingEngine = SmartSchedulingEngine()

    companion object {
        var activeDraftBooking: Booking = Booking()
    }

    val farmerBookings: LiveData<List<Booking>> = BookingRepository.getFarmerBookings()
    val allBookings: LiveData<List<Booking>> = BookingRepository.getAllBookings()

    fun getOwnerBookings(): LiveData<List<Booking>> {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        return BookingRepository.getOwnerBookings(ownerUid)
    }

    fun createBooking(booking: Booking): LiveData<Resource<Booking>> {
        return BookingRepository.createBooking(booking)
    }

    fun createBookingSimple(booking: Booking): LiveData<Booking> {
        val result = MutableLiveData<Booking>()
        BookingRepository.createBooking(booking).observeForever { res ->
            if (res is Resource.Success) {
                result.value = res.data
            }
        }
        return result
    }

    fun acceptBooking(bookingId: String, onComplete: (Boolean, String) -> Unit) {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        BookingRepository.acceptBooking(bookingId, ownerUid, onComplete)
    }

    fun rejectBooking(bookingId: String, reason: String, onComplete: (Boolean) -> Unit) {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        BookingRepository.rejectBooking(bookingId, ownerUid, reason, onComplete)
    }

    fun assignWorkerToBooking(bookingId: String, workerId: String, workerName: String, onComplete: (Boolean) -> Unit) {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        BookingRepository.assignWorkerToBooking(bookingId, workerId, workerName, ownerUid, onComplete)
    }

    fun startWork(bookingId: String, onComplete: (Boolean) -> Unit) {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        BookingRepository.startWork(bookingId, ownerUid, onComplete)
    }

    fun completeWork(bookingId: String, onComplete: (Boolean) -> Unit) {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        BookingRepository.completeWork(bookingId, ownerUid, onComplete)
    }

    fun completeWorkByFarmer(booking: Booking, onComplete: (Boolean, String) -> Unit) {
        BookingRepository.completeWorkByFarmer(booking, onComplete)
    }

    fun updateBookingStatus(bookingId: String, status: BookingStatus) {
        BookingRepository.updateBookingStatus(bookingId, status)
    }

    fun getBookingById(id: String): Booking? {
        return BookingRepository.getBookingById(id)
    }

    fun getRecommendedTimeSlots(
        equipmentId: String = "",
        date: String = "",
        activity: String = "Ploughing",
        weather: Weather = Weather()
    ): List<TimeSlotRecommendation> {
        return schedulingEngine.evaluateTimeSlots(equipmentId, date, activity, weather)
    }

    fun calculateTotal(ratePerAcre: Double, acres: Double): Pair<Double, Double> {
        val equipmentCost = ratePerAcre * acres
        val serviceFee = 150.0
        val total = equipmentCost + serviceFee
        return Pair(equipmentCost, total)
    }
}

class StoreViewModel : ViewModel() {
    val cart: LiveData<Cart> = StoreRepository.getCart()
    fun getProducts(): List<Product> = StoreRepository.getProducts()
    fun addToCart(product: Product) = StoreRepository.addToCart(product)
    fun removeFromCart(productId: String) = StoreRepository.removeFromCart(productId)
    fun updateQuantity(productId: String, delta: Int) = StoreRepository.updateQuantity(productId, delta)
    fun clearCart() = StoreRepository.clearCart()
    fun placeOrder(address: String): LiveData<Resource<Order>> = StoreRepository.placeOrder(address)
}

class CommunityViewModel : ViewModel() {
    val posts: LiveData<List<CommunityPost>> = CommunityRepository.getPosts()
    fun addPost(question: String) = CommunityRepository.addPost(question)
    fun toggleLike(postId: String) = CommunityRepository.toggleLike(postId)
    fun uploadCommunityImage(postId: String, uri: Uri, onProgress: (Int) -> Unit = {}, onResult: (Resource<String>) -> Unit) {
        StorageRepository.uploadCommunityImage(postId, uri, onProgress, onResult)
    }

    // WhatsApp-style Group Chat methods
    val groups: LiveData<List<CommunityGroup>> = CommunityChatRepository.getGroups()
    fun getGroupMessages(groupId: String): LiveData<List<GroupChatMessage>> = CommunityChatRepository.getGroupMessages(groupId)
    fun sendMessage(groupId: String, text: String, onComplete: (Boolean) -> Unit = {}) = CommunityChatRepository.sendMessage(groupId, text, onComplete)
    fun addMemberToGroup(groupId: String, identifier: String, memberName: String = "", onComplete: (Boolean, String) -> Unit) =
        CommunityChatRepository.addMemberToGroup(groupId, identifier, memberName, onComplete)
    fun createGroup(name: String, description: String, onComplete: (Boolean, String) -> Unit) =
        CommunityChatRepository.createGroup(name, description, onComplete)
}

class WeatherViewModel : ViewModel() {
    private val weatherRepo = WeatherRepository()
    val weatherForecast: LiveData<Weather> = weatherRepo.getWeatherForecast()

    fun getWeatherForecast(lat: Double = 0.0, lng: Double = 0.0, locationName: String = "Current Location"): LiveData<Weather> {
        return weatherRepo.getWeatherForecast(lat, lng, locationName)
    }
}

class OwnerViewModel : ViewModel() {
    private val authRepo = AuthRepository()

    fun getOwnerDashboardStats(): LiveData<EquipmentOwner> {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        return OwnerRepository.getOwnerDashboardStats(ownerUid)
    }

    fun getOwnerBookings(): LiveData<List<Booking>> {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        return BookingRepository.getOwnerBookings(ownerUid)
    }
}

class WorkerViewModel : ViewModel() {
    private val authRepo = AuthRepository()
    val workerDetails: LiveData<Worker> = WorkerRepository.getWorkerDashboard()
    val todayTasks: LiveData<List<Task>> = WorkerRepository.getTodayTasks()

    fun getOwnerWorkers(): LiveData<List<Worker>> {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        return WorkerRepository.getOwnerWorkers(ownerUid)
    }

    fun addWorker(worker: Worker, onComplete: (Boolean) -> Unit = {}) {
        val ownerUid = authRepo.getCurrentUserId() ?: ""
        WorkerRepository.addWorker(worker.copy(ownerId = ownerUid), onComplete)
    }

    fun updateWorker(worker: Worker, onComplete: (Boolean) -> Unit = {}) {
        WorkerRepository.updateWorker(worker, onComplete)
    }

    fun deactivateWorker(workerId: String, onComplete: (Boolean) -> Unit = {}) {
        WorkerRepository.deactivateWorker(workerId, onComplete)
    }

    fun payWorkerWage(workerId: String, amount: Double, paymentMode: String, onComplete: (Boolean) -> Unit = {}) {
        WorkerRepository.payWorkerWage(workerId, amount, paymentMode, onComplete)
    }

    fun toggleCheckInStatus() = WorkerRepository.toggleCheckInStatus()
    fun toggleTaskCompletion(taskId: String) = WorkerRepository.toggleTaskCompletion(taskId)
    fun getActiveWorkerBooking(workerId: String) = BookingRepository.getActiveWorkerBooking(workerId)
    fun rateWorker(workerId: String, rating: Float, onComplete: (Boolean) -> Unit = {}) {
        WorkerRepository.rateWorker(workerId, rating, onComplete)
    }
}

class AdminViewModel : ViewModel() {
    private val adminRepo = AdminRepository()
    val adminStats: LiveData<AdminStats> = adminRepo.getAdminStats()
    val documents: LiveData<List<EquipmentDocument>> = DocumentRepository.getDocuments()

    fun updateDocumentStatus(docId: String, status: String) {
        DocumentRepository.updateDocumentStatus(docId, status)
    }
}

class NotificationViewModel : ViewModel() {
    private val authRepo = AuthRepository()

    fun getUserNotifications(): LiveData<List<Notification>> {
        val uid = authRepo.getCurrentUserId() ?: ""
        return NotificationRepository.getUserNotifications(uid)
    }

    fun markAsRead(notificationId: String) {
        val uid = authRepo.getCurrentUserId() ?: ""
        NotificationRepository.markAsRead(uid, notificationId)
    }

    fun markAllAsRead() {
        val uid = authRepo.getCurrentUserId() ?: ""
        NotificationRepository.markAllAsRead(uid)
    }

    fun fetchAndSaveFcmToken() {
        val uid = authRepo.getCurrentUserId()
        if (!uid.isNullOrEmpty()) {
            NotificationRepository.fetchAndSaveFcmToken(uid)
        }
    }
}

class PaymentViewModel : ViewModel() {
    private val authRepo = AuthRepository()

    fun savePaymentRecord(record: PaymentRecord, onComplete: ((Boolean) -> Unit)? = null) {
        PaymentRepository.savePaymentRecord(record, onComplete)
    }

    fun confirmOwnerCashPayment(
        paymentId: String,
        bookingId: String,
        farmerId: String,
        amount: Double,
        onComplete: ((Boolean) -> Unit)? = null
    ) {
        PaymentRepository.confirmOwnerCashPayment(paymentId, bookingId, farmerId, amount, onComplete)
    }

    fun updatePaymentStatus(paymentId: String, bookingId: String, status: String) {
        PaymentRepository.updatePaymentStatus(paymentId, bookingId, status)
    }

    fun getUserPayments(): LiveData<List<PaymentRecord>> {
        val uid = authRepo.getCurrentUserId() ?: ""
        return PaymentRepository.getUserPayments(uid)
    }
}

class SoilViewModel : ViewModel() {
    private val authRepo = AuthRepository()
    private val engine: RecommendationEngine = RuleBasedRecommendationEngine()

    fun getSoilProfile(): LiveData<FarmSoilProfile> {
        val uid = authRepo.getCurrentUserId() ?: "USR101"
        return SoilRepository.getSoilProfile(uid)
    }

    fun generateRecommendations(profile: FarmSoilProfile, weather: Weather? = null): List<CropRecommendation> {
        val uid = authRepo.getCurrentUserId() ?: "USR101"
        val updatedProfile = profile.copy(userId = uid)

        val recommendations = engine.generateCropRecommendations(updatedProfile, weather)

        SoilRepository.saveSoilProfile(updatedProfile)
        recommendations.firstOrNull()?.let { topRec ->
            SoilRepository.saveCropRecommendation(topRec)
        }

        return recommendations
    }

    fun getRecommendationHistory(): LiveData<List<CropRecommendation>> {
        val uid = authRepo.getCurrentUserId() ?: "USR101"
        return SoilRepository.getCropRecommendations(uid)
    }
}

class CropDamViewModel : ViewModel() {
    val cropRegions: LiveData<List<CropRegion>> = CropMapRepository.getCropRegions()
    val dams: LiveData<List<DamInfo>> = DamRepository.getDams()
}
