// tslint:disable
// graphql typescript definitions

export namespace GQL {
interface IGraphQLResponseRoot {
data?: IQuery | IMutation;
errors?: Array<IGraphQLResponseError>;
}

interface IGraphQLResponseError {
/** Required for all errors */
message: string;
locations?: Array<IGraphQLResponseErrorLocation>;
/** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
[propName: string]: any;
}

interface IGraphQLResponseErrorLocation {
line: number;
column: number;
}

interface IQuery {
__typename: "Query";
dummy: string | null;
bye2: string | null;
hi: string | null;
me: IUser | null;
bye: string | null;
hello: string | null;
}

interface IHelloOnQueryArguments {
name?: string | null;
}

interface IUser {
__typename: "User";
id: string;
email: string;
}

interface IMutation {
__typename: "Mutation";
sendForgotPasswordLink: boolean | null;
setNewPassword: Array<IError> | null;
login: Array<IError> | null;
logout: boolean | null;
register: Array<IError> | null;
}

interface ISendForgotPasswordLinkOnMutationArguments {
email: string;
}

interface ISetNewPasswordOnMutationArguments {
newPassword: string;
key: string;
}

interface ILoginOnMutationArguments {
email: string;
password: string;
}

interface IRegisterOnMutationArguments {
email: string;
password: string;
}

interface IError {
__typename: "Error";
path: string;
message: string;
}
}

// tslint:enable
