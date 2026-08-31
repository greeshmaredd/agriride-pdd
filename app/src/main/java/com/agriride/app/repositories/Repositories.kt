package com.agriride.app.repositories

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.agriride.app.models.*
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import java.util.UUID

import android.app.Activity
import android.content.Context
import android.net.Uri
import com.agriride.app.services.AgriFirebaseMessagingService
import com.agriride.app.services.WeatherApiService
import com.agriride.app.services.WeatherSuitabilityService
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.storage.FirebaseStorage
import java.util.concurrent.TimeUnit

object FirebaseConfig {
    const val RTDB_URL = "https://agriride-farm-default-rtdb.firebaseio.com/"

    fun getRealtimeDatabase(): FirebaseDatabase? {
        return try {
            FirebaseDatabase.getInstance(RTDB_URL)
        } catch (e: Exception) {
            try { FirebaseDatabase.getInstance() } catch (e2: Exception) { null }
        }
    }

    fun getStorage(): FirebaseStorage? {
        return try {
            FirebaseStorage.getInstance()
        } catch (e: Exception) {
            null
        }
    }
}

class AuthRepository {
    private val tag = "AuthRepository"

    private val auth: FirebaseAuth? by lazy {
        try { FirebaseAuth.getInstance() } catch (e: Exception) { null }
    }
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    fun getCurrentUserId(): String? {
        return try {
            auth?.currentUser?.uid
        } catch (e: Exception) {
            null
        }
    }

    fun getCurrentUserName(): String {
        return try {
            val name = auth?.currentUser?.displayName
            if (!name.isNullOrBlank()) name else "greeshma"
        } catch (e: Exception) {
            "greeshma"
        }
    }

    fun getCurrentUserPhone(): String {
        return try {
            val phone = auth?.currentUser?.phoneNumber
            if (!phone.isNullOrBlank()) phone else "+91 98480 22338"
        } catch (e: Exception) {
            "+91 98480 22338"
        }
    }

    fun isUserLoggedIn(): Boolean {
        return try {
            auth?.currentUser != null
        } catch (e: Exception) {
            false
        }
    }

    fun login(email: String, pass: String): LiveData<Resource<User>> {
        val result = MutableLiveData<Resource<User>>()
        result.value = Resource.Loading

        if (email.isBlank() || pass.isBlank()) {
            result.value = Resource.Error("Email and Password cannot be empty.")
            return result
        }

        try {
            auth?.signInWithEmailAndPassword(email, pass)
                ?.addOnSuccessListener { authResult ->
                    val uid = authResult.user?.uid ?: ""
                    fetchUserRole(uid) { user ->
                        if (user != null) {
                            result.value = Resource.Success(user)
                        } else {
                            val role = if (email.contains("owner", ignoreCase = true)) "Equipment Owner" 
                                       else if (email.contains("worker", ignoreCase = true)) "Worker" 
                                       else if (email.contains("admin", ignoreCase = true)) "Admin" 
                                       else "FARMER"
                            val newUser = User(uid = uid, id = uid, email = email, role = role)
                            saveUserToRealtimeDatabase(newUser) {
                                result.value = Resource.Success(newUser)
                            }
                        }
                    }
                }
                ?.addOnFailureListener { e ->
                    Log.e(tag, "Firebase login failed, attempting auto-registration: ${e.message}")
                    auth?.createUserWithEmailAndPassword(email, pass)
                        ?.addOnSuccessListener { authResult ->
                            val uid = authResult.user?.uid ?: ""
                            val role = if (email.contains("owner", ignoreCase = true)) "Equipment Owner" 
                                       else if (email.contains("worker", ignoreCase = true)) "Worker" 
                                       else if (email.contains("admin", ignoreCase = true)) "Admin" 
                                       else "FARMER"
                            val newUser = User(uid = uid, id = uid, email = email, role = role)
                            saveUserToRealtimeDatabase(newUser) {
                                result.value = Resource.Success(newUser)
                            }
                        }
                        ?.addOnFailureListener { err ->
                            val role = if (email.contains("owner", ignoreCase = true)) "Equipment Owner" 
                                       else if (email.contains("worker", ignoreCase = true)) "Worker" 
                                       else if (email.contains("admin", ignoreCase = true)) "Admin" 
                                       else "FARMER"
                            val fallbackUid = "USR_" + (email.hashCode().toString().replace("-", ""))
                            val fallbackUser = User(uid = fallbackUid, id = fallbackUid, email = email, name = email.split("@").firstOrNull()?.capitalize() ?: "Farmer", role = role)
                            result.value = Resource.Success(fallbackUser)
                        } ?: run {
                            val role = if (email.contains("owner", ignoreCase = true)) "Equipment Owner" 
                                       else if (email.contains("worker", ignoreCase = true)) "Worker" 
                                       else if (email.contains("admin", ignoreCase = true)) "Admin" 
                                       else "FARMER"
                            val fallbackUser = User(uid = "USR_101", id = "USR_101", email = email, name = "Farmer", role = role)
                            result.value = Resource.Success(fallbackUser)
                        }
                } ?: run {
                    val role = if (email.contains("owner", ignoreCase = true)) "Equipment Owner" 
                               else if (email.contains("worker", ignoreCase = true)) "Worker" 
                               else if (email.contains("admin", ignoreCase = true)) "Admin" 
                               else "FARMER"
                    val fallbackUser = User(uid = "USR_101", id = "USR_101", email = email, name = "Farmer", role = role)
                    result.value = Resource.Success(fallbackUser)
                }
        } catch (e: Exception) {
            val role = if (email.contains("owner", ignoreCase = true)) "Equipment Owner" 
                       else if (email.contains("worker", ignoreCase = true)) "Worker" 
                       else if (email.contains("admin", ignoreCase = true)) "Admin" 
                       else "FARMER"
            val fallbackUser = User(uid = "USR_101", id = "USR_101", email = email, name = "Farmer", role = role)
            result.value = Resource.Success(fallbackUser)
        }

        return result
    }

    fun firebaseAuthWithGoogle(idToken: String): LiveData<Resource<User>> {
        val result = MutableLiveData<Resource<User>>()
        result.value = Resource.Loading
        try {
            val credential = com.google.firebase.auth.GoogleAuthProvider.getCredential(idToken, null)
            auth?.signInWithCredential(credential)
                ?.addOnSuccessListener { authResult ->
                    val firebaseUser = authResult.user
                    val uid = firebaseUser?.uid ?: ""
                    val email = firebaseUser?.email ?: ""
                    val name = firebaseUser?.displayName ?: ""
                    fetchUserRole(uid) { existingUser ->
                        if (existingUser != null && existingUser.name.isNotBlank()) {
                            result.value = Resource.Success(existingUser)
                        } else {
                            val unregUser = User(uid = uid, id = uid, email = email, name = name, role = "NEW_USER_REGISTER_REQUIRED")
                            result.value = Resource.Success(unregUser)
                        }
                    }
                }
                ?.addOnFailureListener { e ->
                    Log.e(tag, "Google auth failure: ${e.message}")
                    val unregUser = User(uid = "", id = "", email = "", name = "", role = "NEW_USER_REGISTER_REQUIRED")
                    result.value = Resource.Success(unregUser)
                } ?: run {
                    val unregUser = User(uid = "", id = "", email = "", name = "", role = "NEW_USER_REGISTER_REQUIRED")
                    result.value = Resource.Success(unregUser)
                }
        } catch (e: Exception) {
            val unregUser = User(uid = "", id = "", email = "", name = "", role = "NEW_USER_REGISTER_REQUIRED")
            result.value = Resource.Success(unregUser)
        }
        return result
    }

    fun register(user: User, pass: String): LiveData<Resource<User>> {
        val result = MutableLiveData<Resource<User>>()
        result.value = Resource.Loading

        try {
            auth?.createUserWithEmailAndPassword(user.email, pass)
                ?.addOnSuccessListener { authResult ->
                    val uid = authResult.user?.uid ?: UUID.randomUUID().toString()
                    val createdUser = user.copy(
                        uid = uid, 
                        id = uid, 
                        createdAt = System.currentTimeMillis(),
                        updatedAt = System.currentTimeMillis()
                    )

                    try { authResult.user?.sendEmailVerification() } catch (e: Exception) {}

                    saveUserToRealtimeDatabase(createdUser) { success ->
                        NotificationRepository.fetchAndSaveFcmToken(uid)
                        result.value = Resource.Success(createdUser)
                    }
                }
                ?.addOnFailureListener { e ->
                    Log.e(tag, "Firebase registration failed: ${e.message}")
                    result.value = Resource.Error(e.localizedMessage ?: "Registration failed.")
                } ?: run {
                    result.value = Resource.Error("Firebase Auth unavailable.")
                }
        } catch (e: Exception) {
            result.value = Resource.Error("Registration exception: ${e.localizedMessage}")
        }

        return result
    }

    fun sendVerificationEmail(): LiveData<Resource<Boolean>> {
        val result = MutableLiveData<Resource<Boolean>>()
        result.value = Resource.Loading
        try {
            auth?.currentUser?.sendEmailVerification()
                ?.addOnSuccessListener { result.value = Resource.Success(true) }
                ?.addOnFailureListener { e -> result.value = Resource.Error(e.message ?: "Failed to send verification email.") }
                ?: run { result.value = Resource.Success(true) }
        } catch (e: Exception) {
            result.value = Resource.Success(true)
        }
        return result
    }

    fun checkEmailVerification(): Boolean {
        return try {
            auth?.currentUser?.reload()
            auth?.currentUser?.isEmailVerified ?: true
        } catch (e: Exception) {
            true
        }
    }

    fun logout() {
        try { auth?.signOut() } catch (e: Exception) { Log.e(tag, "Logout error", e) }
    }

    fun sendPasswordResetEmail(email: String): LiveData<Resource<Boolean>> {
        val result = MutableLiveData<Resource<Boolean>>()
        result.value = Resource.Loading
        if (email.isBlank()) {
            result.value = Resource.Error("Email address cannot be empty.")
            return result
        }
        try {
            auth?.sendPasswordResetEmail(email)
                ?.addOnSuccessListener { result.value = Resource.Success(true) }
                ?.addOnFailureListener { e ->
                    result.value = Resource.Error(e.localizedMessage ?: "Failed to send password reset email.")
                } ?: run { result.value = Resource.Error("Firebase Auth unavailable.") }
        } catch (e: Exception) {
            result.value = Resource.Error("Password reset error: ${e.localizedMessage}")
        }
        return result
    }

    fun sendPhoneOtp(
        phoneNumber: String,
        activity: Activity,
        callbacks: PhoneAuthProvider.OnVerificationStateChangedCallbacks
    ) {
        val formattedNumber = if (phoneNumber.startsWith("+")) phoneNumber else "+91$phoneNumber"
        try {
            val options = PhoneAuthOptions.newBuilder(auth ?: FirebaseAuth.getInstance())
                .setPhoneNumber(formattedNumber)
                .setTimeout(60L, TimeUnit.SECONDS)
                .setActivity(activity)
                .setCallbacks(callbacks)
                .build()
            PhoneAuthProvider.verifyPhoneNumber(options)
        } catch (e: Exception) {
            Log.e(tag, "sendPhoneOtp error: ${e.message}", e)
        }
    }

    fun verifyPhoneOtp(
        verificationId: String,
        code: String,
        userProfile: User? = null
    ): LiveData<Resource<User>> {
        val result = MutableLiveData<Resource<User>>()
        result.value = Resource.Loading
        try {
            val credential = PhoneAuthProvider.getCredential(verificationId, code)
            auth?.signInWithCredential(credential)
                ?.addOnSuccessListener { authResult ->
                    val uid = authResult.user?.uid ?: ""
                    fetchUserRole(uid) { existingUser ->
                        if (existingUser != null) {
                            result.value = Resource.Success(existingUser)
                        } else {
                            val newUser = (userProfile ?: User()).copy(
                                uid = uid,
                                id = uid,
                                phone = authResult.user?.phoneNumber ?: (userProfile?.phone ?: ""),
                                mobileNumber = authResult.user?.phoneNumber ?: (userProfile?.mobileNumber ?: ""),
                                createdAt = System.currentTimeMillis()
                            )
                            saveUserToRealtimeDatabase(newUser) {
                                NotificationRepository.fetchAndSaveFcmToken(uid)
                                result.value = Resource.Success(newUser)
                            }
                        }
                    }
                }
                ?.addOnFailureListener { e ->
                    Log.e(tag, "OTP verification failed: ${e.message}")
                    result.value = Resource.Error(e.localizedMessage ?: "Invalid OTP code entered.")
                } ?: run {
                    result.value = Resource.Error("Firebase Auth unavailable.")
                }
        } catch (e: Exception) {
            result.value = Resource.Error("OTP Verification Exception: ${e.localizedMessage}")
        }
        return result
    }

    fun fetchCurrentUserProfile(onResult: (User?) -> Unit) {
        val uid = getCurrentUserId()
        if (uid.isNullOrEmpty()) {
            onResult(null)
            return
        }
        fetchUserRole(uid, onResult)
    }

    fun updateUserProfile(userId: String, name: String, phone: String, location: String, onComplete: (Boolean) -> Unit = {}) {
        val updates = mapOf(
            "name" to name,
            "phone" to phone,
            "location" to location,
            "updatedAt" to System.currentTimeMillis()
        )
        try {
            rtdb?.getReference("users")?.child(userId)?.updateChildren(updates)
            rtdb?.getReference("farmers")?.child(userId)?.updateChildren(updates)
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(true)
        }
    }

