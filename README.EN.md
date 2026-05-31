[[中文简体](./README.md)/English]
# Lego-Httpreq-Provider

> An [httpreq](https://go-acme.github.io/lego/dns/httpreq/index.html) DNS Provider implementation for the [Lego](https://go-acme.github.io/lego/) ACME client.

## ✨ Features

- ✅ Default Mode support
- ✅ Raw Mode support
- 🔌 Multiple DNS provider integrations

## 📦 Supported DNS Providers

| Provider     | Website                    |
| :----------- | :------------------------- |
| VPS8         | https://vps8.zz.cd         |
| DNSHE        | https://www.dnshe.com      |
| Localhost.cc | https://localhost.cc       |

## ⚙️ Configuration

Create or edit the configuration file in the project root directory:

```toml
# config.toml
[server]
port = 3000
bind = "0.0.0.0"

[server.auth]
username = "user"
password = "password"

[provider.vps8]
enable = true
username = "***"
password = "***"

[provider.dnshe]
enable = true
apiKey = "***"
apiSecret = "***"

[provider.localhostcc]
enable = true
apiKey = "***"
```

## 💻 Environment Variables
| Variable | Value |
| :--- | :--- |
| DEBUG | LRP:\* |
| LRP_CONFIG_FILE | config file path. eg: `custom.toml` |

## 🚀 API Endpoints

### Present (Add DNS Record)

**Default Mode**

```bash
curl -sS -u "user:password" \
  -H "Content-Type: application/json" \
  -X POST "http://localhost:3000/{ProviderName}/present" \
  -d '{
    "fqdn": "_acme-challenge.domain",
    "value": "LHDhK3oGRvkiefQnx7OOczTY5Tic_xZ6HcMOc_gmtoM"
  }'
```

**Raw Mode**

```bash
curl -sS -u "user:password" \
  -H "Content-Type: application/json" \
  -X POST "http://localhost:3000/{ProviderName}/present" \
  -d '{
    "domain": "domain",
    "token": "CAToken",
    "keyAuth": "CAToken.Thumbprint"
  }'
```

### Cleanup (Remove DNS Record)

**Default Mode**

```bash
curl -sS -u "user:password" \
  -H "Content-Type: application/json" \
  -X POST "http://localhost:3000/{ProviderName}/cleanup" \
  -d '{
    "fqdn": "_acme-challenge.domain",
    "value": "LHDhK3oGRvkiefQnx7OOczTY5Tic_xZ6HcMOc_gmtoM"
  }'
```

**Raw Mode**

```bash
curl -sS -u "user:password" \
  -H "Content-Type: application/json" \
  -X POST "http://localhost:3000/{ProviderName}/cleanup" \
  -d '{
    "domain": "domain",
    "token": "CAToken",
    "keyAuth": "CAToken.Thumbprint"
  }'
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start
```

## 📄 License
