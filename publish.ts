import { Sr25519Account } from "@unique-nft/sr25519";
import Sdk, { Options } from "@unique-nft/sdk";
import { Address } from "@unique-nft/utils";

const mnemonic = process.env.SUBSTRATE_MNEMONIC;
if (!mnemonic) throw new Error("SUBSTRATE_MNEMONIC env variable is not set");
const account = Sr25519Account.fromUri(mnemonic);
const sdk = new Sdk({
  baseUrl: "https://rest.unique.network/opal/v1",
  account,
});

const collectionId = Address.collection.addressToId(
  "0x17c4e6453cC49aAAAeACa894E6d9683E0000007f"
);

const tokensMintingResult = await sdk.token.createMultipleV2({
  collectionId,
  tokens: [
    {
      owner: "0xcafe52dae8874E9E6d7511e05d213590E47e97B6", // or Substrate address - it takes both
      name: "demo token",
      image:
        "https://bafkreigtgjjhukwsha4r3oxstegsozsvwbpoyqdes6bd62iptb7wz7qki4.ipfs.nftstorage.link/",
      attributes: [{ trait_type: "color", value: "YElLLow" }],
      royalties: [
        // optional, just example
        { address: sdk.options.account?.address!, percent: 5 },
        {
          address: "0xcafe52dae8874E9E6d7511e05d213590E47e97B6",
          percent: 0.99,
        },
      ],
    },
  ],
});
if (!tokensMintingResult.parsed) {
  throw tokensMintingResult.error;
}
const tokenIds = tokensMintingResult.parsed.map(({ tokenId }) => tokenId);