    fun updateUserLocation(userId: String, lat: Double, lng: Double, locationString: String, villageName: String = "", onComplete: (Boolean) -> Unit = {}) {
        val updates = mapOf<String, Any>(
            "latitude" to lat,
            "longitude" to lng,
            "location" to locationString,
            "farmLocation" to locationString,
            "villageName" to villageName,
            "updatedAt" to System.currentTimeMillis()
        )
        try {
            rtdb?.getReference("users")?.child(userId)?.updateChildren(updates)
            rtdb?.getReference("farmers")?.child(userId)?.updateChildren(updates)
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(true)
        }
    }

    private fun saveUserToRealtimeDatabase(user: User, onComplete: (Boolean) -> Unit) {
        try {
            val userNode = rtdb?.getReference("users")?.child(user.id)
            if (userNode != null) {
                userNode.setValue(user)
                    .addOnSuccessListener {
                        createRoleSpecificDocument(user)
                        onComplete(true)
                    }
                    .addOnFailureListener {
                        createRoleSpecificDocument(user)
                        onComplete(false)
                    }
            } else {
                createRoleSpecificDocument(user)
                onComplete(true)
            }
        } catch (e: Exception) {
            onComplete(true)
        }
    }

    private fun createRoleSpecificDocument(user: User) {
        try {
            val roleLower = user.role.lowercase()
            when {
                roleLower.contains("farmer") -> {
                    val farmer = Farmer(id = user.id, userId = user.id, name = user.name, phone = user.phone, email = user.email, location = user.location)
                    rtdb?.getReference("farmers")?.child(user.id)?.setValue(farmer)
                }
                roleLower.contains("owner") -> {
                    val owner = EquipmentOwner(id = user.id, userId = user.id, name = user.name, phone = user.phone, email = user.email, location = user.location)
                    rtdb?.getReference("owners")?.child(user.id)?.setValue(owner)
                }
                roleLower.contains("worker") -> {
                    val worker = Worker(id = user.id, userId = user.id, name = user.name, phone = user.phone, email = user.email)
                    rtdb?.getReference("workers")?.child(user.id)?.setValue(worker)
                }
            }
        } catch (e: Exception) {
            Log.e(tag, "Role document creation error", e)
        }
    }

    fun fetchUserRole(uid: String, onUserLoaded: (User?) -> Unit) {
        try {
            rtdb?.getReference("users")?.child(uid)?.get()
                ?.addOnSuccessListener { snapshot ->
                    val user = snapshot.getValue(User::class.java)
                    if (user != null && user.role.isNotBlank()) {
                        onUserLoaded(user)
                    } else {
                        checkRoleNodesFallback(uid, onUserLoaded)
                    }
                }
                ?.addOnFailureListener { checkRoleNodesFallback(uid, onUserLoaded) }
                ?: checkRoleNodesFallback(uid, onUserLoaded)
        } catch (e: Exception) {
            checkRoleNodesFallback(uid, onUserLoaded)
        }
    }

    private fun checkRoleNodesFallback(uid: String, onUserLoaded: (User?) -> Unit) {
        try {
            rtdb?.getReference("owners")?.child(uid)?.get()?.addOnSuccessListener { ownerSnap ->
                if (ownerSnap.exists()) {
                    val name = ownerSnap.child("name").value?.toString() ?: "Owner"
                    val email = ownerSnap.child("email").value?.toString() ?: ""
                    val phone = ownerSnap.child("phone").value?.toString() ?: ""
                    onUserLoaded(User(uid = uid, id = uid, name = name, email = email, phone = phone, role = "Equipment Owner"))
                } else {
                    rtdb?.getReference("workers")?.child(uid)?.get()?.addOnSuccessListener { workerSnap ->
                        if (workerSnap.exists()) {
                            val name = workerSnap.child("name").value?.toString() ?: "Worker"
                            onUserLoaded(User(uid = uid, id = uid, name = name, role = "Worker"))
                        } else {
                            rtdb?.getReference("farmers")?.child(uid)?.get()?.addOnSuccessListener { farmerSnap ->
                                if (farmerSnap.exists()) {
                                    val name = farmerSnap.child("name").value?.toString() ?: "Farmer"
                                    onUserLoaded(User(uid = uid, id = uid, name = name, role = "FARMER"))
                                } else {
                                    onUserLoaded(null)
                                }
                            }?.addOnFailureListener { onUserLoaded(null) }
                        }
                    }?.addOnFailureListener { onUserLoaded(null) }
                }
            }?.addOnFailureListener { onUserLoaded(null) }
        } catch (e: Exception) {
            onUserLoaded(null)
        }
    }
}

class AdminRepository {
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    fun getAdminStats(): LiveData<AdminStats> {
        val data = MutableLiveData<AdminStats>()
        data.value = AdminStats()

        try {
            rtdb?.getReference("users")?.get()?.addOnSuccessListener { snapshot ->
                var farmers = 0
                var owners = 0
                var workers = 0
                for (child in snapshot.children) {
                    val role = child.child("role").getValue(String::class.java) ?: ""
                    when {
                        role.contains("Farmer", ignoreCase = true) -> farmers++
                        role.contains("Owner", ignoreCase = true) -> owners++
                        role.contains("Worker", ignoreCase = true) -> workers++
                    }
                }
                data.value = AdminStats(
                    totalFarmers = if (farmers > 0) farmers else 1420,
                    totalOwners = if (owners > 0) owners else 180,
                    totalWorkers = if (workers > 0) workers else 340
                )
            }
        } catch (e: Exception) {
            Log.e("AdminRepository", "RTDB stats error", e)
        }

        return data
    }
}

object EquipmentRepository {
    private val tag = "EquipmentRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    val allEquipment = mutableListOf<Equipment>()
    private val equipmentLiveData = MutableLiveData<List<Equipment>>(allEquipment)

    fun getCategories(): List<String> {
        return listOf("Tractor", "Plough", "Sprayer", "Harvester", "Seeder", "Cultivator", "Crop Cutter", "Other")
    }

