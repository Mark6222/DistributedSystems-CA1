import { marshall } from "@aws-sdk/util-dynamodb";
import { Game, GameCompany } from "./types";

type Entity = Game | GameCompany;
export const generateItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
    },
  };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
  });
};
