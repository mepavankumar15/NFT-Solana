import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, fetchAssetsByOwner } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";

async function main() {
  const owner = publicKey("GN2Qoz9jurQbjPfhfeNkzEdmc9XaB4TZ2pTkLpFewqZm");

  const umi = createUmi("https://api.devnet.solana.com").use(mplCore());

  console.log("🔍 Fetching Core assets owned by:", owner.toString());

  const assets = await fetchAssetsByOwner(umi, owner);

  if (assets.length === 0) {
    console.log("❌ No NFTs found for this wallet.");
    return;
  }

  console.log("\n✅ FOUND", assets.length, "NFT(s):\n");
  for (const a of assets) {
    console.log("Asset:", a.publicKey.toString());
    console.log("Name:", a.name);
    console.log("---");
  }
}

main().catch(console.error);