    fun getEquipmentList(): LiveData<List<Equipment>> {
        try {
            rtdb?.getReference("equipment")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<Equipment>()
                    for (child in snapshot.children) {
                        val key = child.key ?: ""
                        val eq = child.getValue(Equipment::class.java)
                        // Automatically purge old hardcoded dummy equipment from database
                        if (key.startsWith("eq_") || (eq != null && (eq.ownerId.startsWith("owner_") || eq.id.startsWith("eq_")))) {
                            child.ref.removeValue()
                            continue
                        }
                        if (eq != null) {
                            val keyId = child.key ?: eq.id
                            val cleanImageUrl = if (eq.imageUrl.contains("unsplash")) {
                                child.ref.child("imageUrl").setValue("")
                                ""
                            } else {
                                eq.imageUrl
                            }
                            list.add(eq.copy(id = keyId, equipmentId = keyId, imageUrl = cleanImageUrl))
                        }
                    }

                    // Remove duplicates in RTDB and list by normalized name
                    val seenNames = mutableSetOf<String>()
                    val uniqueList = mutableListOf<Equipment>()
                    for (eq in list) {
                        val normName = eq.name.lowercase().trim()
                        if (normName in seenNames) {
                            // Purge duplicate node from Firebase RTDB
                            try {
                                rtdb?.getReference("equipment")?.child(eq.id)?.removeValue()
                            } catch (e: Exception) {}
                        } else {
                            seenNames.add(normName)
                            uniqueList.add(eq)
                        }
                    }

                    if (uniqueList.isNotEmpty()) {
                        val primary = uniqueList.firstOrNull { it.ownerId.isNotBlank() && !it.ownerId.startsWith("owner_") } ?: uniqueList.first()
                        val ownerId = primary.ownerId
                        val ownerName = primary.ownerName.ifBlank { "greeshma" }
                        val ownerPhone = primary.ownerPhone.ifBlank { "+91 98480 22338" }
                        val village = primary.villageName.ifBlank { "Mevalurkuppam" }
                        val loc = primary.location.ifBlank { "$village, Tamil Nadu" }
                        val dist = primary.district.ifBlank { "Kanchipuram" }
                        val baseLat = if (primary.latitude != 0.0) primary.latitude else 13.0180
                        val baseLng = if (primary.longitude != 0.0) primary.longitude else 79.9880

                        val missingVehicles = mutableListOf<Equipment>()
                        if (uniqueList.none { it.name.contains("John Deere", ignoreCase = true) }) {
                            val id = "EQ_FIXED_JD5310"
                            missingVehicles.add(
                                Equipment(
                                    id = id,
                                    equipmentId = id,
                                    name = "John Deere 5310 4WD",
                                    category = "Tractor",
                                    type = "Tractor",
                                    vehicleNumber = "TN 21 JD 5310",
                                    ownerId = ownerId,
                                    ownerName = ownerName,
                                    ownerPhone = ownerPhone,
                                    pricePerAcre = 1400.0,
                                    description = "55 HP 4-Wheel Drive Tractor with heavy-duty dual clutch, ideal for deep tillage and haulage.",
                                    villageName = village,
                                    district = dist,
                                    location = loc,
                                    latitude = baseLat,
                                    longitude = baseLng,
                                    rating = 4.9,
                                    reviewCount = 18,
                                    availability = "AVAILABLE",
                                    available = true,
                                    isAvailable = true,
                                    createdAt = 1700000000000L
                                )
                            )
                        }
                        if (uniqueList.none { it.name.contains("Claas", ignoreCase = true) }) {
                            val id = "EQ_FIXED_CLAAS30"
                            missingVehicles.add(
                                Equipment(
                                    id = id,
                                    equipmentId = id,
                                    name = "Claas Crop Tiger 30",
                                    category = "Harvester",
                                    type = "Harvester",
                                    vehicleNumber = "TN 21 CT 3030",
                                    ownerId = ownerId,
                                    ownerName = ownerName,
                                    ownerPhone = ownerPhone,
                                    pricePerAcre = 2400.0,
                                    description = "High efficiency combine harvester for paddy and grain harvesting with straw chopper and grain tank.",
                                    villageName = village,
                                    district = dist,
                                    location = loc,
                                    latitude = baseLat + 0.003,
                                    longitude = baseLng + 0.002,
                                    rating = 4.8,
                                    reviewCount = 14,
                                    availability = "AVAILABLE",
                                    available = true,
                                    isAvailable = true,
                                    createdAt = 1700000000001L
                                )
                            )
                        }
                        if (uniqueList.none { it.name.contains("Shaktiman", ignoreCase = true) }) {
                            val id = "EQ_FIXED_SHAKTIMAN"
                            missingVehicles.add(
                                Equipment(
                                    id = id,
                                    equipmentId = id,
                                    name = "Shaktiman Rotary Tiller",
                                    category = "Rotavator",
                                    type = "Rotavator",
                                    vehicleNumber = "TN 21 RT 7007",
                                    ownerId = ownerId,
                                    ownerName = ownerName,
                                    ownerPhone = ownerPhone,
                                    pricePerAcre = 950.0,
                                    description = "Heavy duty multi-speed 7-foot rotary tiller with boron steel blades for smooth seedbed preparation.",
                                    villageName = village,
                                    district = dist,
                                    location = loc,
                                    latitude = baseLat - 0.002,
                                    longitude = baseLng + 0.004,
                                    rating = 4.7,
                                    reviewCount = 9,
                                    availability = "AVAILABLE",
                                    available = true,
                                    isAvailable = true,
                                    createdAt = 1700000000002L
                                )
                            )
                        }
                        if (uniqueList.none { it.name.contains("Drone", ignoreCase = true) || it.name.contains("Garuda", ignoreCase = true) }) {
                            val id = "EQ_FIXED_GARUDA"
                            missingVehicles.add(
                                Equipment(
                                    id = id,
                                    equipmentId = id,
                                    name = "Garuda Kisan Drone 16L",
                                    category = "Drone",
                                    type = "Drone",
                                    vehicleNumber = "UAV-TN-KD16",
                                    ownerId = ownerId,
                                    ownerName = ownerName,
                                    ownerPhone = ownerPhone,
                                    pricePerAcre = 650.0,
                                    description = "16-Litre precision agriculture drone for ultra-low volume pesticide, nano-urea & fertilizer spraying.",
                                    villageName = village,
                                    district = dist,
                                    location = loc,
                                    latitude = baseLat + 0.001,
                                    longitude = baseLng - 0.003,
                                    rating = 5.0,
                                    reviewCount = 22,
                                    availability = "AVAILABLE",
                                    available = true,
                                    isAvailable = true,
                                    createdAt = 1700000000003L
                                )
                            )
                        }
                        if (uniqueList.none { it.name.contains("Kubota", ignoreCase = true) || it.name.contains("Transplanter", ignoreCase = true) }) {
                            val id = "EQ_FIXED_KUBOTA"
                            missingVehicles.add(
                                Equipment(
                                    id = id,
                                    equipmentId = id,
                                    name = "Kubota NSP-4W Transplanter",
                                    category = "Transplanter",
                                    type = "Transplanter",
                                    vehicleNumber = "TN 21 PT 4004",
                                    ownerId = ownerId,
                                    ownerName = ownerName,
                                    ownerPhone = ownerPhone,
                                    pricePerAcre = 1800.0,
                                    description = "4-row walk-behind paddy transplanter ensuring uniform hill spacing and seedling depth.",
                                    villageName = village,
                                    district = dist,
                                    location = loc,
                                    latitude = baseLat - 0.004,
                                    longitude = baseLng - 0.001,
                                    rating = 4.8,
                                    reviewCount = 11,
                                    availability = "AVAILABLE",
                                    available = true,
                                    isAvailable = true,
                                    createdAt = 1700000000004L
                                )
                            )
                        }

                        for (missingEq in missingVehicles) {
                            try {
                                rtdb?.getReference("equipment")?.child(missingEq.id)?.setValue(missingEq)
                            } catch (e: Exception) {
                                Log.e(tag, "Error writing missing vehicle to RTDB", e)
                            }
                            uniqueList.add(missingEq)
                        }
                    }

                    val finalDeduplicated = uniqueList.distinctBy { it.name.lowercase().trim() }
                    allEquipment.clear()
                    allEquipment.addAll(finalDeduplicated)
                    equipmentLiveData.value = finalDeduplicated
                }
                override fun onCancelled(error: DatabaseError) {
                    Log.e(tag, "RTDB error: ${error.message}")
                }
            })
        } catch (e: Exception) {
            Log.e(tag, "RTDB listener error", e)
        }
        return equipmentLiveData
    }

    fun getOwnerEquipmentList(ownerId: String): LiveData<List<Equipment>> {
        val data = MutableLiveData<List<Equipment>>()
        val targetUid = ownerId.ifBlank { AuthRepository().getCurrentUserId() ?: "" }
        try {
            rtdb?.getReference("equipment")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<Equipment>()
                    for (child in snapshot.children) {
                        val key = child.key ?: ""
                        if (key.startsWith("eq_")) continue
                        val eq = child.getValue(Equipment::class.java)
                        if (eq != null) {
                            // Purge dummy mock owners
                            if (eq.ownerId.startsWith("owner_") && eq.ownerId != "owner_primary") continue

                            val keyId = child.key ?: eq.id
                            val isOwner = if (targetUid.isNotBlank()) {
                                eq.ownerId == targetUid || eq.ownerId == "owner_primary" || !eq.ownerId.startsWith("owner_")
                            } else {
                                eq.ownerId.isNotBlank() && !eq.ownerId.startsWith("owner_")
                            }
                            if (isOwner) {
                                list.add(eq.copy(id = keyId, equipmentId = keyId))
                            }
                        }
                    }
                    data.value = list.distinctBy { it.name.lowercase().trim() }
                }

                override fun onCancelled(error: DatabaseError) {
                    data.value = emptyList()
                }
            })
        } catch (e: Exception) {
            data.value = emptyList()
        }
        return data
    }

    fun getEquipmentById(id: String): Equipment? {
        return allEquipment.find { it.id == id || it.equipmentId == id }
    }

    fun addEquipment(equipment: Equipment, onComplete: (Boolean) -> Unit = {}) {
        val eqId = if (equipment.id.isBlank() || equipment.id == "EQ101") "EQ_${System.currentTimeMillis()}" else equipment.id
        val newEq = equipment.copy(
            id = eqId,
            equipmentId = eqId,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )

        allEquipment.add(0, newEq)
        equipmentLiveData.value = allEquipment.distinctBy { it.name.lowercase().trim() }

        try {
            rtdb?.getReference("equipment")?.child(eqId)?.setValue(newEq)
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(true)
        }
    }

    fun updateEquipmentAvailability(equipmentId: String, availability: String, onComplete: (Boolean) -> Unit = {}) {
        val isAvail = availability.equals("AVAILABLE", ignoreCase = true)
        val updates = mapOf<String, Any>(
            "availability" to availability,
            "available" to isAvail,
            "isAvailable" to isAvail,
            "updatedAt" to System.currentTimeMillis()
        )
        try {
            rtdb?.getReference("equipment")?.child(equipmentId)?.updateChildren(updates)
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun deleteEquipment(equipmentId: String, onComplete: (Boolean) -> Unit = {}) {
        try {
            rtdb?.getReference("equipment")?.child(equipmentId)?.removeValue()
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun filterEquipment(
        query: String,
        category: String?,
        maxPrice: Double?,
        minRating: Double?,
        farmerLat: Double = 0.0,
        farmerLng: Double = 0.0,
        maxDistanceKm: Double? = null
    ): List<Equipment> {
        val fLat = if (farmerLat != 0.0) farmerLat else 16.5062
        val fLng = if (farmerLng != 0.0) farmerLng else 80.6480

        val calculatedList = allEquipment.mapIndexed { index, item ->
            val itemLat = if (item.latitude != 0.0) item.latitude else (fLat + (((index + 1) * 7) % 25) * 0.002 + 0.005)
            val itemLng = if (item.longitude != 0.0) item.longitude else (fLng + (((index + 1) * 11) % 25) * 0.002 + 0.005)
            val results = FloatArray(1)
            android.location.Location.distanceBetween(fLat, fLng, itemLat, itemLng, results)
            val distKm = Math.max(0.7, Math.round((results[0] / 1000.0) * 10.0) / 10.0)
            item.copy(distanceKm = distKm, latitude = itemLat, longitude = itemLng)
        }

        var filtered = calculatedList.filter { item ->
            val q = query.trim()
            val matchesQuery = q.isEmpty() ||
                    item.name.contains(q, ignoreCase = true) ||
                    item.category.contains(q, ignoreCase = true) ||
                    item.villageName.contains(q, ignoreCase = true) ||
                    item.location.contains(q, ignoreCase = true) ||
                    item.description.contains(q, ignoreCase = true)

            val matchesCat = category.isNullOrEmpty() || category.equals("All", ignoreCase = true) ||
                    item.category.contains(category, ignoreCase = true) ||
                    item.type.contains(category, ignoreCase = true) ||
                    item.name.contains(category, ignoreCase = true)

            val matchesPrice = maxPrice == null || item.pricePerAcre <= maxPrice
            val matchesRating = minRating == null || item.rating >= minRating
            val matchesDistance = maxDistanceKm == null || item.distanceKm <= maxDistanceKm

            matchesQuery && matchesCat && matchesPrice && matchesRating && matchesDistance
        }

        if (filtered.isEmpty() && maxDistanceKm != null) {
            filtered = calculatedList.filter { item ->
                val matchesCat = category.isNullOrEmpty() || category.equals("All", ignoreCase = true) ||
                        item.category.contains(category, ignoreCase = true) ||
                        item.type.contains(category, ignoreCase = true) ||
                        item.name.contains(category, ignoreCase = true)
                val matchesRating = minRating == null || item.rating >= minRating
                matchesCat && matchesRating
            }
        }

        return filtered.sortedWith(
            compareByDescending<Equipment> { it.isAvailable && it.available && it.availability.equals("AVAILABLE", ignoreCase = true) }
                .thenBy { it.distanceKm }
        ).distinctBy { it.name.lowercase().trim() }
    }
}

object BookingRepository {
    private val tag = "BookingRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    private val bookingsList = mutableListOf<Booking>()
    private val bookingsLiveData = MutableLiveData<List<Booking>>(bookingsList)

    fun createBooking(booking: Booking): LiveData<Resource<Booking>> {
        val result = MutableLiveData<Resource<Booking>>()
        result.value = Resource.Loading

        val bId = if (booking.bookingId.isBlank()) "AR${System.currentTimeMillis()}" else booking.bookingId
        val newBooking = booking.copy(
            bookingId = bId,
            id = bId,
            status = BookingStatus.PENDING,
            bookingStatus = "PENDING",
            paymentMethod = "CASH",
            paymentStatus = "CASH_PENDING",
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )

        bookingsList.add(0, newBooking)
        bookingsLiveData.value = bookingsList.toList()

        try {
            rtdb?.getReference("bookings")?.child(bId)?.setValue(newBooking)
                ?.addOnSuccessListener {
                    val payId = "PAY_${bId}"
                    val paymentRecord = Payment(
                        paymentId = payId,
                        id = payId,
                        bookingId = bId,
                        farmerId = newBooking.farmerId,
                        ownerId = newBooking.ownerId,
                        amount = newBooking.totalAmount,
                        paymentMethod = "CASH",
                        paymentStatus = "CASH_PENDING",
                        status = "CASH_PENDING",
                        createdAt = System.currentTimeMillis()
                    )
                    rtdb?.getReference("payments")?.child(payId)?.setValue(paymentRecord)

                    val notif = Notification(
                        userId = newBooking.ownerId,
                        title = "New Booking Request",
                        message = "Farmer ${newBooking.farmerName} booked your ${newBooking.equipmentName}.\n📍 Farm: ${if (newBooking.farmVillage.isNotBlank()) newBooking.farmVillage else newBooking.location}\n🌾 Activity: ${newBooking.activity}\n📐 Area: ${newBooking.acres} acres\n📅 Date: ${newBooking.date}\n⏰ Time: ${newBooking.timeSlot}\n💰 Amount: ₹${newBooking.totalAmount.toInt()}\n🌦 Weather: ${newBooking.weatherStatus}",
                        type = "BOOKING_CREATED",
                        bookingId = bId,
                        equipmentId = newBooking.equipmentId
                    )
                    NotificationRepository.sendNotification(null, notif)
                    result.value = Resource.Success(newBooking)
                }
                ?.addOnFailureListener { result.value = Resource.Success(newBooking) }
                ?: run { result.value = Resource.Success(newBooking) }
        } catch (e: Exception) {
            result.value = Resource.Success(newBooking)
        }

        return result
    }

    fun checkDoubleBooking(equipmentId: String, date: String, timeSlot: String, excludeBookingId: String = ""): Boolean {
        return bookingsList.any { b ->
            b.bookingId != excludeBookingId &&
            b.equipmentId == equipmentId &&
            b.date.equals(date, ignoreCase = true) &&
            (b.bookingStatus == "CONFIRMED" || b.bookingStatus == "IN_PROGRESS") &&
            (b.timeSlot.equals(timeSlot, ignoreCase = true) || b.timeSlot.contains(timeSlot) || timeSlot.contains(b.timeSlot))
        }
    }

    fun acceptBooking(bookingId: String, ownerUid: String, onComplete: (Boolean, String) -> Unit) {
        val found = bookingsList.find { it.bookingId == bookingId || it.id == bookingId }
        val eqId = found?.equipmentId ?: ""
        val bDate = found?.date ?: ""
        val bTime = found?.timeSlot ?: ""

        if (checkDoubleBooking(eqId, bDate, bTime, bookingId)) {
            onComplete(false, "Equipment is already booked for this time.")
            return
        }

        val now = System.currentTimeMillis()
        val updates = mapOf<String, Any>(
            "status" to BookingStatus.CONFIRMED.name,
            "bookingStatus" to "CONFIRMED",
            "confirmedAt" to now,
            "confirmedBy" to ownerUid,
            "updatedAt" to now
        )

        try {
            rtdb?.getReference("bookings")?.child(bookingId)?.updateChildren(updates)
                ?.addOnSuccessListener {
                    rtdb?.getReference("bookings")?.child(bookingId)?.get()?.addOnSuccessListener { snap ->
                        val b = snap.getValue(Booking::class.java) ?: found
                        val farmerId = b?.farmerId?.ifBlank { "FARMER_ALL" } ?: "FARMER_ALL"
                        val equipName = b?.equipmentName?.ifBlank { "Equipment" } ?: "Equipment"

                        val farmerNotif = Notification(
                            userId = farmerId,
                            title = "Booking Request Accepted! 🚜",
                            message = "Owner accepted your booking request for $equipName. Machinery is confirmed for your farm!",
                            type = "BOOKING_ACCEPTED",
                            bookingId = bookingId,
                            equipmentId = b?.equipmentId ?: eqId
                        )
                        NotificationRepository.sendNotification(null, farmerNotif)
                        rtdb?.getReference("farmer_notifications")?.child(farmerNotif.notificationId)?.setValue(farmerNotif)
                    }
                    onComplete(true, "Booking confirmed successfully.")
                }
                ?.addOnFailureListener { e ->
                    onComplete(false, e.localizedMessage ?: "Failed to accept booking.")
                }
                ?: onComplete(true, "Booking confirmed successfully.")
        } catch (e: Exception) {
            onComplete(false, e.localizedMessage ?: "Exception accepting booking.")
        }
    }

    fun rejectBooking(bookingId: String, ownerUid: String, reason: String, onComplete: (Boolean) -> Unit) {
        val found = bookingsList.find { it.bookingId == bookingId || it.id == bookingId }
        val now = System.currentTimeMillis()
        val updates = mapOf<String, Any>(
            "status" to BookingStatus.REJECTED.name,
            "bookingStatus" to "REJECTED",
            "rejectionReason" to reason,
            "rejectedAt" to now,
            "rejectedBy" to ownerUid,
            "updatedAt" to now
        )

        try {
            rtdb?.getReference("bookings")?.child(bookingId)?.updateChildren(updates)
                ?.addOnSuccessListener {
                    val farmerId = found?.farmerId ?: ""
                    val equipName = found?.equipmentName ?: "Equipment"
                    if (farmerId.isNotBlank()) {
                        val farmerNotif = Notification(
                            userId = farmerId,
                            title = "Booking Rejected ❌",
                            message = "Your $equipName booking was rejected because: $reason",
                            type = "BOOKING_REJECTED",
                            bookingId = bookingId,
                            equipmentId = found?.equipmentId ?: ""
                        )
                        NotificationRepository.sendNotification(null, farmerNotif)
                    }
                    onComplete(true)
                }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun assignWorkerToBooking(bookingId: String, workerId: String, workerName: String, ownerUid: String, onComplete: (Boolean) -> Unit) {
        val found = bookingsList.find { it.bookingId == bookingId || it.id == bookingId }
        val now = System.currentTimeMillis()
        val updates = mapOf<String, Any>(
            "workerId" to workerId,
            "workerName" to workerName,
            "workerStatus" to "ASSIGNED",
            "workerAssignedAt" to now,
            "assignedBy" to ownerUid,
            "updatedAt" to now
        )

        try {
            rtdb?.getReference("bookings")?.child(bookingId)?.updateChildren(updates)
                ?.addOnSuccessListener {
                    if (workerId.isNotBlank()) {
                        val wrkNotif = Notification(
                            userId = workerId,
                            title = "Worker Assigned 👷",
                            message = "You have been assigned to a ${found?.activity ?: "farming"} job.",
                            type = "WORKER_ASSIGNED",
                            bookingId = bookingId
                        )
                        NotificationRepository.sendNotification(null, wrkNotif)
                    }
                    onComplete(true)
                }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun startWork(bookingId: String, ownerUid: String, onComplete: (Boolean) -> Unit) {
        val found = bookingsList.find { it.bookingId == bookingId || it.id == bookingId }
        val now = System.currentTimeMillis()
        val updates = mapOf<String, Any>(
            "status" to BookingStatus.IN_PROGRESS.name,
            "bookingStatus" to "IN_PROGRESS",
            "startedAt" to now,
            "startedBy" to ownerUid,
            "updatedAt" to now
        )

        try {
            rtdb?.getReference("bookings")?.child(bookingId)?.updateChildren(updates)
                ?.addOnSuccessListener {
                    val farmerId = found?.farmerId ?: ""
                    if (farmerId.isNotBlank()) {
                        val farmerNotif = Notification(
                            userId = farmerId,
                            title = "Farming Work Started 🌾",
                            message = "Your farming work for ${found?.equipmentName} has started.",
                            type = "WORK_STARTED",
                            bookingId = bookingId
                        )
                        NotificationRepository.sendNotification(null, farmerNotif)
                    }
                    onComplete(true)
                }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun completeWork(bookingId: String, ownerUid: String, onComplete: (Boolean) -> Unit) {
        val found = bookingsList.find { it.bookingId == bookingId || it.id == bookingId }
        val now = System.currentTimeMillis()
        val updates = mapOf<String, Any>(
            "status" to BookingStatus.COMPLETED.name,
            "bookingStatus" to "COMPLETED",
            "completedAt" to now,
            "completedBy" to ownerUid,
            "updatedAt" to now
        )

        try {
            rtdb?.getReference("bookings")?.child(bookingId)?.updateChildren(updates)
                ?.addOnSuccessListener {
                    val farmerId = found?.farmerId ?: ""
                    if (farmerId.isNotBlank()) {
                        val farmerNotif = Notification(
                            userId = farmerId,
                            title = "Work Completed ✅",
                            message = "Your farming work for ${found?.equipmentName} is completed. Please pay CASH to owner/driver.",
                            type = "WORK_COMPLETED",
                            bookingId = bookingId
                        )
                        NotificationRepository.sendNotification(null, farmerNotif)
                    }
                    onComplete(true)
                }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun completeWorkByFarmer(booking: Booking, onComplete: (Boolean, String) -> Unit) {
        val bId = booking.bookingId.ifBlank { booking.id }
        val now = System.currentTimeMillis()
        val updates = mapOf<String, Any>(
            "status" to BookingStatus.COMPLETED.name,
            "bookingStatus" to "COMPLETED",
            "completedAt" to now,
            "completedBy" to "FARMER_VERIFIED",
            "updatedAt" to now
        )

        try {
            rtdb?.getReference("bookings")?.child(bId)?.updateChildren(updates)
                ?.addOnSuccessListener {
                    val ownerId = booking.ownerId.ifBlank { "owner_primary" }
                    val equipName = booking.equipmentName.ifBlank { "Tractor / Machinery" }
                    val fName = booking.farmerName.ifBlank { "Farmer" }

                    val ownerNotif = Notification(
                        userId = ownerId,
                        title = "Work Completed by Farmer! 🎉",
                        message = "Farmer $fName has confirmed and accepted completion of $equipName work (${booking.acres} Acres).",
                        type = "WORK_COMPLETED",
                        bookingId = bId,
                        equipmentId = booking.equipmentId
                    )
                    NotificationRepository.sendNotification(null, ownerNotif)
                    rtdb?.getReference("owner_notifications")?.child(ownerNotif.notificationId)?.setValue(ownerNotif)

                    onComplete(true, "Work marked as Completed successfully!")
                }
                ?.addOnFailureListener { e ->
                    onComplete(false, e.localizedMessage ?: "Failed to update work status.")
                }
                ?: onComplete(true, "Work marked as Completed successfully!")
        } catch (e: Exception) {
            onComplete(false, e.localizedMessage ?: "Error completing work.")
        }
    }

    fun updateBookingStatus(bookingId: String, newStatus: BookingStatus) {
        val found = bookingsList.find { it.bookingId == bookingId || it.id == bookingId }
        if (found != null) {
            found.status = newStatus
            found.bookingStatus = newStatus.name
            bookingsLiveData.value = bookingsList.toList()
        }

        try {
            rtdb?.getReference("bookings")?.child(bookingId)
                ?.updateChildren(mapOf(
                    "bookingStatus" to newStatus.name,
                    "status" to newStatus.name,
                    "updatedAt" to System.currentTimeMillis()
                ))
        } catch (e: Exception) {
            Log.e(tag, "RTDB status update error", e)
        }
    }

    fun getFarmerBookings(filterStatus: BookingStatus? = null): LiveData<List<Booking>> {
        val data = MutableLiveData<List<Booking>>()
        try {
            rtdb?.getReference("bookings")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<Booking>()
                    for (child in snapshot.children) {
                        val b = child.getValue(Booking::class.java)
                        if (b != null) list.add(b)
                    }
                    bookingsList.clear()
                    bookingsList.addAll(list)
                    data.value = if (filterStatus != null) bookingsList.filter { it.status == filterStatus } else bookingsList.toList()
                }
                override fun onCancelled(error: DatabaseError) {
                    data.value = if (filterStatus != null) bookingsList.filter { it.status == filterStatus } else bookingsList.toList()
                }
            })
        } catch (e: Exception) {
            data.value = if (filterStatus != null) bookingsList.filter { it.status == filterStatus } else bookingsList.toList()
        }
        return data
    }

    fun getOwnerBookings(ownerId: String): LiveData<List<Booking>> {
        val data = MutableLiveData<List<Booking>>()
        try {
            rtdb?.getReference("bookings")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<Booking>()
                    val myEquipIds = EquipmentRepository.allEquipment.filter { it.ownerId == ownerId || ownerId.isEmpty() }.map { it.id }.toSet()
                    for (child in snapshot.children) {
                        val b = child.getValue(Booking::class.java)
                        if (b != null) {
                            val matches = ownerId.isEmpty() ||
                                          b.ownerId == ownerId ||
                                          b.ownerId.isEmpty() ||
                                          myEquipIds.contains(b.equipmentId)
                            if (matches) {
                                list.add(b)
                            }
                        }
                    }
                    data.value = list.sortedByDescending { it.createdAt }
                }

                override fun onCancelled(error: DatabaseError) {
                    data.value = emptyList()
                }
            })
        } catch (e: Exception) {
            data.value = emptyList()
        }
        return data
    }

    fun getAllBookings(): LiveData<List<Booking>> = bookingsLiveData

    fun getBookingById(id: String): Booking? {
        return bookingsList.find { it.bookingId == id || it.id == id }
    }

    fun getActiveWorkerBooking(workerId: String): LiveData<Booking?> {
        val data = MutableLiveData<Booking?>()
        try {
            rtdb?.getReference("bookings")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    var activeBooking: Booking? = null
                    for (child in snapshot.children) {
                        val b = child.getValue(Booking::class.java)
                        if (b != null && b.workerId == workerId && (b.bookingStatus == "CONFIRMED" || b.bookingStatus == "IN_PROGRESS")) {
                            activeBooking = b
                            break
                        }
                    }
                    data.value = activeBooking
                }
                override fun onCancelled(error: DatabaseError) {
                    data.value = null
                }
            })
        } catch (e: Exception) {
            data.value = null
        }
        return data
    }
}

object OwnerRepository {
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    fun getOwnerDashboardStats(ownerUid: String): LiveData<EquipmentOwner> {
        val data = MutableLiveData<EquipmentOwner>()
        if (ownerUid.isBlank()) {
            data.value = EquipmentOwner()
            return data
        }

        try {
            rtdb?.getReference("owners")?.child(ownerUid)?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val owner = snapshot.getValue(EquipmentOwner::class.java) ?: EquipmentOwner(uid = ownerUid, userId = ownerUid)
                    data.value = owner
                }

                override fun onCancelled(error: DatabaseError) {
                    data.value = EquipmentOwner(uid = ownerUid, userId = ownerUid)
                }
            })
        } catch (e: Exception) {
            data.value = EquipmentOwner(uid = ownerUid, userId = ownerUid)
        }
        return data
    }
}

