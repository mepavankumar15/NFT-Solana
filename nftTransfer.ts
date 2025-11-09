// nftTransfer.ts — final working version

import {
  mplCore,
  fetchAsset,
  fetchCollection,
  transfer,
} from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  signerIdentity,
  createSignerFromKeypair,
  publicKey,
} from "@metaplex-foundation/umi";
import fs from "fs";

async function main() {
  const [assetArg, recipientArg] = process.argv.slice(2);
  if (!assetArg || !recipientArg) {
    console.error("Usage: nftTransfer.ts <ASSET_PUBKEY> <RECIPIENT_PUBKEY>");
    process.exit(1);
  }

  // ✅ Your collection ID (must match your createCollection script)
  const COLLECTION_ID = "78Qm7W3Kibh5u67q8z7Bq7QifKeEBVZwqb52qeYPZ73w";

  const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

  // ✅ Load wallet.json
  const secret = JSON.parse(fs.readFileSync("./wallet.json", "utf8"));
  const kp = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
  const signer = createSignerFromKeypair(umi, kp);
  umi.use(signerIdentity(signer));

  console.log("✅ Using wallet:", signer.publicKey.toString());

  const assetPk = publicKey(assetArg);
  const newOwner = publicKey(recipientArg);

  const asset = await fetchAsset(umi, assetPk);

  console.log("✅ Loaded Asset:", asset.publicKey.toString());
  console.log("✅ Current Owner:", asset.owner.toString());

  if (asset.owner.toString() !== signer.publicKey.toString()) {
    console.error("❌ You do not own this NFT.");
    process.exit(1);
  }

  // ✅ FORCE-LOAD collection since updateAuthority is missing
  const collection = await fetchCollection(umi, publicKey(COLLECTION_ID));
  console.log("✅ Using Collection:", collection.publicKey.toString());

  console.log("🔄 Transferring NFT...");

  const tx = await transfer(umi, {
    asset,
    newOwner,
    collection, // ✅ force-injected collection so transfer works
  }).sendAndConfirm(umi);

  console.log("✅ Transfer Complete!");
  console.log(`TX: https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`);
}

main().catch(console.error);
