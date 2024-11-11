## Serverless REST Assignment - Distributed Systems.

__Name:__ ....Mark Hogan.....

__Demo:__ ... (https://drive.google.com/file/d/189Y76LbeJ1mhx0zZ3y7Pmc1YXEc5Ash0/view?usp=sharing) ......

### Context.

Ive chosen to do a Games and the different game companys related to each game

### App API endpoints.
 
+ POST /prod/auth/signup.
+ POST /prod/auth/confirm_signup
+ POST /prod/auth/signin
+ GET /dev/games?language=fr
+ GET /dev/games/3?language=en
+ GET /dev/games/companies?gameId=1&founder=Andy
+ DELETE /dev/games/1
+ POST /dev/games/1
+ PUT /dev/games/1


### Update constraint (if relevant).

- Only Users with who have signed in can Add, Update or delete games by using the token givin. The token is checked and verified by passing the userpool id from the auth stack into the rest api stack and is then verified.

### Translation persistence (if relevant).

it translates depending on the query param you pass the description of the GetAllGames and GetGameById

###  Extra (If relevant).

Ive added the ability to delete and update a game. 
Ive also added translation option using query params on getaallgames and getGameById.
Ive also done a multi stack by having auth stack and rest stack and using cdk.CfnOutput() to pass the userpool ID from the auth stack to the rest api stack
