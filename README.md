# videocallshop API

## public tools and resources
### `BASE_URL`/videocallshop-api.json
JSON with API method definitions for `Advanced REST client` (https://install.advancedrestclient.com/install).

### `BASE_URL`/client.html
Tool to enter in a waiting room as a client.

### `BASE_URL`/store.html
Tool to loggin as a store user and watch the queue.

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

### `GET` - `/store`
Get all the stores.

###### Auth
public

### `GET` - `/store/:storeId`
Get info of a store.

###### Auth
public

### `POST` - `/store/:storeId/waiting-room`
Enter as a client in a waiting room.

###### Params
- email
- lastName
- name

###### Auth
public

###### Desc
Returns in a header Authorization a valid JWT Token for 2hs.

### `GET` - `/store/:storeId/waiting-room`
Get a waiting room.

###### Auth
isClientInQueueOrStoreUserOwner

### `GET` - `/store/:storeId/waiting-room/:waitingRoomRequestId`
Get a particular request.

###### Auth
isClientInQueueOrStoreUserOwner

### `DELETE` - `/store/:storeId/waiting-room/:waitingRoomRequestId`
Remove client from the queue.

###### Auth
isClientOwnerOrStoreUserOwner

### `DELETE` - `/store/:storeId/waiting-room`
Empty queue.

###### Auth
isStoreUserOwner