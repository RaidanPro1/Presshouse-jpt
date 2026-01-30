import os
import requests
import sys
import time

# --- CONFIGURATION ---
try:
    API_TOKEN = os.environ['CF_DNS_API_TOKEN']
    ZONE_NAME = os.environ['DOMAIN']
except KeyError as e:
    print(f"❌ Error: Environment variable {e} not set. Skipping DNS setup.")
    sys.exit(0)

API_BASE = "https://api.cloudflare.com/client/v4"
HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

# Subdomains to be created.
# The `proxied` flag determines if traffic goes through Cloudflare's CDN (orange cloud).
# Mail-related records MUST have proxied set to False.
SUBDOMAINS_TO_CREATE = [
    # Main domain record
    {"name": "@", "proxied": True}, # '@' represents the root domain (ph-ye.org)
    
    # Core Infrastructure & Management
    {"name": "dashboard", "proxied": True},
    {"name": "npm", "proxied": False}, # Nginx Proxy Manager admin UI itself
    {"name": "portainer", "proxied": True},

    # Media Empire
    {"name": "ghost", "proxied": True},
    {"name": "wordpress", "proxied": True},
    {"name": "radio", "proxied": True}, # AzuraCast
    {"name": "stream", "proxied": True}, # Restreamer
    
    # AI & Ops
    {"name": "ai", "proxied": True}, # Could be Open WebUI or similar
    {"name": "label-studio", "proxied": True},
    {"name": "n8n", "proxied": True},
    
    # Security & Code
    {"name": "vault", "proxied": True}, # Vaultwarden
    {"name": "gitea", "proxied": True},
    
    # Mail Server (Poste.io) - MUST NOT BE PROXIED
    {"name": "mail", "proxied": False},
]

def get_server_ip():
    """Fetches the public IP of the server."""
    try:
        print("   -> Fetching server's public IP address...")
        response = requests.get("https://api.ipify.org?format=json", timeout=10)
        response.raise_for_status()
        ip = response.json()['ip']
        print(f"   ✅ Server IP found: {ip}")
        return ip
    except Exception as e:
        print(f"❌ Error: Could not determine public IP address: {e}")
        return None

def get_zone_id(zone_name):
    """Fetch the Zone ID for the given domain."""
    print(f"🔍 Fetching Zone ID for '{zone_name}'...")
    url = f"{API_BASE}/zones?name={zone_name}"
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        if data['success'] and len(data['result']) > 0:
            zone_id = data['result'][0]['id']
            print(f"   ✅ Zone ID found: {zone_id}")
            return zone_id
        else:
            print(f"❌ Error: Could not find zone '{zone_name}'. Response: {data.get('errors')}")
            return None
    except Exception as e:
        print(f"❌ Connection Error while fetching Zone ID: {e}")
        return None

def create_or_update_record(zone_id, record_name, ip, proxied):
    """Creates or updates an A record."""
    name_for_api = ZONE_NAME if record_name == "@" else f"{record_name}.{ZONE_NAME}"
    url = f"{API_BASE}/zones/{zone_id}/dns_records?type=A&name={name_for_api}"

    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()

        payload = {
            "type": "A",
            "name": name_for_api,
            "content": ip,
            "ttl": 1,  # 1 = Automatic
            "proxied": proxied
        }
        
        proxy_status = "🛡️ Proxied" if proxied else "🔌 Direct"
        
        if data['success'] and len(data['result']) > 0:
            record_id = data['result'][0]['id']
            record_content = data['result'][0]['content']
            if record_content == ip:
                print(f"   -> Record for '{name_for_api}' is already up-to-date. ✅ Skipped")
                return

            print(f"   -> Record for '{name_for_api}' exists. Updating...", end=" ")
            update_url = f"{API_BASE}/zones/{zone_id}/dns_records/{record_id}"
            update_response = requests.put(update_url, headers=HEADERS, json=payload)
            update_data = update_response.json()
            if update_data['success']:
                print(f"✅ Updated [{proxy_status}]")
            else:
                print(f"❌ Failed Update: {update_data.get('errors')}")
        else:
            print(f"   -> Record for '{name_for_api}' not found. Creating...", end=" ")
            create_url = f"{API_BASE}/zones/{zone_id}/dns_records"
            create_response = requests.post(create_url, headers=HEADERS, json=payload)
            create_data = create_response.json()
            if create_data['success']:
                 print(f"✅ Created [{proxy_status}]")
            else:
                 print(f"❌ Failed Create: {create_data.get('errors')}")

    except Exception as e:
        print(f"❌ Exception for '{name_for_api}': {e}")

def main():
    print("--- Cloudflare DNS Automation Script ---")
    server_ip = get_server_ip()
    if not server_ip:
        sys.exit(1)
        
    zone_id = get_zone_id(ZONE_NAME)
    if not zone_id:
        sys.exit(1)
        
    print("-----------------------------------------")
    for sub in SUBDOMAINS_TO_CREATE:
        create_or_update_record(zone_id, sub['name'], server_ip, sub['proxied'])
        time.sleep(0.5) # Small delay to avoid hitting API rate limits

    print("-----------------------------------------")
    print("🎉 DNS Setup Script Finished.")

if __name__ == "__main__":
    main()