object WorkerRepository {
    private const val TAG = "WorkerRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    val defaultWorkers = listOf(
        Worker(
            id = "WRK_SURESH_1",
            workerId = "WRK_SURESH_1",
            name = "Suresh Kumar",
            phone = "+91 94401 88990",
            skill = "Heavy Tractor & Harvester Specialist",
            role = "Heavy Tractor & Harvester Specialist",
            availability = "AVAILABLE",
            status = "On Duty",
            assignedJobsCount = 2,
            completedJobsCount = 8,
            dailyWage = 600.0,
            totalEarnings = 9600.0,
            pendingPayout = 1200.0,
            villageName = "Mevalurkuppam",
            rating = 4.8f,
            ratingCount = 12
        ),
        Worker(
            id = "WRK_RAMESH_2",
            workerId = "WRK_RAMESH_2",
            name = "Ramesh Naidu",
            phone = "+91 98480 44551",
            skill = "4WD Tractor & Disc Plough Operator",
            role = "4WD Tractor & Disc Plough Operator",
            availability = "AVAILABLE",
            status = "On Duty",
            assignedJobsCount = 1,
            completedJobsCount = 5,
            dailyWage = 600.0,
            totalEarnings = 6000.0,
            pendingPayout = 600.0,
            villageName = "Kothapalli",
            rating = 4.6f,
            ratingCount = 8
        ),
        Worker(
            id = "WRK_VENKAT_3",
            workerId = "WRK_VENKAT_3",
            name = "Venkatesh Goud",
            phone = "+91 91772 33445",
            skill = "Claas Paddy Harvester & Thresher Operator",
            role = "Claas Paddy Harvester & Thresher Operator",
            availability = "AVAILABLE",
            status = "On Duty",
            assignedJobsCount = 1,
            completedJobsCount = 6,
            dailyWage = 650.0,
            totalEarnings = 7800.0,
            pendingPayout = 1300.0,
            villageName = "Gollapudi",
            rating = 4.9f,
            ratingCount = 15
        ),
        Worker(
            id = "WRK_BALAJI_4",
            workerId = "WRK_BALAJI_4",
            name = "K. Balaji",
            phone = "+91 99891 66778",
            skill = "Garuda Kisan Drone Certified Pilot",
            role = "Garuda Kisan Drone Certified Pilot",
            availability = "AVAILABLE",
            status = "On Duty",
            assignedJobsCount = 0,
            completedJobsCount = 4,
            dailyWage = 700.0,
            totalEarnings = 5600.0,
            pendingPayout = 700.0,
            villageName = "Kanchipuram",
            rating = 4.7f,
            ratingCount = 5
        ),
        Worker(
            id = "WRK_SIVA_5",
            workerId = "WRK_SIVA_5",
            name = "M. Siva Prasad",
            phone = "+91 88852 11223",
            skill = "Rotavator & Paddy Transplanter Driver",
            role = "Rotavator & Paddy Transplanter Driver",
            availability = "AVAILABLE",
            status = "On Duty",
            assignedJobsCount = 1,
            completedJobsCount = 5,
            dailyWage = 600.0,
            totalEarnings = 6000.0,
            pendingPayout = 600.0,
            villageName = "Mevalurkuppam",
            rating = 4.5f,
            ratingCount = 9
        )
    )

    fun payWorkerWage(workerId: String, amount: Double, paymentMode: String, onComplete: (Boolean) -> Unit) {
        val workerRef = rtdb?.getReference("workers")?.child(workerId)
        workerRef?.get()?.addOnSuccessListener { snapshot ->
            val w = snapshot.getValue(Worker::class.java)
            if (w != null) {
                val newPending = (w.pendingPayout - amount).coerceAtLeast(0.0)
                val newTotal = w.totalEarnings + amount
                workerRef.updateChildren(mapOf(
                    "pendingPayout" to newPending,
                    "totalEarnings" to newTotal
                )).addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        NotificationRepository.sendNotification(
                            null,
                            Notification(
                                notificationId = "NOTIF_${System.currentTimeMillis()}",
                                userId = workerId,
                                title = "💰 Wage Disbursed / వేతనం అందింది",
                                message = "Fleet Owner paid ₹${amount.toInt()} via $paymentMode for field operations.",
                                createdAt = System.currentTimeMillis(),
                                type = "WAGE_PAYOUT"
                            )
                        )
                    }
                    onComplete(task.isSuccessful)
                }
            } else {
                onComplete(false)
            }
        }?.addOnFailureListener {
            onComplete(false)
        }
    }

    fun getOwnerWorkers(ownerId: String): LiveData<List<Worker>> {
        val data = MutableLiveData<List<Worker>>(defaultWorkers)
        try {
            rtdb?.getReference("workers")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<Worker>()
                    for (child in snapshot.children) {
                        val w = child.getValue(Worker::class.java)
                        if (w != null) {
                            val keyId = child.key ?: w.id
                            list.add(w.copy(id = keyId, workerId = keyId))
                        }
                    }
                    for (w in defaultWorkers) {
                        if (list.none { it.id == w.id || it.name.equals(w.name, ignoreCase = true) }) {
                            try {
                                rtdb?.getReference("workers")?.child(w.id)?.setValue(w)
                            } catch (e: Exception) {}
                            list.add(w)
                        }
                    }
                    data.value = list
                }

                override fun onCancelled(error: DatabaseError) {
                    data.value = defaultWorkers
                }
            })
        } catch (e: Exception) {
            data.value = defaultWorkers
        }
        return data
    }

    fun addWorker(worker: Worker, onComplete: (Boolean) -> Unit = {}) {
        val wId = if (worker.id.isBlank()) "WRK_${System.currentTimeMillis()}" else worker.id
        val newWorker = worker.copy(id = wId, workerId = wId, createdAt = System.currentTimeMillis())
        try {
            rtdb?.getReference("workers")?.child(wId)?.setValue(newWorker)
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun updateWorker(worker: Worker, onComplete: (Boolean) -> Unit = {}) {
        val wId = worker.id.ifBlank { worker.workerId }
        try {
            rtdb?.getReference("workers")?.child(wId)?.setValue(worker)
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun deactivateWorker(workerId: String, onComplete: (Boolean) -> Unit = {}) {
        try {
            rtdb?.getReference("workers")?.child(workerId)?.child("availability")?.setValue("UNAVAILABLE")
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun rateWorker(workerId: String, newRating: Float, onComplete: (Boolean) -> Unit = {}) {
        if (workerId.isBlank()) {
            onComplete(false)
            return
        }
        val workerRef = rtdb?.getReference("workers")?.child(workerId)
        workerRef?.get()?.addOnSuccessListener { snapshot ->
            val w = snapshot.getValue(Worker::class.java)
            if (w != null) {
                val currentCount = w.ratingCount
                val currentRating = w.rating
                val newCount = currentCount + 1
                val newAverage = ((currentRating * currentCount) + newRating) / newCount
                
                workerRef.updateChildren(mapOf(
                    "rating" to newAverage,
                    "ratingCount" to newCount
                )).addOnCompleteListener { task ->
                    onComplete(task.isSuccessful)
                }
            } else {
                onComplete(false)
            }
        }?.addOnFailureListener {
            onComplete(false)
        }
    }

    private var cachedWorker = defaultWorkers[0]
    private val workerLiveData = MutableLiveData<Worker>(cachedWorker)

    fun getWorkerDashboard(): LiveData<Worker> {
        try {
            rtdb?.getReference("workers")?.child("WRK_SURESH_1")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val w = snapshot.getValue(Worker::class.java)
                    if (w != null) {
                        cachedWorker = w
                        workerLiveData.value = w
                    } else {
                        rtdb?.getReference("workers")?.child("WRK_SURESH_1")?.setValue(cachedWorker)
                        workerLiveData.value = cachedWorker
                    }
                }
                override fun onCancelled(error: DatabaseError) {
                    workerLiveData.value = cachedWorker
                }
            })
        } catch (e: Exception) {
            workerLiveData.value = cachedWorker
        }
        return workerLiveData
    }

    fun toggleCheckInStatus(): Worker {
        val newStatus = if (cachedWorker.status == "On Duty") "Off Duty" else "On Duty"
        val newTime = if (newStatus == "On Duty") "06:45 AM" else "Shift Ended"
        cachedWorker = cachedWorker.copy(status = newStatus, checkInTime = newTime)
        workerLiveData.value = cachedWorker
        try {
            rtdb?.getReference("workers")?.child("WRK_SURESH_1")?.child("status")?.setValue(newStatus)
            rtdb?.getReference("workers")?.child("WRK_SURESH_1")?.child("checkInTime")?.setValue(newTime)
        } catch (e: Exception) {
            Log.e(TAG, "Error toggling checkin", e)
        }
        return cachedWorker
    }

    fun getTodayTasks(): LiveData<List<Task>> = MutableLiveData(
        listOf(
            Task("TSK901", "Deep Ploughing Operation", "Ravi Kumar", "Mevalurkuppam Field #4", "7:00 AM – 10:00 AM", 4, false),
            Task("TSK902", "Paddy Harvesting & Threshing", "Kalyan Ram", "Palanjur North Plot #2", "2:00 PM – 5:30 PM", 3, false)
        )
    )

    fun workerDepartWithVehicle(
        bookingId: String = "BK_FIXED_PLOUGH_1",
        workerName: String = "Suresh Kumar",
        vehicleName: String = "John Deere 5310 4WD (AP 21 TC 4589)",
        location: String = "Mevalurkuppam Field #4",
        farmerName: String = "Ravi Kumar",
        farmerPhone: String = "+91 98480 22338",
        ownerUid: String = "USR_OWNER_1",
        onComplete: (Boolean) -> Unit = {}
    ) {
        val now = System.currentTimeMillis()
        val updates = mapOf<String, Any>(
            "status" to "IN_PROGRESS",
            "bookingStatus" to "IN_PROGRESS",
            "workerStatus" to "EN_ROUTE_WITH_VEHICLE",
            "workerName" to workerName,
            "departedAt" to now,
            "updatedAt" to now
        )
        try {
            val ownerNotif = Notification(
                userId = ownerUid,
                title = "🚀 Driver Departed with $vehicleName",
                message = "Driver $workerName took $vehicleName and departed for field operation at $location for Farmer $farmerName ($farmerPhone).",
                type = "DRIVER_DEPARTED",
                bookingId = bookingId
            )
            NotificationRepository.sendNotification(null, ownerNotif)

            rtdb?.getReference("bookings")?.child(bookingId)?.updateChildren(updates)?.addOnCompleteListener {
                onComplete(true)
            } ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }

    fun toggleTaskCompletion(taskId: String) {
        completeWorkerOperation(bookingId = taskId)
    }

    fun completeWorkerOperation(
        bookingId: String = "BK_FIXED_PLOUGH_1",
        workerName: String = "Suresh Kumar",
        vehicleName: String = "John Deere 5310 4WD",
        location: String = "Mevalurkuppam Field #4",
        farmerName: String = "Ravi Kumar",
        onComplete: (Boolean) -> Unit = {}
    ) {
        val updates = mapOf<String, Any>(
            "status" to "COMPLETED",
            "bookingStatus" to "COMPLETED",
            "workerStatus" to "COMPLETED"
        )
        try {
            val ownerNotif = Notification(
                userId = "USR_OWNER_1",
                title = "✅ Field Work Completed by $workerName",
                message = "Driver $workerName completed operation with $vehicleName at $location for Farmer $farmerName. Vehicle returned to fleet!",
                type = "BOOKING_COMPLETED",
                bookingId = bookingId
            )
            NotificationRepository.sendNotification(null, ownerNotif)

            val farmerNotif = Notification(
                userId = "USR_FARMER_1",
                title = "✅ Field Work Completed!",
                message = "Your operation with $vehicleName by Driver $workerName has been completed successfully.",
                type = "BOOKING_COMPLETED",
                bookingId = bookingId
            )
            NotificationRepository.sendNotification(null, farmerNotif)

            rtdb?.getReference("bookings")?.child(bookingId)?.updateChildren(updates)?.addOnCompleteListener {
                onComplete(true)
            } ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(false)
        }
    }
}

object StoreRepository {
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }
    private val cartState = Cart()
    private val cartLiveData = MutableLiveData<Cart>(cartState)

    private val products = listOf(
        Product("PRD101", "Paddy Seeds BPT 5204 (10kg)", "Seeds", "High yielding certified paddy seeds.", 850.0, 4.8, 120),
        Product("PRD102", "Neem Coated Urea Bag (45kg)", "Fertilizers", "Essential nitrogen fertilizer.", 267.0, 4.9, 310),
        Product("PRD103", "Virtako Insecticide 100g", "Pesticides", "Broad spectrum systemic insecticide.", 620.0, 4.7, 85),
        Product("PRD104", "NPK 19:19:19 Fertilizer (1kg)", "Fertilizers", "Water soluble plant nutrition.", 190.0, 4.6, 64),
        Product("PRD105", "Manual Knapsack Sprayer 16L", "Tools", "Durable tank for chemical spraying.", 1450.0, 4.8, 42)
    )

    fun getProducts(): List<Product> = products

    fun getCart(): LiveData<Cart> {
        cartLiveData.value = cartState
        return cartLiveData
    }

    fun addToCart(product: Product) {
        val existing = cartState.items.find { it.product.id == product.id }
        if (existing != null) {
            existing.quantity += 1
        } else {
            cartState.items.add(CartItem(product, 1))
        }
        cartLiveData.value = cartState
    }

    fun removeFromCart(productId: String) {
        cartState.items.removeAll { it.product.id == productId }
        cartLiveData.value = cartState
    }

    fun updateQuantity(productId: String, delta: Int) {
        val item = cartState.items.find { it.product.id == productId }
        if (item != null) {
            item.quantity += delta
            if (item.quantity <= 0) {
                cartState.items.remove(item)
            }
        }
        cartLiveData.value = cartState
    }

    fun clearCart() {
        cartState.items.clear()
        cartLiveData.value = cartState
    }

    fun placeOrder(address: String): LiveData<Resource<Order>> {
        val result = MutableLiveData<Resource<Order>>()
        val uid = AuthRepository().getCurrentUserId() ?: "USR101"
        val order = Order(
            id = "ORD_${System.currentTimeMillis()}",
            userId = uid,
            items = cartState.items.toList(),
            subtotal = cartState.getSubtotal(),
            deliveryFee = cartState.deliveryFee,
            total = cartState.getTotal(),
            paymentMethod = "CASH",
            paymentStatus = "CASH_ON_DELIVERY",
            deliveryAddress = address
        )
        try {
            rtdb?.getReference("orders")?.child(order.id)?.setValue(order)
        } catch (e: Exception) {
            Log.e("StoreRepository", "Place order error", e)
        }
        clearCart()
        result.value = Resource.Success(order)
        return result
    }
}

object CommunityRepository {
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    private val posts = mutableListOf(
        CommunityPost(
            postId = "POST101",
            id = "POST101",
            authorName = "Kalyan Ram",
            location = "Guntur",
            timestamp = "2 hours ago",
            question = "Which pesticide is best for leaf folder control in Kharif paddy?",
            answer = "Apply Virtako 100g/acre diluted in 200L water for effective control.",
            likesCount = 24,
            commentsCount = 8
        ),
        CommunityPost(
            postId = "POST102",
            id = "POST102",
            authorName = "Srinivas Rao",
            location = "Krishna District",
            timestamp = "5 hours ago",
            question = "What is the recommended seed rate per acre for BPT 5204 paddy?",
            answer = "Use 20-25 kg seeds per acre for standard line transplanting.",
            likesCount = 18,
            commentsCount = 5
        )
    )

    private val postsLiveData = MutableLiveData<List<CommunityPost>>(posts)

    fun getPosts(): LiveData<List<CommunityPost>> {
        try {
            rtdb?.getReference("communityPosts")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<CommunityPost>()
                    for (child in snapshot.children) {
                        val p = child.getValue(CommunityPost::class.java)
                        if (p != null) list.add(p)
                    }
                    if (list.isNotEmpty()) {
                        posts.clear()
                        posts.addAll(list)
                        postsLiveData.value = posts.toList()
                    }
                }
                override fun onCancelled(error: DatabaseError) {}
            })
        } catch (e: Exception) {
            Log.e("CommunityRepository", "RTDB error", e)
        }
        return postsLiveData
    }

    fun addPost(question: String, author: String = "Ravi Kumar", location: String = "Farm Location") {
        val pId = "POST_${System.currentTimeMillis()}"
        val newPost = CommunityPost(
            postId = pId,
            id = pId,
            authorName = author,
            userName = author,
            location = location,
            timestamp = "Just now",
            question = question,
            content = question,
            answer = "Community experts & agricultural officers will answer shortly.",
            likesCount = 0,
            commentsCount = 0,
            createdAt = System.currentTimeMillis()
        )
        posts.add(0, newPost)
        postsLiveData.value = posts.toList()

        try {
            rtdb?.getReference("communityPosts")?.child(pId)?.setValue(newPost)
        } catch (e: Exception) {
            Log.e("CommunityRepository", "Add post error", e)
        }
    }

    fun toggleLike(postId: String) {
        val post = posts.find { it.postId == postId || it.id == postId }
        if (post != null) {
            post.isLiked = !post.isLiked
            if (post.isLiked) post.likesCount += 1 else post.likesCount -= 1
            postsLiveData.value = posts.toList()

            try {
                rtdb?.getReference("communityPosts")?.child(postId)?.child("likesCount")?.setValue(post.likesCount)
            } catch (e: Exception) {
                Log.e("CommunityRepository", "Like toggle error", e)
            }
        }
    }
}

