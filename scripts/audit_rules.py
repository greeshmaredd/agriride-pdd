import json
import os

def audit_firebase_rules():
    crit_count = 0
    high_count = 0
    print("🔒 Checking Firebase Realtime Database Security Rules...")
    if os.path.exists("database.rules.json"):
        with open("database.rules.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            rules = data.get("rules", {})
            if rules.get(".read") == "auth != null" and rules.get(".write") == "auth != null":
                print("🚨 CRITICAL: Root wildcard .read and .write allows arbitrary database takeover!")
                crit_count += 1
            if "workers" in rules:
                w_rules = rules["workers"].get("$workerId", {})
                if w_rules.get(".write") == "auth != null":
                    print("⚠️ HIGH: Workers node allows unauthorized writes without owner/worker verification.")
                    high_count += 1

    print("🔒 Checking Cloud Firestore Security Rules...")
    if os.path.exists("firestore.rules"):
        with open("firestore.rules", "r", encoding="utf-8") as f:
            content = f.read()
            if "match /payments/{paymentId}" in content and "allow read, write: if isAuthenticated();" in content:
                print("🚨 CRITICAL: Payments collection permits direct client-side status writes!")
                crit_count += 1

    print("🔒 Checking Cloud Storage Security Rules...")
    if os.path.exists("storage.rules"):
        with open("storage.rules", "r", encoding="utf-8") as f:
            content = f.read()
            if "match /equipmentDocuments/" in content and "allow read, write: if request.auth != null;" in content:
                print("🚨 CRITICAL: Sensitive equipment documents are accessible by any authenticated user!")
                crit_count += 1

    print(f"Audit Summary: {crit_count} Critical, {high_count} High findings verified.")

if __name__ == "__main__":
    audit_firebase_rules()
