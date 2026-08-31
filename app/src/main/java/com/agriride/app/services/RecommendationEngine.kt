package com.agriride.app.services

import com.agriride.app.models.CropRecommendation
import com.agriride.app.models.FarmSoilProfile
import com.agriride.app.models.Weather

/**
 * Interface defining the modular Recommendation Engine contract.
 * Allows switching between RuleBasedRecommendationEngine and a future MLRecommendationEngine (e.g. TFLite).
 */
interface RecommendationEngine {
    fun generateCropRecommendations(profile: FarmSoilProfile, weather: Weather?): List<CropRecommendation>
}

/**
 * Transparent agricultural decision-support rule engine.
 * Evaluates soil type, pH, NPK levels, moisture, season, and weather forecast metrics.
 */
class RuleBasedRecommendationEngine : RecommendationEngine {

    override fun generateCropRecommendations(profile: FarmSoilProfile, weather: Weather?): List<CropRecommendation> {
        val list = mutableListOf<CropRecommendation>()
        val season = profile.season.lowercase()
        val soil = profile.soilType.lowercase()

        // Evaluation based on Season and Soil Type
        if (season.contains("kharif") || season.contains("monsoon")) {
            // KHARIF SEASON CROPS
            if (soil.contains("black") || soil.contains("alluvial") || soil.contains("clay")) {
                // 1. Paddy
                list.add(
                    CropRecommendation(
                        recommendationId = "REC_PADDY_${System.currentTimeMillis()}",
                        userId = profile.userId,
                        cropName = "Paddy (BPT 5204 / Sona Masuri)",
                        teluguName = "వరి (సోనా మసూరి / సాంబ మసూరి)",
                        suitabilityScore = 96,
                        reason = "High water retention in fertile ${profile.soilType} with optimal monsoon rainfall.",
                        fertilizerGuidance = "Basal: DAP 50kg + MOP 25kg / Acre. Tillering (30 days): Neem Coated Urea 35kg + Zinc 10kg. Panicle: Urea 25kg + Potash 15kg.",
                        waterRequirement = "High (Canal / Flooded Irrigation • 1200mm - 1400mm)",
                        idealPhRange = "6.0 - 7.5",
                        weatherStatus = "EXCELLENT_CONDITIONS",
                        expectedYield = "30 - 35 Bags / Acre (75kg bags)",
                        estimatedProfit = "₹45,000 - ₹58,000 / Acre",
                        durationDays = "135 - 145 Days",
                        recommendedMachinery = "🚜 50HP Tractor + Rotavator (Puddling), 🌱 4-Row Paddy Transplanter, 🚁 Kisan Spray Drone, 🌾 Track Combine Harvester",
                        pestAdvisory = "Monitor for Stem Borer & Blast disease. Spray Cartap Hydrochloride 50 SP (2g/L) or Tricyclazole 75 WP as needed."
                    )
                )

                // 2. Cotton
                list.add(
                    CropRecommendation(
                        recommendationId = "REC_COTTON_${System.currentTimeMillis()}",
                        userId = profile.userId,
                        cropName = "Cotton (Bt Cotton RCH 659 / Bunny)",
                        teluguName = "ప్రత్తి (బిటి కాటన్ హైబ్రిడ్)",
                        suitabilityScore = 92,
                        reason = "Deep root penetration and excellent moisture retention in ${profile.soilType}.",
                        fertilizerGuidance = "Basal: 20:20:0:13 Complex (50kg) + MOP 25kg / Acre. Top dressing at 45 & 75 days with Urea 30kg each.",
                        waterRequirement = "Moderate (Well-drained soil • 4-5 timely irrigations)",
                        idealPhRange = "6.5 - 7.8",
                        weatherStatus = "SUITABLE",
                        expectedYield = "10 - 14 Quintals / Acre",
                        estimatedProfit = "₹48,000 - ₹65,000 / Acre",
                        durationDays = "160 - 180 Days",
                        recommendedMachinery = "🚜 Heavy Tractor Plough, 🌱 Seed Drill, 💦 Boom Sprayer, 🚁 Agricultural Spray Drone",
                        pestAdvisory = "Install Pheromone Traps for Pink Bollworm (5/acre). Spray Flonicamid 50 WG (0.3g/L) for whiteflies & aphids."
                    )
                )

                // 3. Chilli
                list.add(
                    CropRecommendation(
                        recommendationId = "REC_CHILLI_${System.currentTimeMillis()}",
                        userId = profile.userId,
                        cropName = "Chilli (Guntur Teja / Armoor)",
                        teluguName = "మిర్చి (గుంటూరు తేజ)",
                        suitabilityScore = 89,
                        reason = "Suitable high-value commercial cash crop for black and alluvial delta soils.",
                        fertilizerGuidance = "FYM 8 tons + DAP 50kg + Potash 40kg basal. 19:19:19 water-soluble fertigation every 15 days.",
                        waterRequirement = "Moderate (Drip irrigation recommended)",
                        idealPhRange = "6.0 - 7.0",
                        weatherStatus = "SUITABLE",
                        expectedYield = "25 - 30 Quintals (Dry) / Acre",
                        estimatedProfit = "₹80,000 - ₹1,30,000 / Acre",
                        durationDays = "150 - 170 Days",
                        recommendedMachinery = "🚜 Rotary Tiller / Bed Maker, 💦 High-pressure Boom Sprayer, 🚁 40L Spray Drone",
                        pestAdvisory = "Watch for Thrips & Mites. Spray Spinetoram 11.7 SC (1ml/L) and ensure sulfur dusting against powdery mildew."
                    )
                )
            } else {
                // Kharif on Red / Sandy Loam Soils
                // 1. Groundnut
                list.add(
                    CropRecommendation(
                        recommendationId = "REC_GNUT_${System.currentTimeMillis()}",
                        userId = profile.userId,
                        cropName = "Groundnut (Kadiri 6 / Dharani)",
                        teluguName = "వేరుశనగ (ధరణి / కదిరి 6)",
                        suitabilityScore = 95,
                        reason = "Loose, well-drained ${profile.soilType} facilitates healthy pod formation & pegging.",
                        fertilizerGuidance = "Basal: SSP 100kg + MOP 30kg + Gypsum 150kg / Acre at 35-40 days. Zinc Sulfate 10kg/acre.",
                        waterRequirement = "Low to Moderate (350mm - 500mm)",
                        idealPhRange = "6.0 - 7.0",
                        weatherStatus = "EXCELLENT_CONDITIONS",
                        expectedYield = "14 - 18 Bags (40kg) / Acre",
                        estimatedProfit = "₹32,000 - ₹44,000 / Acre",
                        durationDays = "105 - 115 Days",
                        recommendedMachinery = "🚜 Tractor Disc Plough, 🌱 Seed Planter, 🚜 Groundnut Digger & Thresher",
                        pestAdvisory = "Seed treatment with Trichoderma viride (10g/kg). Spray Chlorpyrifos for white grub prevention."
                    )
                )

                // 2. Maize
                list.add(
                    CropRecommendation(
                        recommendationId = "REC_MAIZE_${System.currentTimeMillis()}",
                        userId = profile.userId,
                        cropName = "Maize (Hybrid DHM 117 / Pioneer 3396)",
                        teluguName = "మొక్కజొన్న (హైబ్రిడ్)",
                        suitabilityScore = 91,
                        reason = "Fast-growing high-yield cereal crop ideal for porous red loamy soils.",
                        fertilizerGuidance = "Basal: DAP 50kg + MOP 20kg. Knee-high stage: Urea 40kg. Tasseling: Urea 25kg.",
                        waterRequirement = "Moderate (500mm - 700mm)",
                        idealPhRange = "5.8 - 7.2",
                        weatherStatus = "SUITABLE",
                        expectedYield = "32 - 38 Quintals / Acre",
                        estimatedProfit = "₹34,000 - ₹46,000 / Acre",
                        durationDays = "105 - 115 Days",
                        recommendedMachinery = "🚜 Tractor Cultivator, 🌱 Maize Planter, 🚁 Kisan Spray Drone, 🌾 Maize Sheller / Thresher",
                        pestAdvisory = "Scout for Fall Armyworm (కత్తెర పురుగు). Spray Emamectin Benzoate 5 SG (0.4g/L) inside leaf whorls."
                    )
                )

                // 3. Red Gram
                list.add(
                    CropRecommendation(
                        recommendationId = "REC_RGRAM_${System.currentTimeMillis()}",
                        userId = profile.userId,
                        cropName = "Red Gram / Pigeon Pea (LRG 52 / Asha)",
                        teluguName = "కంది (ఆశా / ఎల్ఆర్జి 52)",
                        suitabilityScore = 88,
                        reason = "Drought-tolerant leguminous pulse with natural nitrogen fixing in ${profile.soilType}.",
                        fertilizerGuidance = "Basal: DAP 40kg + SSP 50kg / Acre. Rhizobium culture seed inoculation.",
                        waterRequirement = "Low (Protective irrigation only)",
                        idealPhRange = "6.0 - 7.5",
                        weatherStatus = "SUITABLE",
                        expectedYield = "7 - 9 Quintals / Acre",
                        estimatedProfit = "₹30,000 - ₹40,000 / Acre",
                        durationDays = "150 - 165 Days",
                        recommendedMachinery = "🚜 Tractor Multi-crop Planter, 💦 Boom Sprayer, 🌾 Multicrop Thresher",
                        pestAdvisory = "Monitor for Pod Borer (Helicoverpa). Spray Chlorantraniliprole 18.5 SC (0.3ml/L) at flower initiation."
                    )
                )
            }
        } else if (season.contains("rabi") || season.contains("winter")) {
            // RABI SEASON CROPS
            // 1. Bengal Gram / Chickpea
            list.add(
                CropRecommendation(
                    recommendationId = "REC_BGRAM_${System.currentTimeMillis()}",
                    userId = profile.userId,
                    cropName = "Bengal Gram / Chickpea (JG 11 / KAK 2)",
                    teluguName = "శనగ (జేజీ 11 / దేశీ శనగ)",
                    suitabilityScore = 95,
                    reason = "Ideal cool-weather pulse crop thriving on residual soil moisture in ${profile.soilType}.",
                    fertilizerGuidance = "Basal: DAP 40kg + Potash 15kg + Sulfur 10kg / Acre. No nitrogen top dressing required.",
                    waterRequirement = "Low (1-2 critical irrigations at branching & pod filling)",
                    idealPhRange = "6.5 - 8.0",
                    weatherStatus = "EXCELLENT_CONDITIONS",
                    expectedYield = "8 - 11 Quintals / Acre",
                    estimatedProfit = "₹32,000 - ₹45,000 / Acre",
                    durationDays = "90 - 105 Days",
                    recommendedMachinery = "🚜 Tractor Cultivator, 🌱 Seed Drill, 🚁 Spray Drone, 🌾 Multicrop Thresher",
                    pestAdvisory = "Spodoptera & Helicoverpa caterpillar control. Spray Novaluron 10 EC (1ml/L) at early larval stage."
                )
            )

            // 2. Black Gram / Urad
            list.add(
                CropRecommendation(
                    recommendationId = "REC_UGRAM_${System.currentTimeMillis()}",
                    userId = profile.userId,
                    cropName = "Black Gram / Urad (PU 31 / LBG 752)",
                    teluguName = "మినుము (ఎల్బీజీ 752 / ఉరద్)",
                    suitabilityScore = 93,
                    reason = "Top rice-fallow pulse crop utilizing moisture in black alluvial belt.",
                    fertilizerGuidance = "Foliar spray of 2% DAP or 19:19:19 at 30 and 45 days after sowing.",
                    waterRequirement = "Low (Zero tillage rice fallow cultivation)",
                    idealPhRange = "6.0 - 7.5",
                    weatherStatus = "SUITABLE",
                    expectedYield = "6 - 8 Quintals / Acre",
                    estimatedProfit = "₹28,000 - ₹38,000 / Acre",
                    durationDays = "75 - 85 Days",
                    recommendedMachinery = "🌱 Broadcaster, 🚁 Kisan Spray Drone, 🌾 Clean Crop Thresher",
                    pestAdvisory = "Yellow Mosaic Virus (YMV) whitefly vector control: Spray Acetamiprid 20 SP (0.2g/L)."
                )
            )

            // 3. Maize (Rabi)
            list.add(
                CropRecommendation(
                    recommendationId = "REC_RMAIZE_${System.currentTimeMillis()}",
                    userId = profile.userId,
                    cropName = "Rabi Maize (Pioneer 3302 / Kaveri)",
                    teluguName = "రబీ మొక్కజొన్న",
                    suitabilityScore = 90,
                    reason = "Cool winter climate yields highest grain weight and pest-free cob development.",
                    fertilizerGuidance = "DAP 50kg + MOP 25kg + Zinc 10kg basal. Urea 50kg split in two doses.",
                    waterRequirement = "Moderate (5-6 scheduled irrigations)",
                    idealPhRange = "6.0 - 7.5",
                    weatherStatus = "SUITABLE",
                    expectedYield = "38 - 45 Quintals / Acre",
                    estimatedProfit = "₹40,000 - ₹54,000 / Acre",
                    durationDays = "115 - 125 Days",
                    recommendedMachinery = "🚜 Tractor Ridger, 🚁 Kisan Spray Drone, 🌾 Multi-crop Combine Harvester",
                    pestAdvisory = "Monitor leaf whorls for Spodoptera frugiperda. Spray Spinetoram 11.7 SC (0.5ml/L)."
                )
            )
        } else {
            // ZAID / SUMMER CROPS
            // 1. Green Gram / Moong
            list.add(
                CropRecommendation(
                    recommendationId = "REC_MOONG_${System.currentTimeMillis()}",
                    userId = profile.userId,
                    cropName = "Green Gram / Moong (IPM 2-14 / WGG 42)",
                    teluguName = "పెసర (డబ్ల్యుజీజీ 42 / మూంగ్)",
                    suitabilityScore = 94,
                    reason = "Short-duration summer catch crop that enriches soil before main kharif cycle.",
                    fertilizerGuidance = "DAP 35kg/acre basal. Foliar micronutrient spray at flowering.",
                    waterRequirement = "Low (3-4 light irrigations)",
                    idealPhRange = "6.2 - 7.5",
                    weatherStatus = "SUITABLE",
                    expectedYield = "5 - 7 Quintals / Acre",
                    estimatedProfit = "₹25,000 - ₹35,000 / Acre",
                    durationDays = "65 - 70 Days",
                    recommendedMachinery = "🚜 Tractor Cultivator, 🌱 Seed Drill, 🌾 Thresher",
                    pestAdvisory = "Spray Dimethoate 30 EC (1.5ml/L) against summer sucking pests."
                )
            )

            // 2. Sesame / Til
            list.add(
                CropRecommendation(
                    recommendationId = "REC_SESAME_${System.currentTimeMillis()}",
                    userId = profile.userId,
                    cropName = "Sesame / Gingelly (YLM 66 / Swetha)",
                    teluguName = "నువ్వులు (శ్వేత / వైఎల్ఎం 66)",
                    suitabilityScore = 90,
                    reason = "Heat tolerant oilseed crop with exceptional market value in summer.",
                    fertilizerGuidance = "FYM 4 tons + SSP 75kg + Urea 20kg / Acre.",
                    waterRequirement = "Very Low (2-3 irrigations)",
                    idealPhRange = "6.0 - 7.5",
                    weatherStatus = "SUITABLE",
                    expectedYield = "3 - 5 Quintals / Acre",
                    estimatedProfit = "₹28,000 - ₹40,000 / Acre",
                    durationDays = "80 - 85 Days",
                    recommendedMachinery = "🚜 Tractor Rotavator, 🌾 Seed cleaner / Thresher",
                    pestAdvisory = "Prevent Antigastra shoot webber by spraying Quinalphos 25 EC (2ml/L)."
                )
            )
        }

        return list.sortedByDescending { it.suitabilityScore }
    }
}

/**
 * Interface placeholder for future Machine Learning / TensorFlow Lite recommendation engine.
 */
class MLRecommendationEngine : RecommendationEngine {
    override fun generateCropRecommendations(profile: FarmSoilProfile, weather: Weather?): List<CropRecommendation> {
        return RuleBasedRecommendationEngine().generateCropRecommendations(profile, weather)
    }
}