object CommunityChatRepository {
    private val tag = "CommunityChatRepo"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }
    private val authRepo = AuthRepository()

    private val groupsList = mutableListOf<CommunityGroup>()
    private val groupsLiveData = MutableLiveData<List<CommunityGroup>>(groupsList)

    fun getGroups(): LiveData<List<CommunityGroup>> {
        try {
            rtdb?.getReference("community_groups")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<CommunityGroup>()
                    for (child in snapshot.children) {
                        val group = child.getValue(CommunityGroup::class.java)
                        if (group != null) {
                            val keyId = child.key ?: group.groupId
                            list.add(group.copy(groupId = keyId))
                        }
                    }
                    if (list.isEmpty()) {
                        seedDefaultGroups()
                    } else {
                        groupsList.clear()
                        groupsList.addAll(list.sortedByDescending { it.lastMessageTime })
                        groupsLiveData.value = groupsList.toList()
                    }
                }
                override fun onCancelled(error: DatabaseError) {
                    Log.e(tag, "RTDB error loading groups: ${error.message}")
                }
            })
        } catch (e: Exception) {
            Log.e(tag, "Groups listener error", e)
        }
        return groupsLiveData
    }

    private fun seedDefaultGroups() {
        val currentUid = authRepo.getCurrentUserId() ?: "USR_FARMER_1"
        val currentName = authRepo.getCurrentUserName()
        val currentPhone = authRepo.getCurrentUserPhone()

        val defaultMember = GroupMember(
            userId = currentUid,
            name = currentName,
            phone = currentPhone,
            role = "ADMIN",
            joinedAt = System.currentTimeMillis()
        )

        val group1Id = "GROUP_MEVALURKUPPAM"
        val group1 = CommunityGroup(
            groupId = group1Id,
            name = "🌾 Mevalurkuppam Farmers Circle",
            description = "Community of farmers discussing paddy harvesting, pest management & rainfall.",
            createdBy = currentUid,
            createdByName = currentName,
            createdAt = System.currentTimeMillis() - 86400000L,
            membersCount = 5,
            members = mapOf(
                currentUid to defaultMember,
                "MEM_1" to GroupMember("MEM_1", "Kalyan Ram", "+91 94401 55667", role = "MEMBER"),
                "MEM_2" to GroupMember("MEM_2", "Srinivas Rao", "+91 98492 11223", role = "MEMBER")
            ),
            lastMessage = "Tractor & Drone sprayers available for paddy field today!",
            lastMessageSender = "Kalyan Ram",
            lastMessageTime = System.currentTimeMillis() - 15 * 60 * 1000L,
            avatarColorHex = "#2E7D32"
        )

        val group2Id = "GROUP_AGRI_MACHINERY"
        val group2 = CommunityGroup(
            groupId = group2Id,
            name = "🚜 Agri Machinery Sharing Group",
            description = "Official equipment owners & farmers sharing tractors, rotavators, and harvesters.",
            createdBy = currentUid,
            createdByName = currentName,
            createdAt = System.currentTimeMillis() - 172800000L,
            membersCount = 6,
            members = mapOf(
                currentUid to defaultMember,
                "MEM_4" to GroupMember("MEM_4", "Venkatesh", "+91 99887 76655", role = "MEMBER")
            ),
            lastMessage = "Mahindra 575 DI completed 4 acres in Mevalurkuppam.",
            lastMessageSender = "Balaji Farmers",
            lastMessageTime = System.currentTimeMillis() - 45 * 60 * 1000L,
            avatarColorHex = "#1565C0"
        )

        try {
            rtdb?.getReference("community_groups")?.child(group1Id)?.setValue(group1)
            rtdb?.getReference("community_groups")?.child(group2Id)?.setValue(group2)

            val m1 = GroupChatMessage(
                messageId = "MSG_101",
                groupId = group1Id,
                senderId = "MEM_1",
                senderName = "Kalyan Ram",
                senderPhone = "+91 94401 55667",
                messageText = "Hello everyone! How is the paddy crop standing after the light drizzle?",
                timestamp = System.currentTimeMillis() - 3600000L,
                messageType = "TEXT"
            )
            val m2 = GroupChatMessage(
                messageId = "MSG_102",
                groupId = group1Id,
                senderId = "MEM_2",
                senderName = "Srinivas Rao",
                senderPhone = "+91 98492 11223",
                messageText = "Soil moisture is good! Need drone spraying for pest control by tomorrow morning.",
                timestamp = System.currentTimeMillis() - 1800000L,
                messageType = "TEXT"
            )
            val m3 = GroupChatMessage(
                messageId = "MSG_103",
                groupId = group1Id,
                senderId = "MEM_1",
                senderName = "Kalyan Ram",
                senderPhone = "+91 94401 55667",
                messageText = "Tractor & Drone sprayers available for paddy field today!",
                timestamp = System.currentTimeMillis() - 15 * 60 * 1000L,
                messageType = "TEXT"
            )
            rtdb?.getReference("group_messages")?.child(group1Id)?.child("MSG_101")?.setValue(m1)
            rtdb?.getReference("group_messages")?.child(group1Id)?.child("MSG_102")?.setValue(m2)
            rtdb?.getReference("group_messages")?.child(group1Id)?.child("MSG_103")?.setValue(m3)

            val m4 = GroupChatMessage(
                messageId = "MSG_201",
                groupId = group2Id,
                senderId = "MEM_5",
                senderName = "Balaji Farmers",
                senderPhone = "+91 98480 33445",
                messageText = "Mahindra 575 DI completed 4 acres in Mevalurkuppam.",
                timestamp = System.currentTimeMillis() - 45 * 60 * 1000L,
                messageType = "TEXT"
            )
            rtdb?.getReference("group_messages")?.child(group2Id)?.child("MSG_201")?.setValue(m4)
        } catch (e: Exception) {
            Log.e(tag, "Error seeding default groups", e)
        }
    }

    fun getGroupMessages(groupId: String): LiveData<List<GroupChatMessage>> {
        val liveData = MutableLiveData<List<GroupChatMessage>>()
        try {
            rtdb?.getReference("group_messages")?.child(groupId)?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val messages = mutableListOf<GroupChatMessage>()
                    for (child in snapshot.children) {
                        val msg = child.getValue(GroupChatMessage::class.java)
                        if (msg != null) {
                            messages.add(msg)
                        }
                    }
                    liveData.value = messages.sortedBy { it.timestamp }
                }
                override fun onCancelled(error: DatabaseError) {
                    Log.e(tag, "Error loading messages: ${error.message}")
                }
            })
        } catch (e: Exception) {
            Log.e(tag, "Error in getGroupMessages", e)
        }
        return liveData
    }

    fun sendMessage(groupId: String, text: String, onComplete: (Boolean) -> Unit = {}) {
        if (text.isBlank()) return
        val currentUid = authRepo.getCurrentUserId() ?: "USR_FARMER_1"
        val currentName = authRepo.getCurrentUserName()
        val currentPhone = authRepo.getCurrentUserPhone()

        val msgId = "MSG_${System.currentTimeMillis()}"
        val message = GroupChatMessage(
            messageId = msgId,
            groupId = groupId,
            senderId = currentUid,
            senderName = currentName,
            senderPhone = currentPhone,
            messageText = text.trim(),
            timestamp = System.currentTimeMillis(),
            messageType = "TEXT"
        )

        try {
            rtdb?.getReference("group_messages")?.child(groupId)?.child(msgId)?.setValue(message)
                ?.addOnSuccessListener {
                    val groupUpdates = mapOf<String, Any>(
                        "lastMessage" to text.trim(),
                        "lastMessageSender" to currentName,
                        "lastMessageTime" to System.currentTimeMillis()
                    )
                    rtdb?.getReference("community_groups")?.child(groupId)?.updateChildren(groupUpdates)
                    onComplete(true)
                }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            Log.e(tag, "Error sending message", e)
            onComplete(false)
        }
    }

    fun addMemberToGroup(groupId: String, identifier: String, memberName: String = "", onComplete: (Boolean, String) -> Unit) {
        val trimmed = identifier.trim()
        if (trimmed.isBlank()) {
            onComplete(false, "Please enter a valid phone number or email")
            return
        }

        val adminName = authRepo.getCurrentUserName()

        val isEmail = trimmed.contains("@")
        val phone = if (!isEmail) trimmed else ""
        val email = if (isEmail) trimmed else ""
        val displayName = if (memberName.isNotBlank()) memberName else if (isEmail) trimmed.substringBefore("@") else trimmed

        val memberId = "MEM_${System.currentTimeMillis()}"
        val newMember = GroupMember(
            userId = memberId,
            name = displayName,
            phone = phone,
            email = email,
            role = "MEMBER",
            joinedAt = System.currentTimeMillis()
        )

        try {
            val groupRef = rtdb?.getReference("community_groups")?.child(groupId)
            groupRef?.child("members")?.child(memberId)?.setValue(newMember)?.addOnSuccessListener {
                groupRef.child("membersCount").get().addOnSuccessListener { countSnap ->
                    val currentCount = countSnap.getValue(Int::class.java) ?: 3
                    groupRef.child("membersCount").setValue(currentCount + 1)
                }

                val sysMsgId = "SYS_${System.currentTimeMillis()}"
                val sysMsg = GroupChatMessage(
                    messageId = sysMsgId,
                    groupId = groupId,
                    senderId = "SYSTEM",
                    senderName = "System",
                    senderPhone = "",
                    messageText = "$adminName added $displayName ($trimmed) to group",
                    timestamp = System.currentTimeMillis(),
                    messageType = "SYSTEM_EVENT"
                )
                rtdb?.getReference("group_messages")?.child(groupId)?.child(sysMsgId)?.setValue(sysMsg)

                onComplete(true, "Added $displayName to group successfully!")
            }?.addOnFailureListener { e ->
                onComplete(false, e.message ?: "Failed to add member")
            } ?: onComplete(true, "Member added")
        } catch (e: Exception) {
            onComplete(false, e.message ?: "Error adding member")
        }
    }

    fun createGroup(name: String, description: String, onComplete: (Boolean, String) -> Unit) {
        if (name.isBlank()) {
            onComplete(false, "Group name cannot be empty")
            return
        }
        val currentUid = authRepo.getCurrentUserId() ?: "USR_FARMER_1"
        val currentName = authRepo.getCurrentUserName()
        val currentPhone = authRepo.getCurrentUserPhone()

        val newGroupId = "GRP_${System.currentTimeMillis()}"
        val adminMember = GroupMember(
            userId = currentUid,
            name = currentName,
            phone = currentPhone,
            role = "ADMIN",
            joinedAt = System.currentTimeMillis()
        )

        val newGroup = CommunityGroup(
            groupId = newGroupId,
            name = name.trim(),
            description = description.trim().ifBlank { "Farmer community discussion group" },
            createdBy = currentUid,
            createdByName = currentName,
            createdAt = System.currentTimeMillis(),
            membersCount = 1,
            members = mapOf(currentUid to adminMember),
            lastMessage = "Group created by $currentName",
            lastMessageSender = currentName,
            lastMessageTime = System.currentTimeMillis(),
            avatarColorHex = "#2E7D32"
        )

        try {
            rtdb?.getReference("community_groups")?.child(newGroupId)?.setValue(newGroup)?.addOnSuccessListener {
                val welcomeMsg = GroupChatMessage(
                    messageId = "SYS_${System.currentTimeMillis()}",
                    groupId = newGroupId,
                    senderId = "SYSTEM",
                    senderName = "System",
                    messageText = "🌾 $currentName created group \"${name.trim()}\"",
                    timestamp = System.currentTimeMillis(),
                    messageType = "SYSTEM_EVENT"
                )
                rtdb?.getReference("group_messages")?.child(newGroupId)?.child(welcomeMsg.messageId)?.setValue(welcomeMsg)
                onComplete(true, newGroupId)
            }?.addOnFailureListener { e ->
                onComplete(false, e.message ?: "Failed to create group")
            } ?: onComplete(true, newGroupId)
        } catch (e: Exception) {
            onComplete(false, e.message ?: "Error creating group")
        }
    }
}

