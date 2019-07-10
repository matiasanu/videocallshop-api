# videocallshop API

## Public tools and resources
### `BASE_URL`/videocallshop-api.json
JSON with API method definitions for `Advanced REST client` (https://install.advancedrestclient.com/install).

### `BASE_URL`/call-request.html
Client to enter in a waiting room as a client.

### `BASE_URL`/store-user.html
Client to loggin as a store user, watch the queue and performs store user actions.

## Utils
### dev URL
https://videocallshop-api-dev.herokuapp.com/

## API methods
### `GET` - `/`

Ping.

###### Auth
public

### `POST` - `/authentication/store`
Authenticate a store user.

###### Params
 - email
 - password

###### Auth
public

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 401 - Unauthorized.
- 200 - OK.

### `GET` - `/stores`
Get all the stores.

###### Auth
public

###### Status codes
- 200 - OK

### `GET` - `/stores/:storeId`
Get info of a particular store.

###### Auth
public

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 400 - Bad Request.
- 200 - OK.

### `POST` - `/stores/:storeId/call-requests`
Create a call request. It will automatically be added to the queue.

###### Params
- email
- lastName
- name

###### Auth
public

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 400 - Bad Request.
- 409 - Conflict. message: 'Email already in use.'
- 200 - OK.

###### Notes
Returns in a header Authorization a valid JWT Token for 2hs.

### `GET` - `/stores/:storeId/call-requests/:callRequestId`
Get a particular call request.

###### Auth
storeUser.thisStore || (callRequestToken.thisStore && callRequestToken.inQueue)

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 400 - Bad Request.
- 401 - Unauthorized.
- 200 - OK.

### `DELETE` - `/stores/:storeId/call-requests/:callRequestId`
Cancel a particular call request.

###### Auth
storeUser.thisStore || callRequestToken.thisStore && callRequestToken.thisCallRequest

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 400 - Bad Request.
- 401 - Unauthorized.
- 200 - OK.

### `GET` - `/stores/:storeId/waiting-room`
Get a waiting room.

###### Auth
storeUser.thisStore || callRequestToken.thisStore && callRequestToken.inQueue

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 400 - Bad Request.
- 401 - Unauthorized.
- 200 - OK.

### `WebSocket` - `/waiting-room-socket`
Connect with waiting room.

###### Events emitted
- `WAITING_ROOM_SENDED`: Emmit the hole waiting room for first time.
- `QUEUE_CHANGED`: Emmit only the queue.

###### Auth
storeUser.thisStore || (callRequestToken.thisStore && callRequestToken.inQueue)

###### Notes
Pass storeId query param.

### `POST` - `/stores/:storeId/calls`
Call a call request.

### Params
- callRequestId

###### Auth
storeUser.thisStore

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 400 - Bad Request.
- 401 - Unauthorized.
- 409 - Conflict. message: "You are already in call."
- 409 - Conflict. message: "Call request does not in queue."
- 200 - OK.

### `GET` - `/stores/:storeId/calls/:callId`
Get a particular call.

###### Auth
storeUser.thisStore || (callRequestToken.thisStore && callRequestToken.thisCall)

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 400 - Bad Request.
- 401 - Unauthorized.
- 200 - OK.

### `GET` - `/stores/:storeId/calls`
Get the calls from the store.

###### Auth
storeUser.thisStore

###### Status codes
- 422 - Unprocessable Entity: Bad params.
- 400 - Bad Request.
- 401 - Unauthorized.
- 200 - OK.