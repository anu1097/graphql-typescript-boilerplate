import * as rp from 'request-promise';

export class TestClient {
  private url: string;
  private options: {
    jar: any,
    withCredentials: any,
    json: boolean
  }
  private mutation = (mutationName: string, email: string, password: string) => `
  mutation {
    ${mutationName}(email: "${email}", password: "${password}"){
      path
      message
    }
  }
  `

  private meQuery = `
  {
    me{
      id
      email
    }
  }
  `;

  private logoutMutation = `
  mutation{
    logout
  }
  `
  constructor(url: string) {
    this.url = url;
    this.options = {
      jar: rp.jar(),
      withCredentials: true,
      json: true
    }
  }

  loginClient = async (email: string, password: string) => {
    return rp.post(this.url, {
      ...this.options,
      body:
      {
        query: this.mutation("login", email, password)
      }
    })
  }
  registerClient = async (email: string, password: string) => {
    return rp.post(this.url, {
      ...this.options,
      body:
      {
        query: this.mutation("register", email, password)
      }
    })
  }

  logoutClient = async () => {
    return rp.post(this.url, {
      ...this.options,
      body:
      {
        query: this.logoutMutation
      }
    })
  }
  forgotPasswordChange = async (newPassword: string, key: string) => {
    return rp.post(this.url, {
      ...this.options,
      body:
      {
        query: `
        mutation{
          forgotPasswordChange(newPassword: "${newPassword}", key: "${key}"){
            path
            message
          }
        }
        `
      }
    })
  }

  meClient = async () => {
    return rp.post(this.url, {
      ...this.options,
      body:
      {
        query: this.meQuery
      }
    })
  }
}