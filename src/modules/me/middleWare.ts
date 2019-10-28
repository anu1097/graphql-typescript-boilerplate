import { Resolver } from './../../types/graphql-utils';

export default async (
  resolver: Resolver,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  //user not logged in
  if(!context.session || !context.session.userId){
    return null;
  } 
  const response = await resolver(parent, args, context, info);
  return response;
} 