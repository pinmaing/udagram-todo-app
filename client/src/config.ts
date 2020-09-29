// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'bsktmuxjge'
export const apiEndpoint = `https://${apiId}.execute-api.ap-northeast-1.amazonaws.com/dev`

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map
  domain: 'dev-uda.us.auth0.com',            // Auth0 domain
  clientId: '2F3aLTRu7TUla9tB2a8RTONzctkHkxpe',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
