import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json";
import {
    CookieMap,
    parseCookies,
    verifyToken,
    JwtToken,
  } from "./util";
const ajv = new Ajv();
const isValidBodyParams = ajv.compile(schema.definitions["Game"] || {});

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
        console.log("[EVENT]", JSON.stringify(event));

        const cookies: CookieMap = parseCookies(event);
        if (!cookies) {
          return {
            statusCode: 200,
            body: "Unauthorised request!!",
          };
        }
      
        const verifiedJwt: JwtToken = await verifyToken(
          cookies.token,
          process.env.USER_POOL_ID,
          process.env.REGION!
        );
        console.log(JSON.stringify(verifiedJwt));
        if (!verifiedJwt) {
          return {
            statusCode: 404,
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              Message: "Invalid Token",
            }),
          };
        }
        
        const parameters = event?.pathParameters;
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

        const commandOutput = await ddbDocClient.send(
            new DeleteCommand({
                TableName: process.env.TABLE_NAME,
                Key: { id: gameId },
                ReturnValues: "ALL_OLD",
            })
        );
        
        console.log("DeleteCommand response: ", commandOutput);
        
        if (!commandOutput.Attributes) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ Message: "Invalid game Id" }),
            };
        }
        // Return Response
        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ Message: "Game deleted successfully", deletedItem: commandOutput.Attributes }),
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