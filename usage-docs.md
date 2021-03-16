# The Platform SDK: A JavaScript Library for ParallelScore.io Admins

- This SDK contains useful functions for everyday Admin-level activites. 
- As an admin, it allows you to easily integrate your existing code with common Platform services

## About this Documentation

These docs contain examples you can use as references on how to call the Platform API from your JavaScript code using this SDK. You will find the examples partitioned by common actions.


### 1. Reading a User's Profile

```javascript 

// pass in the username, app and secure ADMIN_TOKEN

let reader = new ProfileReader('adawodu27@gmail.com', 'snapfill', ADMIN_TOKEN);
await reader.newPageReadToken()

// get the response
let response = await reader.readProfile();

// example response

{
  code: 200,
  message: 'user_id,userdata attached',
  data: {
    user_id: '255bc8dcb81c33095147bab41c504db9',
    userdata: {
      profile_image: null,
      email: 'N/A',
      first_name: 'adebayo',
      last_name: ' ',
      profile_name: 'adebayo  ',
      demo: [Object],
      live: [Object],
      username: 'adawodu27@gmail.com',
      source: 'N/A',
      uploads: [Object],
      signup_data: [Object],
      current_nonce_base: 1287741274,
      security: [Object]
    }
  }
}
```

### 2. Generating a User Token

```javascript 

// pass in the username, app and secure ADMIN_TOKEN

let token_device = new TokenGenerator('adawodu27@gmail.com', 'snapfill', ADMIN_TOKEN);

// get the token

let token = await token_device.generateNewToken();

// example token

234368911868
```

### 3. Creating a connection to the Platform

```javascript
// pass app, username and secure ADMIN_TOKEN to initialize a connection

let connection = new PlatformConnection('snapfill', 'adawodu27@gmail.com', ADMIN_TOKEN);

// a connection object can be reused by updating the username and app (a session token is returned)

let sessionToken = await connection.updateSession('makavelli9@peace.net', 'good_deeds');

```

### 4. Signing up to an app on the Platform

```javascript
// create a connection with app and username

let connection = new PlatformConnection('snapfill', 'adawodu1615623869430@gmail.com', ADMIN_TOKEN);

// Signup by passing firstName, lastName and Password

let signupResponse = await connection.signup("Bayo", "Dawodu", "12345GheeZA$")

// sample successful response

{
  username: 'adawodu1615623869430@gmail.com',
  role: 'user',
  loggedIn: false,
  user_id: '2c64fea090ce70cfab7ae43c29608c23',
  userdata: {
    profile_image: null,
    email: 'N/A',
    first_name: 'Bayo',
    last_name: 'Dawodu',
    profile_name: 'Bayo Dawodu',
    demo: {
      demo_account_id: 'Demo-35853782',
      messages: [],
      notifications: []
    },
    live: {
      live_account_id: 'Live-28416374',
      messages: [],
      notifications: []
    },
    username: 'adawodu1615623869430@gmail.com',
    source: 'platform',
    uploads: { A: [], B: [], C: [], D: [], E: [], F: [], G: [] },
    signup_data: {
      username: 'adawodu1615623869430@gmail.com',
      first_name: 'Bayo',
      last_name: 'Dawodu',
      source: 'platform',
      role: 'user'
    },
    current_nonce_base: 2785886494,
    security: { '2785886494': [Object] }
  },
  password: 'e9daaf9323fade687bbec13b461c909fbde90472d60b202683f542abf1064794',
  'snapfill-user_id': 'ff69400902d9af4358b6f4ed1ef45f1a'
}

```

### 5. Login to existing connection

```javascript
// supply password to login to an existing connection (will return updated user profile)

let updatedProfile = await connection.login("12345GheeZA$");

// sample response
{
  code: 200,
  message: 'profile attached',
  data: {
    profile: {
      username: 'adawodu1615625058479@gmail.com',
      role: 'user',
      loggedIn: true,
      user_id: '06634b8b29000a931c55ffe4251f2f18',
      'snapfill-user_id': '68be4ef7b392fcd880fd8fc82a9b1ab3',
      __created_at__: 1615625063,
      __updated_at__: null,
      __private__: 0,
      row_id: 1,
      userdata: [Object],
      password: 'e9daaf9323fade687bbec13b461c909fbde90472d60b202683f542abf1064794',
      'snapfill-userdata-43278d1788bac1ce966d1e055d3b3820c0761e665bfa02b7e6bea4517ca6777c_id': '843b908e643b5cacbf7720d6ec83faa8'
    }
  }
}
```

