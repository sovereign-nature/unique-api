import { Sr25519Account } from "@unique-nft/utils/sr25519";
import Sdk, { PropertyPermission } from "@unique-nft/sdk";
import * as dotenv from "dotenv";

dotenv.config();

// man picture (medium size png)
const IMAGE_URL =
  "https://real.myfilebase.com/ipfs/QmVQgYDk7655Tu2nKtbky4pcJV34Kg4NDrVW48jYJZTasC";

const getLinkToCollection = (sdk: Sdk, collectionId: number) => {
  return `${sdk.options.baseUrl}/collections/v2?collectionId=${collectionId}`;
};

const getLinkToToken = (sdk: Sdk, collectionId: number, tokenId: number) => {
  return `${sdk.options.baseUrl}/tokens/v2?collectionId=${collectionId}&tokenId=${tokenId}`;
};

const PERMISSION_COLLECTION_ADMIN = {
  mutable: true,
  collectionAdmin: true,
  tokenOwner: false,
} satisfies PropertyPermission;

const createCollection = async (sdk: Sdk): Promise<number> => {
  const collectionCreationResult = await sdk.collection.createV2({
    name: "DOTphin Proofs",
    description:
      "Embark on a trailblazing journey with the DOTphin Proofs collection – your gateway to evolving your DOTphin NFT.",
    symbol: "DOTPP",
    cover_image: { url: IMAGE_URL },
    potential_attributes: [
      { trait_type: "element", values: ["air", "earth", "water"] },
      { trait_type: "eventId" },
      { trait_type: "eventURL" },
      { trait_type: "country" },
      { trait_type: "city" },
      { trait_type: "virtualEvent" },
      { trait_type: "startDate" },
      { trait_type: "endDate" },
      { trait_type: "proofOf" },
    ],
  });

  if (!collectionCreationResult.parsed) {
    throw collectionCreationResult.error;
  }
  const collectionId = collectionCreationResult.parsed.collectionId;

  console.log(
    `Collection created, id ${collectionId}. ${getLinkToCollection(
      sdk,
      collectionId
    )}`
  );

  return collectionId;
};

const mintTokens = async (sdk: Sdk, collectionId: number) => {
  const tokensMintingResult = await sdk.token.createMultipleV2({
    collectionId,
    tokens: [
      {
        owner: "0xB8A976Ad1d87D070b5E5806B98A768B4BB4E4847",
        name: "demo token",
        image: IMAGE_URL,
        attributes: [{ trait_type: "color", value: "YElLLow" }],
        royalties: [
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

  console.log(
    `Tokens minted in collection ${collectionId}, ids ${tokenIds.join(", ")}`
  );
  for (const tokenId of tokenIds) {
    console.log(`${getLinkToToken(sdk, collectionId, tokenId)}`);
  }

  return tokenIds;
};

const main = async () => {
  // init substrate account and sdk
  const mnemonic = process.env.SUBSTRATE_MNEMONIC;
  if (!mnemonic) throw new Error("SUBSTRATE_MNEMONIC env variable is not set");
  const account = Sr25519Account.fromUri(mnemonic);

  console.log("Account address:", account.address);

  const sdk = new Sdk({
    baseUrl: "https://rest.unique.network/unique/v1",
    account,
    waitBetweenStatusRequestsInMs: 5000,
  });

  const collectionId = await createCollection(sdk);
  console.log("Collection created:", collectionId);

  // const tokenIds = await mintTokens(sdk, 3019);

  // console.log(await sdk.common.getNonce({ address: account.address }));

  // console.log("Tokens minted:", tokenIds);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    if (typeof error === "object" && error !== null) {
      if (error.isAxiosError === true) {
        const url =
          error.response?.request?.res?.responseUrl || error.config?.url;
        console.log({ ...error.response?.data, url });
        if (error.details) {
          console.dir(error.details, { depth: 100 });
        }
      } else {
        if (error.details) {
          console.log(error.toString());
          console.dir(error.details, { depth: 100 });
        } else {
          console.error(error);
        }
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  });
