#!/bin/bash

if ! npm list -g @sqds/cli >/dev/null 2>&1; then
  echo "@sqds/cli is not installed. Installing..."
  npm install -g @sqds/cli
else
  echo "@sqds/cli is already installed."
fi

read -p "Enter the wallet keypair path: " WALLET_KEYPAIR_PATH

read -p "Enter the RPC cluster URL: " RPC_CLUSTER_URL

echo "Running squads-cli with the provided inputs..."
squads-cli << EOF
$WALLET_KEYPAIR_PATH
y
$RPC_CLUSTER_URL
y
EOF