### 6. Logout from existing connection

```javascript
// call the logout method on the connection

await connection.logout();

// sample response
{
     code: 200, 
     message: 'User logged out', 
     data: {
          loggedIn: false 
     } 
}
```

### 7. Change user password

```javascript
// pass old password and new password

await connection.changePassword("12345GheeZA$", "ZLATAN33GheeZA$");

// sample response
{
     code: 200, 
     message: 'Password changed successfully', 
     data: {} 
}
```

### 8. View the user's profile

```javascript
// simply call the viewProfile method on the connection

await connection.viewProfile();

// to reload the profile after an action, say upload, then pass reload=true

await connection.viewProfile(reload=true);


// sample response
{
  username: 'adawodu1615630578363@gmail.com',
  role: 'user',
  loggedIn: false,
  user_id: '8f462195f2185f18d496b1ce12baf4e4',
  'snapfill-user_id': '28a358ea500ece50e86b86084c02bb67',
  __created_at__: 1615630582,
  __updated_at__: null,
  __private__: 0,
  row_id: 1,
  userdata: {
    profile_image: null,
    email: 'N/A',
    first_name: 'Bayo',
    last_name: 'Dawodu',
    profile_name: 'Bayo Dawodu',
    demo: {
      demo_account_id: 'Demo-13665769',
      messages: [],
      notifications: []
    },
    live: {
      live_account_id: 'Live-43837746',
      messages: [],
      notifications: []
    },
    username: 'adawodu1615630578363@gmail.com',
    source: 'platform',
    uploads: { A: [], B: [], C: [], D: [], E: [], F: [], G: [] },
    signup_data: {
      username: 'adawodu1615630578363@gmail.com',
      first_name: 'Bayo',
      last_name: 'Dawodu',
      source: 'platform',
      role: 'user'
    },
    current_nonce_base: 7716495122,
    security: { '7944938746': [Object], '7716495122': [Object] }
  },
  password: 'e9daaf9323fade687bbec13b461c909fbde90472d60b202683f542abf1064794',
  'snapfill-userdata-7614a98d7b8790bca9f6a0a28e19104c3204af1023750d7424055080b1e48958_id': 'c93af0d224e56939964adfb1d07b6e65'
}
```

### 9. Uploading documents

```javascript
/*
    uploading documents on the active connection object involves declaring a number of things:

    - the drive (bucket code) you are uploading to. Current options are A-F
    - the virtualLocation of your object in the media space
    - the virtualCategory of your object in the media space
    - the vitualIdentifier (unique key) of your object in the media space
    - every upload must send a JSON document and may have media attachments; for the document, you will provide a docKey (short descriptor) as well as the doc object itself.
    - any multimedia attachments are included as an array of the actual filePaths of the attachments
*/

await connection.uploadDocuments('F', 'wallet', 'debitCards', 'debitCard001', 'paymentInstrument', {
        documentNumber : 103,
        documentReference : '6326387263826398'
    }, ['/Users/ps2020-01/Downloads/stock-app-photo.png'])

// sample response
{
     code: 200, 
     message: 'streaming attempt completed', 
     data: {} 
}
```

### 10. Downloading documents

```javascript
// currently we only provide bulk download of a user's data in the current connection context 

await connection.downloadDocuments()

// sample response
{
  data: [
    {
      upload_json: [Object],
      category: 'wallet::debitCards',
      about: 'debitCard001',
      location: 'forms',
      x_media_id: 'new snapfill message#8657638311342819 for adawodu1615669529493@gmail.com',
      x_tag: 'platform-message-snapfill',
      sessionInfo: [Object],
      insecure: true,
      send_to: 'anonymous',
      serial: '221f4be7b61da2883ba956db84728cfa',
      context: 'snapfill'
    }
  ],
  message: 'OK',
  code: 200
}
```