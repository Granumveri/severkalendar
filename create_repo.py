
import os
import json
import http.client

def create_repo():
    username = "Granumveri"
    repo_name = "severkalendar"
    token = "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"

    conn = http.client.HTTPSConnection("api.github.com")
    
    payload = json.dumps({
        "name": repo_name,
        "private": False
    })
    
    headers = {
        'Authorization': f'token {token}',
        'User-Agent': 'Python-http-client',
        'Content-Type': 'application/json'
    }
    
    conn.request("POST", "/user/repos", payload, headers)
    res = conn.getresponse()
    data = res.read()
    print(data.decode("utf-8"))

if __name__ == "__main__":
    create_repo()
