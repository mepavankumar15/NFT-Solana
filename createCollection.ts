// createCollection.ts
import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  signerIdentity,
  createSignerFromKeypair,
  sol,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { base58 } from "@metaplex-foundation/umi/serializers";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n=== Creating Core Collection (wallet.json) ===\n");

  const umi = createUmi("https://api.devnet.solana.com")
    .use(mplCore())
    .use(irysUploader({ address: "https://devnet.irys.xyz" }));

  // ✅ Load wallet.json
  const secret = JSON.parse(fs.readFileSync("./wallet.json", "utf8"));
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));

  console.log("✅ Using Wallet:", signer.publicKey.toString());

  // ✅ Ensure wallet has SOL
  const bal = await umi.rpc.getBalance(signer.publicKey);
  const solBal = Number(bal.basisPoints) / 1_000_000_000;

  console.log(`Wallet Balance: ${solBal} SOL`);

  if (solBal < 0.2) {
    console.log("❌ Not enough SOL. Fund wallet.json first.");
    process.exit(1);
  }

  // ✅ Upload collection image
  const imgPath = path.resolve("./assets/collection.png");
  if (!fs.existsSync(imgPath)) throw new Error("Missing assets/collection.png");

  const imgBytes = fs.readFileSync(imgPath);
  const imgFile = createGenericFile(imgBytes, "collection.png", {
    tags: [{ name: "Content-Type", value: "image/png" }],
  });

  const [imageUri] = await umi.uploader.upload([imgFile]);
  console.log("✅ Image uploaded:", imageUri);

  // ✅ Upload metadata JSON
  const metadata = {
    name: "My Core Collection",
    description: "A Solana Core NFT Collection",
    image: imageUri,
  };

  const metadataUri = await umi.uploader.uploadJson(metadata);
  console.log("✅ Metadata URI:", metadataUri);

  // ✅ Create collection signer
  const collection = createSignerFromKeypair(
    umi,
    umi.eddsa.generateKeypair()
  );

  console.log("\n🔄 Creating on-chain collection...\n");

  const tx = await createCollection(umi, {
    collection,
    name: metadata.name,
    uri: metadataUri,
  }).sendAndConfirm(umi);

  const sig = base58.deserialize(tx.signature)[0];

  console.log("\n✅✅✅ COLLECTION CREATED ✅✅✅\n");
  console.log("Collection Address:", collection.publicKey.toString());
  console.log(`Explorer TX: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  console.log(
    `Core Explorer: https://core.metaplex.com/explorer/${collection.publicKey}?env=devnet`
  );
}

main().catch(console.error);
