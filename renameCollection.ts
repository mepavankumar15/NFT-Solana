import { updateCollection, fetchCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { base58 } from "@metaplex-foundation/umi/serializers";
import fs from "fs";
import path from "path";

const RPC = "https://api.devnet.solana.com";
const IRYS = "https://devnet.irys.xyz";
const WALLET_PATH = path.join(process.cwd(), "wallet.json");

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error("❗ Usage: npx ts-node renameCollection.ts <COLLECTION_ADDRESS>");
    process.exit(1);
  }

  const collectionAddress = args[0];

  // Initialize UMI + Core + Irys
  const umi = createUmi(RPC).use(mplCore()).use(irysUploader({ address: IRYS }));

  if (!fs.existsSync(WALLET_PATH)) {
    console.error(`❗ Missing wallet.json at ${WALLET_PATH}`);
    console.error("Create one: solana-keygen new -o wallet.json --no-bip39-passphrase");
    process.exit(1);
  }
  const secret = JSON.parse(fs.readFileSync(WALLET_PATH, "utf8"));
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));

  console.log("Wallet Loaded:", umi.identity.publicKey.toString());

  // Fetch existing collection data
  console.log("Fetching collection data...");
  const collection = await fetchCollection(umi, collectionAddress);

  console.log("✅ Current Metadata URI:", collection.uri);

  // Download existing metadata JSON
  console.log(" Downloading existing metadata JSON...");
  const metadataJson = await (await fetch(collection.uri)).json();

  console.log(" Current Name:", metadataJson.name);

  // Ask for new name
  const newName = await askUser(`Enter NEW name: (current: "${metadataJson.name}") → `);

  if (!newName.trim()) {
    console.error("❗ Name cannot be empty.");
    process.exit(1);
  }

  // Create updated metadata JSON
  const updatedMetadata = {
    ...metadataJson,
    name: newName.trim(),
  };

  // Upload new metadata JSON
  console.log("⏫ Uploading updated JSON to Irys...");
  const newUri = await umi.uploader.uploadJson(updatedMetadata);

  console.log("✅ New Metadata URI:", newUri);

  // Update the on-chain collection
  console.log("🔄 Updating collection on-chain...");
  const tx = await updateCollection(umi, {
    collection: collection.publicKey,
    uri: newUri,
  }).sendAndConfirm(umi);

  const sig = base58.deserialize(tx.signature)[0];

  console.log("\n✅✅ COLLECTION NAME UPDATED SUCCESSFULLY ✅✅");
  console.log(`Explorer TX: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  console.log(`Updated URI: ${newUri}`);
  console.log(`Collection: https://core.metaplex.com/explorer/${collectionAddress}?env=devnet\n`);
}

function askUser(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.resume();
    process.stdin.once("data", (data) => {
      process.stdin.pause();
      resolve(data.toString().trim());
    });
  });
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
