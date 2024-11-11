import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import * as apig from "aws-cdk-lib/aws-apigateway";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { generateBatch } from "../lambda/util";
import { games, gameCompanies } from "../seed/games";
import * as iam from 'aws-cdk-lib/aws-iam';

export class RestAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const userPoolId = cdk.Fn.importValue("UserPoolId");

    // Tables 
    const gamesTable = new dynamodb.Table(this, "GamesTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Games",
    });

    const gameCompanysTable = new dynamodb.Table(this, "GameCompanyTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "gameId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "companyName", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "GameCompany",
    });

    gameCompanysTable.addLocalSecondaryIndex({
      indexName: "founderIx",
      sortKey: { name: "founder", type: dynamodb.AttributeType.STRING },
    });
    // Functions 
    const getGameByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetGamesByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambda/getGameById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: gamesTable.tableName,
          REGION: 'us-east-1',
        },
      }
    );

    const getAllGamesFn = new lambdanode.NodejsFunction(
      this,
      "GetAllGamesFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambda/getAllGames.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: gamesTable.tableName,
          REGION: 'us-east-1',
        },
      }
    );

    const newGameFn = new lambdanode.NodejsFunction(this, "AddGameFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambda/addGame.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: gamesTable.tableName,
        USER_POOL_ID: userPoolId,
        REGION: "us-east-1",
      },
    });
    const deleteGameFn = new lambdanode.NodejsFunction(this, "DeleteGameFN", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambda/deleteGame.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: gamesTable.tableName,
        USER_POOL_ID: userPoolId,
        REGION: "us-east-1",
      },
    });
    const editGameFn = new lambdanode.NodejsFunction(this, "EditGameFN", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: `${__dirname}/../lambda/editGame.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: gamesTable.tableName,
        USER_POOL_ID: userPoolId,
        REGION: "us-east-1",
      },
    });

    const getGameCompaniesFn = new lambdanode.NodejsFunction(
      this,
      "GetGameCompanyFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambda/getGameCompany.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: gameCompanysTable.tableName,
          REGION: "us-east-1",
        },
      }
    );

    new custom.AwsCustomResource(this, "gamesddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [gamesTable.tableName]: generateBatch(games),
            [gameCompanysTable.tableName]: generateBatch(gameCompanies),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("gamesddbInitData"),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [gamesTable.tableArn, gameCompanysTable.tableArn],
      }),
    });

    gamesTable.grantReadData(getGameByIdFn)
    gamesTable.grantReadData(getAllGamesFn)
    gamesTable.grantReadWriteData(newGameFn)
    gamesTable.grantReadWriteData(deleteGameFn)
    gamesTable.grantReadWriteData(editGameFn);
    gameCompanysTable.grantReadData(getGameCompaniesFn);

    const api = new apig.RestApi(this, "RestAPI", {
      description: "demo api",
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    const gamesEndpoint = api.root.addResource("games");
    gamesEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAllGamesFn, { proxy: true })
    );

    gamesEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(newGameFn, { proxy: true })
    );
    const gameCompanieEndpoint = gamesEndpoint.addResource("companies");
    gameCompanieEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getGameCompaniesFn, { proxy: true })
    );
    const gameEndpoint = gamesEndpoint.addResource("{gameId}");
    gameEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getGameByIdFn, { proxy: true })
    );
    gameEndpoint.addMethod(
      "DELETE",
      new apig.LambdaIntegration(deleteGameFn, { proxy: true })
    );
    gameEndpoint.addMethod(
      "PUT",
      new apig.LambdaIntegration(editGameFn, { proxy: true })
    );
  }
}
