import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));

    const body = event.body ? JSON.parse(event.body) : undefined;
    if (!body) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }
    const { id, title, releaseYear, genre, description } = body;

    const parameters  = event?.pathParameters;
    const gameId = parameters?.gameId ? parseInt(parameters.gameId) : undefined;

    if (!gameId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Missing game Id" }),
      };
    }

    const updateCommandOutput = await ddbDocClient.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { id },
          UpdateExpression: "set #title = :title, #releaseYear = :releaseYear, #genre = :genre, #description = :description",
          ExpressionAttributeNames: {
            "#title": "title",
            "#releaseYear": "releaseYear",
            "#genre": "genre",
            "#description": "description"
          },
          ExpressionAttributeValues: {
            ":title": title,
            ":releaseYear": releaseYear,
            ":genre": genre,
            ":description": description
          },
          ReturnValues: "ALL_NEW",
        })
      );
    // Return Response
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        message: "Game updated successfully",
        updatedItem: updateCommandOutput.Attributes,
      }),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
