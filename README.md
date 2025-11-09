# Core NFT Collection on Solana with Escrow-Based Trust Layer

## Overview

This project implements a complete workflow for creating, managing, and transferring **Core NFTs on Solana**. It addresses a common challenge in peer-to-peer NFT trading: **lack of trust** between buyer and seller.

To solve this, the project introduces an **Escrow Smart Contract** that ensures assets and payments are exchanged fairly, securely, and atomically â€” without requiring third-party intermediaries.

---

## Problem: Trust Issues in Direct NFT Transfers

Direct NFT trading between two parties comes with several risks:

### 1. Seller Fraud
The seller may take payment and never transfer the NFT.

### 2. Buyer Fraud
The buyer may receive the NFT but refuse to complete payment.

### 3. No On-Chain Enforcement
There is no built-in mechanism that ensures both parties fulfill their obligations.

### 4. Unsafe Manual Transfers
Direct manual transfers often lead to:
- Sending to the wrong wallet
- Invalid NFTs
- Replay attacks
- Unrecoverable mistakes

This creates **irreversible loss** and **trust gaps** in trading.

---

## Solution: Escrow-Based NFT Trading

To eliminate trust issues, this project uses an **Escrow Program** on Solana.

### âœ… How Escrow Fixes the Problem
1. **Seller deposits NFT into escrow**
2. **Buyer deposits SOL/tokens into escrow**
3. Escrow verifies:
   - Correct NFT  
   - Correct payment amount  
   - Correct participants  
4. If everything matches:
   - NFT â†’ Buyer  
   - Funds â†’ Seller  
5. If anything fails â†’ both deposits are refunded

This guarantees a **secure, trustless, atomic trade**.

---

## Project Structure

```
core-nft-collection/
 createCollection.ts         # Script for creating a Core NFT collection
 mintDiffNftCollection.ts    # Script for batch-minting NFTs
 nftTransfer.ts              # Script to transfer Core NFTs
assets/
collection.png
 nfts/*.png
 wallet.json                 # Local development wallet (DO NOT SHARE)
 README.md
```

---

## Features

###  Create Solana Core NFT Collections  
Upload metadata & images to Irys automatically.

### Batch Mint NFTs Into the Collection  
Automatic metadata generation + image uploading.

### Safe NFT Transfer Script  
Validates ownership before transferring.

### Escrow-Based Trading Flow  
Provides trustless NFT trading between users.

---

## Installation

### 1. Clone the repository

```bash
git clone <YOUR_REPO_URL>
cd core-nft-collection
```

### 2. Install all dependencies

```bash
npm install
```

Packages required:

```bash
npm install @metaplex-foundation/mpl-core
npm install @metaplex-foundation/umi
npm install @metaplex-foundation/umi-bundle-defaults
npm install @metaplex-foundation/umi-uploader-irys
npm install @solana/web3.js
npm install ts-node typescript @types/node --save-dev
```

---

## How to Use

### 1. Create a Collection

Place your collection image:

```
assets/collection.png
```

Run:

```bash
npx ts-node createCollection.ts
```

Outputs:
- Collection Address  
- Upload URLs  
- Devnet Explorer links  

---

### 2. Mint NFTs Into the Collection

Store NFT images:

```
assets/nfts/*.png
```

Run:

```bash
npx ts-node mintDiffNftCollection.ts <COLLECTION_PUBKEY>
```

---

### 3. Transfer an NFT

```bash
npx ts-node nftTransfer.ts <NFT_ASSET_PUBKEY> <RECIPIENT_PUBLIC_KEY>
```

---

## Security Considerations

- Never commit `wallet.json`  
- Always double-check wallet addresses  
- Use Escrow for real trades  
- Metadata files should be immutable  

---

## Future Enhancements

- Front-end marketplace UI  
- Advanced escrow logic  
- Royalty/creator fee support  
- Token-based purchasing  
- On-chain orderbook  

---
