package com.agriride.app.utils

import com.agriride.app.R

object EquipmentImageHelper {
    fun getEquipmentDrawable(name: String = "", category: String = "", type: String = ""): Int {
        val key = (name + " " + category + " " + type).lowercase()
        return when {
            key.contains("drone") || key.contains("kisan") || key.contains("agras") || key.contains("uav") -> R.drawable.img_kisan_drone
            key.contains("rotavator") || key.contains("tiller") || key.contains("cultivator") || key.contains("plough") -> R.drawable.img_rotavator
            key.contains("transplanter") || (key.contains("paddy") && key.contains("plant")) -> R.drawable.img_paddy_transplanter
            key.contains("sprayer") || key.contains("boom") || key.contains("aspee") -> R.drawable.img_tractor_sprayer
            key.contains("thresher") || key.contains("dasmesh") -> R.drawable.img_thresher
            key.contains("baler") || key.contains("straw") -> R.drawable.img_baler
            key.contains("harvester") || key.contains("combine") || key.contains("claas") || key.contains("sonalika") -> R.drawable.img_sonalika_harvester
            key.contains("deere") || key.contains("5310") || key.contains("5050") -> R.drawable.img_john_deere_tractor
            else -> R.drawable.img_mahindra_tractor
        }
    }
}
