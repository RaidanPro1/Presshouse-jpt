
import requests
import json
import sys

# --- CONFIGURATION ---
# Hardcoded credentials as requested
ZONE_NAME = "ph-ye.org"
SERVER_IP = "212.56.42.87"
API_TOKEN = "Nr2aMhy8Wb3HVY5Mb2ZJe9KsZ0IfeBVIJCXhcPvA" 

API_BASE = "https://api.cloudflare.com/client/v4"
HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# The blueprint for our subdomains
SUBDOMAINS = [
    {"name": "auth", "proxied": True},    # Keycloak
    {"name": "admin", "proxied": True},   # Portainer/Admin panels
    {"name": "news", "proxied": True},    # Superdesk
    {"name": "legal", "proxied": True},   # DastoorMeter
    {"name": "culture", "proxied": True}, # Awam/Mukurtu
    {"name": "org", "proxied": True},     # Superset/CRM
    {"name": "api", "proxied": True},     # Backend APIs
    {"name": "gpu", "proxied": False}     # Direct Redis/Worker connection (Critical)
]

def get_zone_id(zone_name):
    """Fetch the Zone ID for the given domain."""
    print(f"🔍 Fetching Zone ID for {zone_name}...")
    url = f"{API_BASE}/zones?name={zone_name}"
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        if data['success'] and len(data['result']) > 0:
            return data['result'][0]['id']
        else:
            print(f"❌ Error: Could not find zone '{zone_name}'. Check your API Token permissions.")
            return None
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return None

def create_record(zone_id, subdomain, ip, proxied):
    """Create an A record."""
    url = f"{API_BASE}/zones/{zone_id}/dns_records"
    payload = {
        "type": "A",
        "name": subdomain,
        "content": ip,
        "ttl": 1, # 1 = Automatic
        "proxied": proxied
    }
    
    try:
        print(f"☁️  Configuring {subdomain}.{ZONE_NAME}...", end=" ")
        response = requests.post(url, headers=HEADERS, json=payload)
        data = response.json()
        
        if data['success']:
            proxy_status = "🛡️ Proxied" if proxied else "🔌 Direct"
            print(f"✅ Success [{proxy_status}]")
        else:
            errors = data.get('errors', [])
            error_msg = errors[0].get('message') if errors else "Unknown error"
            # Handle duplicate record gracefully
            if "already exists" in error_msg:
                print(f"⚠️  Skipped (Already Exists)")
            else:
                print(f"❌ Failed: {error_msg}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    print("=========================================")
    print("   RAIDAN PRO v6.0 - DNS AUTOMATOR       ")
    print("=========================================")
    
    zone_id = get_zone_id(ZONE_NAME)
    if not zone_id:
        sys.exit(1)
        
    print(f"🔑 Zone ID Found: {zone_id}")
    print("-----------------------------------------")
    
    for sub in SUBDOMAINS:
        create_record(zone_id, sub['name'], SERVER_IP, sub['proxied'])
        
    print("-----------------------------------------")
    print("🎉 DNS Setup Complete.")

if __name__ == "__main__":
    main()