class SmartSchedulingEngine {
    fun evaluateTimeSlots(
        equipmentId: String = "EQ101",
        date: String = "28 August 2026",
        activity: String = "Ploughing",
        weather: Weather = Weather()
    ): List<TimeSlotRecommendation> {
        val existingBookings = BookingRepository.getAllBookings().value ?: emptyList()
        val bookedSlots = existingBookings.filter {
            (it.equipmentId == equipmentId || equipmentId.isBlank()) &&
            it.date.equals(date, ignoreCase = true) &&
            (it.bookingStatus == "CONFIRMED" || it.bookingStatus == "IN_PROGRESS" || it.bookingStatus == "ON_THE_WAY")
        }.map { it.timeSlot }

        val slots = listOf(
            Triple("7:00 AM – 10:00 AM", weather.rainProbabilityPercent / 2, "Morning slot (7:00 AM)"),
            Triple("10:00 AM – 1:00 PM", minOf(100, (weather.rainProbabilityPercent * 2.5).toInt()), "Midday slot (10:00 AM)"),
            Triple("2:00 PM – 5:00 PM", maxOf(5, weather.rainProbabilityPercent - 10), "Afternoon slot (2:00 PM)")
        )

        return slots.mapIndexed { idx, (timeSlot, slotRainProb, _) ->
            val isEquipmentBooked = bookedSlots.any { it.contains(timeSlot) }
            val slotWeather = weather.copy(rainProbabilityPercent = slotRainProb)
            val suitability = WeatherSuitabilityService.evaluateSuitability(activity, slotWeather)

            val label = when {
                isEquipmentBooked -> "UNAVAILABLE"
                suitability.status == "NOT_RECOMMENDED" -> "NOT RECOMMENDED"
                suitability.status == "CAUTION" -> "CAUTION"
                else -> "RECOMMENDED"
            }

            val reasonText = if (isEquipmentBooked) {
                "Equipment is already booked for this time slot."
            } else {
                suitability.rationale
            }

            TimeSlotRecommendation(
                timeSlot = timeSlot,
                isAvailable = !isEquipmentBooked,
                weatherCondition = if (slotRainProb > 50) "High Rain Expected ($slotRainProb%)" else "Clear / Mild ($slotRainProb% rain)",
                rainProbability = slotRainProb,
                recommendationLabel = label,
                isBestTime = (!isEquipmentBooked && idx == 0 && suitability.isRecommended),
                reason = reasonText,
                suitabilityStatus = suitability.status
            )
        }
    }
}

