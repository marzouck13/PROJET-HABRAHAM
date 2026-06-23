package com.anonymous.momoautomation

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.telephony.SmsManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class MomoBridge(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext

    // Le nom exact à appeler côté JavaScript
    override fun getName(): String {
        return "MomoAutomationModule"
    }

    // 1. Initialisation du Listener
    @ReactMethod
    fun initializeNotificationListener(promise: Promise) {
        try {
            // Le pont traditionnel est opérationnel
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_INIT_LISTENER", "Impossible d'activer le listener natif: ${e.message}")
        }
    }

    // 2. Envoi de SMS en arrière-plan
    @ReactMethod
    fun sendSms(phoneNumber: String, message: String, promise: Promise) {
        try {
            val smsManager: SmsManager = context.getSystemService(SmsManager::class.java)
            smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            promise.resolve("SMS envoyé avec succès à $phoneNumber")
        } catch (e: Exception) {
            promise.reject("ERR_SEND_SMS", "Échec de l'envoi du SMS : ${e.localizedMessage}")
        }
    }

    // 3. Exécution d'un code USSD
    @ReactMethod
    fun sendUssd(ussdCode: String, promise: Promise) {
        try {
            val encodedCode = Uri.encode(ussdCode)
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:$encodedCode")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            promise.resolve("Code USSD $ussdCode lancé avec succès")
        } catch (e: Exception) {
            promise.reject("ERR_SEND_USSD", "Impossible de lancer le code USSD : ${e.localizedMessage}")
        }
    }
}