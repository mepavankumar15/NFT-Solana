// mintDiffNftCollection.ts
import {
  create,
  fetchCollection,
  mplCore,
} from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  signerIdentity,
  createSignerFromKeypair,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { base58 } from "@metaplex-foundation/umi/serializers";
import fs from "fs";
import path from "path";

async function main() {
  const [collectionArg] = process.argv.slice(2);
  if (!collectionArg) throw new Error("❌ Provide COLLECTION_PUBKEY");

  const umi = createUmi("https://api.devnet.solana.com")
    .use(mplCore())
    .use(irysUploader({ address: "https://devnet.irys.xyz" }));

  // ✅ Load wallet.json
  const secret = JSON.parse(fs.readFileSync("./wallet.json", "utf8"));
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));

  console.log("✅ Using wallet:", signer.publicKey.toString());

  // ✅ Fetch collection (full object)
  const collectionPk = publicKey(collectionArg);
  const collection = await fetchCollection(umi, collectionPk);

  console.log("✅ Loaded Collection:", collectionPk.toString());

  // ✅ Load NFT images
  const nftDir = "./assets/nfts";
  const images = fs.readdirSync(nftDir).filter((f) => f.endsWith(".png"));

  if (images.length === 0) {
    throw new Error("❌ No PNG files found in ./assets/nfts");
  }

  console.log(`✅ Found ${images.length} images`);

  for (let i = 0; i < images.length; i++) {
    const fileName = images[i];
    const filePath = path.join(nftDir, fileName);

    const bytes = fs.readFileSync(filePath);
    const file = createGenericFile(bytes, fileName, {
      tags: [{ name: "Content-Type", value: "image/png" }],
    });

    // ✅ Upload image
    const [imageUri] = await umi.uploader.upload([file]);

    // ✅ Metadata
    const metadata = {
      name: `My NFT #${i + 1}`,
      description: "Minted into a Core collection.",
      image: imageUri,
      properties: {
        files: [{ uri: imageUri, type: "image/png" }],
        category: "image",
      },
    };

    const metadataUri = await umi.uploader.uploadJson(metadata);

    // ✅ Create new NFT keypair
    const asset = createSignerFromKeypair(
      umi,
      umi.eddsa.generateKeypair()
    );

    console.log(`\n🔄 Minting NFT #${i + 1} (${fileName})...`);

    // ✅ Correct CreateArgs for MPL-Core v1.7
    const tx = await create(umi, {
      asset,
      name: metadata.name,
      uri: metadataUri,
      collection,   // ✅ FULL OBJECT — CORRECT
    }).sendAndConfirm(umi);

    const sig = base58.deserialize(tx.signature)[0];

    console.log(`✅ Minted NFT #${i + 1}`);
    console.log(`Explorer TX: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
    console.log(
      `NFT: https://core.metaplex.com/explorer/${asset.publicKey}?env=devnet`
    );
  }

  console.log("\n✅✅✅ All NFTs minted into the collection ✅✅✅\n");
}

main().catch(console.error);