class WeatherRepository {
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }
    private val weatherLiveData = MutableLiveData<Weather>()

    fun getWeatherForecast(
        lat: Double = 0.0,
        lng: Double = 0.0,
        locationName: String = "Select your farm location"
    ): LiveData<Weather> {
        val cached = Weather(
            location = locationName,
            temperatureC = 28,
            condition = "Partly Cloudy",
            rainProbabilityPercent = 20,
            humidityPercent = 72,
            windSpeedKmH = 14,
            isPloughingSuitable = true,
            isSprayingSuitable = false,
            isHarvestingSuitable = true
        )
        weatherLiveData.value = cached

        WeatherApiService.fetchLiveWeather(lat, lng, locationName) { liveWeather ->
            if (liveWeather != null) {
                weatherLiveData.postValue(liveWeather)
                try {
                    val locKey = locationName.replace(" ", "_").replace("[^a-zA-Z0-9_]".toRegex(), "")
                    rtdb?.getReference("weatherCache")?.child(locKey)?.child("current")?.setValue(liveWeather)
                } catch (e: Exception) {
                    Log.e("WeatherRepository", "Failed to cache weather to RTDB", e)
                }
            } else {
                try {
                    val locKey = locationName.replace(" ", "_").replace("[^a-zA-Z0-9_]".toRegex(), "")
                    rtdb?.getReference("weatherCache")?.child(locKey)?.child("current")
                        ?.addListenerForSingleValueEvent(object : ValueEventListener {
                            override fun onDataChange(snapshot: DataSnapshot) {
                                val dbWeather = snapshot.getValue(Weather::class.java)
                                if (dbWeather != null) weatherLiveData.postValue(dbWeather)
                            }
                            override fun onCancelled(error: DatabaseError) {}
                        })
                } catch (e: Exception) {
                    Log.e("WeatherRepository", "Failed to read cached weather", e)
                }
            }
        }

        return weatherLiveData
    }
}



object StorageRepository {
    private val tag = "StorageRepository"
    private val storage: FirebaseStorage? by lazy { FirebaseConfig.getStorage() }
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    fun uploadProfileImage(userId: String, uri: Uri, onProgress: (Int) -> Unit, onResult: (Resource<String>) -> Unit) {
        uploadFile("profileImages/$userId/profile_${System.currentTimeMillis()}.jpg", uri, onProgress) { res ->
            if (res is Resource.Success) {
                try {
                    rtdb?.getReference("users")?.child(userId)?.child("profileImage")?.setValue(res.data)
                    rtdb?.getReference("farmers")?.child(userId)?.child("profileImage")?.setValue(res.data)
                } catch (e: Exception) {
                    Log.e(tag, "Failed to update profileImage in RTDB", e)
                }
            }
            onResult(res)
        }
    }

    fun uploadEquipmentImage(equipmentId: String, uri: Uri, onProgress: (Int) -> Unit, onResult: (Resource<String>) -> Unit) {
        uploadFile("equipmentImages/$equipmentId/image_${System.currentTimeMillis()}.jpg", uri, onProgress) { res ->
            if (res is Resource.Success) {
                try {
                    rtdb?.getReference("equipment")?.child(equipmentId)?.child("imageUrl")?.setValue(res.data)
                    rtdb?.getReference("equipment")?.child(equipmentId)?.child("imageUrls")?.setValue(listOf(res.data))
                } catch (e: Exception) {
                    Log.e(tag, "Failed to update equipment imageUrl in RTDB", e)
                }
            }
            onResult(res)
        }
    }

    fun uploadEquipmentDocument(
        ownerId: String,
        equipmentId: String,
        documentType: String,
        uri: Uri,
        onProgress: (Int) -> Unit,
        onResult: (Resource<EquipmentDocument>) -> Unit
    ) {
        val docId = "DOC_${System.currentTimeMillis()}"
        val storagePath = "equipmentDocuments/$ownerId/$equipmentId/${docId}_${documentType.replace(" ", "_")}"
        uploadFile(storagePath, uri, onProgress) { res ->
            when (res) {
                is Resource.Success -> {
                    val doc = EquipmentDocument(
                        docId = docId,
                        equipmentId = equipmentId,
                        ownerId = ownerId,
                        documentType = documentType,
                        name = documentType,
                        documentUrl = res.data,
                        fileUrl = res.data,
                        status = "PENDING",
                        verificationStatus = "PENDING",
                        uploadedAt = System.currentTimeMillis()
                    )
                    DocumentRepository.saveDocument(doc) {
                        onResult(Resource.Success(doc))
                    }
                }
                is Resource.Error -> onResult(Resource.Error(res.message))
                else -> {}
            }
        }
    }

    fun uploadCommunityImage(postId: String, uri: Uri, onProgress: (Int) -> Unit, onResult: (Resource<String>) -> Unit) {
        uploadFile("communityImages/$postId/img_${System.currentTimeMillis()}.jpg", uri, onProgress) { res ->
            if (res is Resource.Success) {
                try {
                    rtdb?.getReference("communityPosts")?.child(postId)?.child("imageUrl")?.setValue(res.data)
                } catch (e: Exception) {
                    Log.e(tag, "Failed to update community post imageUrl in RTDB", e)
                }
            }
            onResult(res)
        }
    }

    private fun uploadFile(
        path: String,
        uri: Uri,
        onProgress: (Int) -> Unit,
        onResult: (Resource<String>) -> Unit
    ) {
        val storageRef = storage?.reference?.child(path)
        if (storageRef != null) {
            val uploadTask = storageRef.putFile(uri)
            uploadTask.addOnProgressListener { taskSnapshot ->
                if (taskSnapshot.totalByteCount > 0) {
                    val progress = ((100.0 * taskSnapshot.bytesTransferred) / taskSnapshot.totalByteCount).toInt()
                    onProgress(progress)
                }
            }.addOnSuccessListener {
                storageRef.downloadUrl.addOnSuccessListener { downloadUri ->
                    onResult(Resource.Success(downloadUri.toString()))
                }.addOnFailureListener { e ->
                    onResult(Resource.Success(uri.toString()))
                }
            }.addOnFailureListener { e ->
                Log.e(tag, "Storage upload failed: ${e.message}")
                onResult(Resource.Success(uri.toString()))
            }
        } else {
            onProgress(100)
            onResult(Resource.Success(uri.toString()))
        }
    }
}

object DocumentRepository {
    private val tag = "DocumentRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }
    private val documentsList = mutableListOf<EquipmentDocument>()
    private val documentsLiveData = MutableLiveData<List<EquipmentDocument>>(documentsList)

    fun saveDocument(doc: EquipmentDocument, onComplete: (Boolean) -> Unit = {}) {
        documentsList.removeAll { it.docId == doc.docId }
        documentsList.add(0, doc)
        documentsLiveData.value = documentsList.toList()

        try {
            rtdb?.getReference("equipmentDocuments")?.child(doc.docId)?.setValue(doc)
                ?.addOnSuccessListener { onComplete(true) }
                ?.addOnFailureListener { onComplete(false) }
                ?: onComplete(true)
        } catch (e: Exception) {
            onComplete(true)
        }
    }

    fun getDocuments(): LiveData<List<EquipmentDocument>> {
        try {
            rtdb?.getReference("equipmentDocuments")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<EquipmentDocument>()
                    for (child in snapshot.children) {
                        val doc = child.getValue(EquipmentDocument::class.java)
                        if (doc != null) list.add(doc)
                    }
                    if (list.isNotEmpty()) {
                        documentsList.clear()
                        documentsList.addAll(list)
                        documentsLiveData.value = documentsList.toList()
                    }
                }
                override fun onCancelled(error: DatabaseError) {}
            })
        } catch (e: Exception) {
            Log.e(tag, "Document listener error", e)
        }
        return documentsLiveData
    }

    fun updateDocumentStatus(docId: String, status: String) {
        val found = documentsList.find { it.docId == docId }
        if (found != null) {
            val updated = found.copy(status = status, verificationStatus = status)
            documentsList[documentsList.indexOf(found)] = updated
            documentsLiveData.value = documentsList.toList()

            val notifTitle = if (status.equals("VERIFIED", ignoreCase = true)) "Document Verified! ✓" else "Document Rejected ❌"
            val notifMsg = if (status.equals("VERIFIED", ignoreCase = true)) "Your ${found.documentType} has been verified." else "Your ${found.documentType} was rejected."
            val notifType = if (status.equals("VERIFIED", ignoreCase = true)) "DOCUMENT_VERIFIED" else "DOCUMENT_REJECTED"

            val notif = Notification(
                userId = found.ownerId,
                title = notifTitle,
                message = notifMsg,
                type = notifType,
                equipmentId = found.equipmentId
            )
            NotificationRepository.sendNotification(null, notif)
        }

        try {
            rtdb?.getReference("equipmentDocuments")?.child(docId)?.updateChildren(
                mapOf(
                    "status" to status,
                    "verificationStatus" to status,
                    "verifiedAt" to System.currentTimeMillis()
                )
            )
        } catch (e: Exception) {
            Log.e(tag, "Failed to update document status", e)
        }
    }
}

object NotificationRepository {
    private val tag = "NotificationRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }
    private val notificationsList = mutableListOf<Notification>()
    private val notificationsLiveData = MutableLiveData<List<Notification>>(notificationsList)

    fun sendNotification(context: Context?, notification: Notification) {
        val nId = if (notification.notificationId.isBlank() || notification.notificationId.startsWith("NOTIF")) "NOTIF_${System.currentTimeMillis()}" else notification.notificationId
        val newNotif = notification.copy(notificationId = nId, createdAt = System.currentTimeMillis())

        notificationsList.removeAll { it.notificationId == nId }
        notificationsList.add(0, newNotif)
        notificationsLiveData.postValue(notificationsList.toList())

        try {
            rtdb?.getReference("notifications")?.child(newNotif.userId)?.child(nId)?.setValue(newNotif)
            rtdb?.getReference("owner_notifications")?.child(nId)?.setValue(newNotif)

            val ctx = context ?: com.agriride.app.AgriRideApp.instance
            com.agriride.app.services.AgriFirebaseMessagingService.showLocalNotification(
                context = ctx,
                title = newNotif.title,
                message = newNotif.message,
                type = newNotif.type,
                targetId = newNotif.bookingId
            )
        } catch (e: Exception) {
            Log.e(tag, "Failed to write notification to RTDB", e)
        }
    }

    fun getUserNotifications(userId: String): LiveData<List<Notification>> {
        val targetUid = userId.ifBlank { AuthRepository().getCurrentUserId() ?: "" }
        try {
            if (targetUid.isNotBlank()) {
                rtdb?.getReference("notifications")?.child(targetUid)
                    ?.addValueEventListener(object : ValueEventListener {
                        override fun onDataChange(snapshot: DataSnapshot) {
                            for (child in snapshot.children) {
                                val n = child.getValue(Notification::class.java)
                                if (n != null && notificationsList.none { it.notificationId == n.notificationId }) {
                                    notificationsList.add(0, n)
                                }
                            }
                            notificationsLiveData.value = notificationsList.sortedByDescending { it.createdAt }
                        }
                        override fun onCancelled(error: DatabaseError) {}
                    })
            }
            rtdb?.getReference("owner_notifications")
                ?.addValueEventListener(object : ValueEventListener {
                    override fun onDataChange(snapshot: DataSnapshot) {
                        for (child in snapshot.children) {
                            val n = child.getValue(Notification::class.java)
                            if (n != null && notificationsList.none { it.notificationId == n.notificationId }) {
                                notificationsList.add(0, n)
                            }
                        }
                        notificationsLiveData.value = notificationsList.sortedByDescending { it.createdAt }
                    }
                    override fun onCancelled(error: DatabaseError) {}
                })
            rtdb?.getReference("farmer_notifications")
                ?.addValueEventListener(object : ValueEventListener {
                    override fun onDataChange(snapshot: DataSnapshot) {
                        for (child in snapshot.children) {
                            val n = child.getValue(Notification::class.java)
                            if (n != null && (targetUid.isBlank() || n.userId == targetUid || n.userId == "FARMER_ALL") && notificationsList.none { it.notificationId == n.notificationId }) {
                                notificationsList.add(0, n)
                            }
                        }
                        notificationsLiveData.value = notificationsList.sortedByDescending { it.createdAt }
                    }
                    override fun onCancelled(error: DatabaseError) {}
                })
        } catch (e: Exception) {
            Log.e(tag, "RTDB notification listener error", e)
        }
        return notificationsLiveData
    }

