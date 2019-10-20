export const getPort = (): number => {
  const port = process.env.NODE_ENV === 'test' ? 4001 : 4000 ;
  return port;
}