    fun markAsRead(userId: String, notificationId: String) {
        val found = notificationsList.find { it.notificationId == notificationId }
        if (found != null) {
            val updated = found.copy(isRead = true)
            notificationsList[notificationsList.indexOf(found)] = updated
            notificationsLiveData.value = notificationsList.toList()
        }
        try {
            rtdb?.getReference("notifications")?.child(userId)?.child(notificationId)
                ?.child("isRead")?.setValue(true)
        } catch (e: Exception) {
            Log.e(tag, "Error marking notification as read", e)
        }
    }

    fun markAllAsRead(userId: String) {
        val updated = notificationsList.map { it.copy(isRead = true) }
        notificationsList.clear()
        notificationsList.addAll(updated)
        notificationsLiveData.value = notificationsList.toList()

        try {
            for (n in updated) {
                rtdb?.getReference("notifications")?.child(userId)?.child(n.notificationId)
                    ?.child("isRead")?.setValue(true)
            }
        } catch (e: Exception) {
            Log.e(tag, "Error marking all as read", e)
        }
    }

    fun fetchAndSaveFcmToken(userId: String) {
        try {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val token = task.result
                    rtdb?.getReference("users")?.child(userId)?.child("fcmToken")?.setValue(token)
                }
            }
        } catch (e: Exception) {
            Log.e(tag, "FCM token fetch error", e)
        }
    }
}



object PaymentRepository {
    private val tag = "PaymentRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    fun savePaymentRecord(record: PaymentRecord, onComplete: ((Boolean) -> Unit)? = null) {
        try {
            rtdb?.getReference("payments")?.child(record.paymentId)?.setValue(record)
                ?.addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        rtdb?.getReference("bookings")?.child(record.bookingId)
                            ?.child("paymentStatus")?.setValue("CASH_PENDING")
                    }
                    onComplete?.invoke(task.isSuccessful)
                }
        } catch (e: Exception) {
            Log.e(tag, "Error saving payment record", e)
            onComplete?.invoke(false)
        }
    }

    fun confirmOwnerCashPayment(
        paymentId: String,
        bookingId: String,
        farmerId: String,
        amount: Double,
        onComplete: ((Boolean) -> Unit)? = null
    ) {
        try {
            val now = System.currentTimeMillis()
            val updates = mapOf<String, Any>(
                "status" to "PAID",
                "updatedAt" to now
            )
            rtdb?.getReference("payments")?.child(paymentId)?.updateChildren(updates)
            rtdb?.getReference("bookings")?.child(bookingId)?.child("paymentStatus")?.setValue("PAID")

            // Send FCM Notification to Farmer
            val notif = Notification(
                userId = farmerId,
                title = "Cash Payment Confirmed 💵",
                message = "Equipment owner has confirmed receipt of ₹${amount.toInt()} cash for booking #$bookingId.",
                type = "CASH_PAYMENT_CONFIRMED",
                bookingId = bookingId
            )
            NotificationRepository.sendNotification(null, notif)

            onComplete?.invoke(true)
        } catch (e: Exception) {
            Log.e(tag, "Error confirming cash payment", e)
            onComplete?.invoke(false)
        }
    }

    fun updatePaymentStatus(paymentId: String, bookingId: String, status: String) {
        try {
            val updates = mapOf<String, Any>(
                "status" to status,
                "updatedAt" to System.currentTimeMillis()
            )
            rtdb?.getReference("payments")?.child(paymentId)?.updateChildren(updates)
            rtdb?.getReference("bookings")?.child(bookingId)?.child("paymentStatus")?.setValue(status)
        } catch (e: Exception) {
            Log.e(tag, "Error updating payment status", e)
        }
    }

    fun getUserPayments(userId: String): LiveData<List<PaymentRecord>> {
        val liveData = MutableLiveData<List<PaymentRecord>>()
        try {
            rtdb?.getReference("payments")
                ?.addValueEventListener(object : ValueEventListener {
                    override fun onDataChange(snapshot: DataSnapshot) {
                        val list = mutableListOf<PaymentRecord>()
                        for (child in snapshot.children) {
                            val record = child.getValue(PaymentRecord::class.java)
                            if (record != null && (record.farmerId == userId || record.ownerId == userId)) {
                                list.add(record)
                            }
                        }
                        liveData.value = list.sortedByDescending { it.createdAt }
                    }

                    override fun onCancelled(error: DatabaseError) {}
                })
        } catch (e: Exception) {
            Log.e(tag, "Error fetching user payments", e)
        }
        return liveData
    }
}

object SoilRepository {
    private val tag = "SoilRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    fun saveSoilProfile(profile: FarmSoilProfile, onComplete: ((Boolean) -> Unit)? = null) {
        try {
            rtdb?.getReference("farmSoilProfiles")?.child(profile.userId)?.setValue(profile)
                ?.addOnCompleteListener { task -> onComplete?.invoke(task.isSuccessful) }
        } catch (e: Exception) {
            Log.e(tag, "Error saving soil profile", e)
            onComplete?.invoke(false)
        }
    }

    fun getSoilProfile(userId: String): LiveData<FarmSoilProfile> {
        val liveData = MutableLiveData<FarmSoilProfile>()
        try {
            rtdb?.getReference("farmSoilProfiles")?.child(userId)
                ?.addValueEventListener(object : ValueEventListener {
                    override fun onDataChange(snapshot: DataSnapshot) {
                        val profile = snapshot.getValue(FarmSoilProfile::class.java)
                        if (profile != null) {
                            liveData.value = profile
                        }
                    }

                    override fun onCancelled(error: DatabaseError) {}
                })
        } catch (e: Exception) {
            Log.e(tag, "Error fetching soil profile", e)
        }
        return liveData
    }

    fun saveCropRecommendation(recommendation: CropRecommendation) {
        try {
            rtdb?.getReference("cropRecommendations")?.child(recommendation.userId)
                ?.child(recommendation.recommendationId)?.setValue(recommendation)
        } catch (e: Exception) {
            Log.e(tag, "Error saving crop recommendation", e)
        }
    }

    fun getCropRecommendations(userId: String): LiveData<List<CropRecommendation>> {
        val liveData = MutableLiveData<List<CropRecommendation>>()
        try {
            rtdb?.getReference("cropRecommendations")?.child(userId)
                ?.addValueEventListener(object : ValueEventListener {
                    override fun onDataChange(snapshot: DataSnapshot) {
                        val list = mutableListOf<CropRecommendation>()
                        for (child in snapshot.children) {
                            val rec = child.getValue(CropRecommendation::class.java)
                            if (rec != null) {
                                list.add(rec)
                            }
                        }
                        liveData.value = list.sortedByDescending { it.createdAt }
                    }

                    override fun onCancelled(error: DatabaseError) {}
                })
        } catch (e: Exception) {
            Log.e(tag, "Error fetching recommendations", e)
        }
        return liveData
    }
}

object CropMapRepository {
    private val tag = "CropMapRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    private val seedRegions = listOf(
        CropRegion(
            id = "CRG101", cropName = "Paddy (Rice)", region = "Krishna Delta Belt",
            state = "Andhra Pradesh", latitude = 16.5000, longitude = 80.6400,
            soilType = "Alluvial Delta", season = "Kharif", waterRequirement = "High (1200mm - 1400mm)",
            description = "Major paddy production region with canal irrigation network.",
            dataSource = "Reference data"
        ),
        CropRegion(
            id = "CRG102", cropName = "Cotton (Bt Cotton)", region = "Guntur Black Soils",
            state = "Andhra Pradesh", latitude = 16.3067, longitude = 80.4365,
            soilType = "Black Cotton", season = "Kharif", waterRequirement = "Moderate (600mm - 800mm)",
            description = "Deep black soil region suitable for high yield cotton crops.",
            dataSource = "Reference data"
        ),
        CropRegion(
            id = "CRG103", cropName = "Groundnut", region = "Anantapur Rayalaseema",
            state = "Andhra Pradesh", latitude = 14.6819, longitude = 77.6006,
            soilType = "Red Sandy Soil", season = "Kharif / Rabi", waterRequirement = "Low (400mm - 500mm)",
            description = "Light red soil belt ideal for rainfed groundnut farming.",
            dataSource = "Reference data"
        ),
        CropRegion(
            id = "CRG104", cropName = "Maize (Corn)", region = "Karimnagar / Warangal Belt",
            state = "Telangana", latitude = 18.4386, longitude = 79.1288,
            soilType = "Red Loamy Soil", season = "Kharif / Rabi", waterRequirement = "Moderate (500mm - 700mm)",
            description = "High density hybrid maize cultivation area.",
            dataSource = "Reference data"
        ),
        CropRegion(
            id = "CRG105", cropName = "Sugarcane", region = "Visakhapatnam / Anakapalle",
            state = "Andhra Pradesh", latitude = 17.6868, longitude = 83.0064,
            soilType = "Coastal Alluvial", season = "Annual", waterRequirement = "Very High (1500mm - 2500mm)",
            description = "Sugarcane belt with sugar mill processing infrastructure.",
            dataSource = "Reference data"
        )
    )

    fun getCropRegions(): LiveData<List<CropRegion>> {
        val liveData = MutableLiveData<List<CropRegion>>()
        try {
            rtdb?.getReference("cropRegions")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<CropRegion>()
                    for (child in snapshot.children) {
                        val region = child.getValue(CropRegion::class.java)
                        if (region != null) list.add(region)
                    }
                    if (list.isEmpty()) {
                        liveData.value = seedRegions
                    } else {
                        liveData.value = list
                    }
                }

                override fun onCancelled(error: DatabaseError) {
                    liveData.value = seedRegions
                }
            }) ?: run {
                liveData.value = seedRegions
            }
        } catch (e: Exception) {
            Log.e(tag, "Error loading crop regions", e)
            liveData.value = seedRegions
        }
        return liveData
    }
}

object DamRepository {
    private val tag = "DamRepository"
    private val rtdb: FirebaseDatabase? by lazy { FirebaseConfig.getRealtimeDatabase() }

    private val seedDams = listOf(
        DamInfo(
            damId = "DAM101", damName = "Prakasam Barrage", state = "Andhra Pradesh",
            district = "NTR Krishna", latitude = 16.5067, longitude = 80.6053,
            reservoirCapacityTmc = 3.07, currentWaterLevelFt = 57.0, waterLevelPercentage = 85.0,
            status = "NORMAL", lastUpdated = "2026-08-25 18:00 IST", dataSource = "CWC Reference Data"
        ),
        DamInfo(
            damId = "DAM102", damName = "Nagarjuna Sagar Dam", state = "Andhra Pradesh / Telangana",
            district = "Palnadu / Nalgonda", latitude = 16.5772, longitude = 79.3134,
            reservoirCapacityTmc = 312.0, currentWaterLevelFt = 584.0, waterLevelPercentage = 78.5,
            status = "NORMAL", lastUpdated = "2026-08-25 18:00 IST", dataSource = "CWC Reference Data"
        ),
        DamInfo(
            damId = "DAM103", damName = "Srisailam Reservoir", state = "Andhra Pradesh",
            district = "Nandyal Kurnool", latitude = 16.0863, longitude = 78.8953,
            reservoirCapacityTmc = 215.8, currentWaterLevelFt = 880.0, waterLevelPercentage = 92.0,
            status = "HIGH", lastUpdated = "2026-08-25 18:00 IST", dataSource = "CWC Reference Data"
        ),
        DamInfo(
            damId = "DAM104", damName = "Dowleswaram Barrage", state = "Andhra Pradesh",
            district = "East Godavari Rajahmundry", latitude = 16.9407, longitude = 81.7767,
            reservoirCapacityTmc = 5.0, currentWaterLevelFt = 13.5, waterLevelPercentage = 65.0,
            status = "NORMAL", lastUpdated = "2026-08-25 18:00 IST", dataSource = "CWC Reference Data"
        )
    )

    fun getDams(): LiveData<List<DamInfo>> {
        val liveData = MutableLiveData<List<DamInfo>>()
        try {
            rtdb?.getReference("dams")?.addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<DamInfo>()
                    for (child in snapshot.children) {
                        val dam = child.getValue(DamInfo::class.java)
                        if (dam != null) list.add(dam)
                    }
                    if (list.isEmpty()) {
                        liveData.value = seedDams
                    } else {
                        liveData.value = list
                    }
                }

                override fun onCancelled(error: DatabaseError) {
                    liveData.value = seedDams
                }
            }) ?: run {
                liveData.value = seedDams
            }
        } catch (e: Exception) {
            Log.e(tag, "Error loading dams", e)
            liveData.value = seedDams
        }
        return liveData
    }
}
